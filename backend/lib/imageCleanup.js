const path = require('path')
const fs = require('fs/promises')

// Every table/column that can point at a file in the uploads folder.
// Add new ones here and both the route cleanup and the orphan sweep pick them up.
const IMAGE_REFERENCES = [
  { table: 'news', column: 'image_path' },
  { table: 'swag', column: 'image_path' },
  { table: 'players', column: 'photo_path' },
  { table: 'uniform', column: 'image_path' },
]

const UPLOADS_DIR = path.join(__dirname, '..', 'public', 'uploads', 'news')

/**
 * Resolve a stored image_path to an absolute path inside the uploads dir.
 * Returns null for anything that isn't a local upload we own: external URLs,
 * empty values, or paths that try to escape the uploads folder.
 */
function resolveUploadPath(imagePath) {
  if (!imagePath || typeof imagePath !== 'string') return null
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(imagePath)) return null // http://, https://, data:, etc.

  // Stored paths look like "/uploads/news/<file>". Accept that and a bare
  // filename; reject anything else rather than silently coercing it, so a
  // malformed or hostile value can never name a file we didn't write.
  const normalised = imagePath.replace(/\\/g, '/').replace(/^\/+/, '')
  if (normalised.includes('..')) return null

  const dir = path.posix.dirname(normalised)
  if (dir !== '.' && dir !== 'uploads/news') return null

  const filename = path.posix.basename(normalised)
  if (!filename) return null

  const resolved = path.resolve(UPLOADS_DIR, filename)
  // Belt and braces: the result must sit directly in UPLOADS_DIR.
  if (path.dirname(resolved) !== path.resolve(UPLOADS_DIR)) return null

  return resolved
}

/** Count rows across all tables still pointing at this filename. */
async function countReferences(db, imagePath) {
  const filename = path.basename(imagePath)
  let total = 0

  for (const { table, column } of IMAGE_REFERENCES) {
    const row = await db.get(
      `SELECT COUNT(*) AS n FROM ${table} WHERE ${column} IS NOT NULL AND ${column} LIKE ?`,
      `%${filename}`
    )
    total += row.n
  }

  return total
}

/**
 * Delete an uploaded file, but only if no row in any table still references it.
 * Call this AFTER the row has been deleted/updated so the count reflects reality.
 * Never throws - a failed cleanup must not fail the user's request.
 */
async function deleteImageIfUnused(db, imagePath) {
  const target = resolveUploadPath(imagePath)
  if (!target) return false

  try {
    if (await countReferences(db, imagePath) > 0) return false
    await fs.unlink(target)
    return true
  } catch (err) {
    if (err.code !== 'ENOENT') {
      console.error(`image cleanup failed for ${imagePath}:`, err.message)
    }
    return false
  }
}

/** Every filename referenced by any row, as a Set of basenames. */
async function collectReferencedFilenames(db) {
  const referenced = new Set()

  for (const { table, column } of IMAGE_REFERENCES) {
    const rows = await db.all(
      `SELECT ${column} AS p FROM ${table} WHERE ${column} IS NOT NULL AND ${column} != ''`
    )
    for (const { p } of rows) referenced.add(path.basename(p))
  }

  return referenced
}

module.exports = {
  IMAGE_REFERENCES,
  UPLOADS_DIR,
  resolveUploadPath,
  deleteImageIfUnused,
  collectReferencedFilenames,
}
