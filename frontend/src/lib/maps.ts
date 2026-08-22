/**
 * Turn a schedule entry's whereabouts into a Google Maps link.
 *
 * Two fields are in play. `location` is what people read - "Central Park #4" -
 * and is no use to a maps search on its own: left alone it finds the Central
 * Park in Manhattan. `address` is the street address typed into the admin for
 * a game, and is what the link should point at whenever it is there.
 *
 * With no address to go on, the location name is anchored to the club's area
 * so the search at least lands in the right county. That is a guess bolted
 * onto a nickname - filling in the address field is what makes it exact.
 */
const REGION = 'Independence, KY'

/** Already says where it is: names a state, or carries a 5-digit ZIP. */
function isSpecific(text: string): boolean {
  return /\bKY\b|\bKentucky\b|\bOH\b|\bOhio\b|\b\d{5}\b/i.test(text)
}

export function mapsQuery(location: string | null, address?: string | null): string {
  const addr = address?.trim()
  if (addr) return addr

  const name = (location || '').trim()
  return isSpecific(name) ? name : `${name}, ${REGION}`
}

export function mapsUrl(location: string | null, address?: string | null): string {
  const query = mapsQuery(location, address)
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
}
