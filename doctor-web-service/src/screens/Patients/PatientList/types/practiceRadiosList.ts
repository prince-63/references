export default [
  {
    value: 'ALL',
    label: 'Show all',
  },
  {
    value: 'UNASSIGNED',
    label: 'Show unassigned',
  },
  {
    value: 'ASSIGNED',
    label: 'Show assigned',
  },
] as {
  label: string
  value: 'ALL' | 'UNASSIGNED' | 'ASSIGNED' | 'BY_PROFILE_ID'
}[]
