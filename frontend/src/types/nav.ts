export interface NavLink {
  label: string
  to?: string
  children?: NavLink[]
  highlight?: boolean
}
