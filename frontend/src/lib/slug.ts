/**
 * A player's name as it appears in a link: "Jake O'Brien" -> "jake-obrien".
 *
 * Must match backend/lib/slug.js, which looks the player up by the same slug.
 */
export function playerSlug(name: string): string {
  return String(name || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // accents: José -> Jose
    .toLowerCase()
    .replace(/['’.]/g, '') // O'Brien -> obrien, Jr. -> jr
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
