/**
 * Normalising identifiers on the way in.
 *
 * League is free text in five admin forms, so '10u', '10U' and '10 U' could all
 * be created as separate teams by a typo - splitting a roster, a schedule and a
 * set of stats across identities that look identical on screen. Normalising at
 * the API boundary means every write agrees on one spelling, whichever form it
 * came from.
 */

/** '  10u ' -> '10U'. Returns null for empty input so NOT NULL columns still complain. */
function normalizeLeague(value) {
  if (value === null || value === undefined) return null

  const cleaned = String(value).trim().replace(/\s+/g, '').toUpperCase()
  return cleaned.length ? cleaned : null
}

/** ' fall ' -> 'Fall'. Seasons are a small closed set, so casing is all that varies. */
function normalizeSeason(value) {
  if (value === null || value === undefined) return null

  const cleaned = String(value).trim().replace(/\s+/g, ' ')
  if (!cleaned.length) return null

  return cleaned
    .toLowerCase()
    .replace(/(^|\s)([a-z])/g, (_, lead, letter) => lead + letter.toUpperCase())
}

/** Years arrive as strings from form posts. Returns null rather than NaN. */
function normalizeYear(value) {
  if (value === null || value === undefined || value === '') return null

  const parsed = Number(value)
  return Number.isInteger(parsed) ? parsed : null
}

module.exports = { normalizeLeague, normalizeSeason, normalizeYear }

// Fields that identify a team or a season, wherever they appear.
const FIELD_NORMALIZERS = {
  league: normalizeLeague,
  head_coach_league: normalizeLeague,
  season: normalizeSeason,
  head_coach_season: normalizeSeason,
  year: normalizeYear,
  head_coach_year: normalizeYear,
}

function normalizeObject(target) {
  if (!target || typeof target !== 'object') return

  for (const [field, normalize] of Object.entries(FIELD_NORMALIZERS)) {
    if (Object.prototype.hasOwnProperty.call(target, field)) {
      target[field] = normalize(target[field])
    }
  }
}

/**
 * Express middleware normalising these fields on every request body and query
 * string, so no individual route has to remember to do it.
 *
 * Note: multipart bodies are parsed by multer after this runs, so routes
 * handling file uploads normalise their own fields.
 */
function normalizeIdentifiers(req, res, next) {
  normalizeObject(req.body)

  // Express 5 exposes req.query through a getter that rebuilds the object on
  // each access, so mutating it in place is discarded. Replace it instead.
  const query = { ...req.query }
  normalizeObject(query)
  Object.defineProperty(req, 'query', {
    value: query,
    writable: true,
    configurable: true,
    enumerable: true,
  })

  next()
}

module.exports.normalizeObject = normalizeObject
module.exports.normalizeIdentifiers = normalizeIdentifiers
