/**
 * Cloudflare Web Analytics.
 *
 * Cookieless, so there is nothing to ask visitors to consent to, and the token
 * is public by design - it only identifies which site a page view belongs to.
 *
 * Paste the token from the Cloudflare dashboard below. While it is empty the
 * beacon is never loaded at all, so the site can ship without one.
 * Cloudflare dashboard -> Analytics & Logs -> Web Analytics -> Manage site.
 */
const CF_BEACON_TOKEN = ''

/**
 * Load the beacon, in production only.
 *
 * Route changes need no handling here: the beacon patches history.pushState
 * and listens for popstate, so it follows the router on its own.
 */
export function initAnalytics(): void {
  if (!CF_BEACON_TOKEN) return

  // Without this every `npm run dev` reload would land in the club's numbers.
  if (!import.meta.env.PROD) return

  // A second copy would double-count, and hot reloads can call this twice.
  if (document.querySelector('script[data-cf-beacon]')) return

  const script = document.createElement('script')
  script.type = 'module'
  script.src = 'https://static.cloudflareinsights.com/beacon.min.js'
  script.setAttribute('data-cf-beacon', JSON.stringify({ token: CF_BEACON_TOKEN }))
  document.head.appendChild(script)
}
