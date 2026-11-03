/**
 * A player's name as it appears in a link: "Jake O'Brien" -> "jake-obrien".
 *
 * Stats are stored under the name from the GameChanger export, with nothing
 * else tying one season to the next, so the slug is what joins a player's
 * seasons together. frontend/src/lib/slug.ts must produce the same output.
 */
function playerSlug(name) {
  return String(name || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // accents: José -> Jose
    .toLowerCase()
    .replace(/['’.]/g, '') // O'Brien -> obrien, Jr. -> jr
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

module.exports = { playerSlug }
