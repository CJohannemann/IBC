/**
 * Where to find the club away from the site.
 *
 * Add a platform by filling in its url. An entry with an empty url is skipped
 * everywhere, so an account that is set up but not announced yet - or one that
 * has been taken down - never renders as a dead link.
 */
export interface SocialLink {
  name: string
  url: string
  /** One filled path on a 24x24 viewBox, so every icon sits on the same grid. */
  path: string
}

export const socialLinks: SocialLink[] = [
  {
    name: 'Facebook',
    url: '',
    path:
      'M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 ' +
      '0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 ' +
      '26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 ' +
      '0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 ' +
      '1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 ' +
      '5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z',
  },
]

/** Only the platforms that actually have somewhere to point at. */
export function activeSocialLinks(): SocialLink[] {
  return socialLinks.filter((link) => link.url.trim().length > 0)
}
