/**
 * Turn a schedule location into a Google Maps link.
 *
 * Locations are free text typed in the admin, and in practice they are local
 * shorthand - "Central Park #4", "KCYS Field 2" - not addresses. Handed to
 * Maps as-is, "Central Park #4" finds the one in Manhattan, so anything that
 * does not already say where it is gets anchored to the club's area first.
 *
 * The anchor is a guess bolted onto a nickname; a location that still lands in
 * the wrong place wants its full street address typed into the admin, which
 * this function then leaves alone.
 */
const REGION = 'Independence, KY'

/** Already says where it is: names a state, or carries a 5-digit ZIP. */
function isSpecific(location: string): boolean {
  return /\bKY\b|\bKentucky\b|\bOH\b|\bOhio\b|\b\d{5}\b/i.test(location)
}

export function mapsUrl(location: string): string {
  const query = isSpecific(location) ? location : `${location}, ${REGION}`
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
}
