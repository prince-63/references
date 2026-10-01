export function cleanAddress(
  address: string | null | undefined,
  city?: string | null,
  state?: string | null,
  country?: string | null,
  pincode?: string | null
): string {
  if (!address) return '' // if address is null, just return empty string

  let cleaned = address

  const patterns = [city, state, country, pincode].filter(Boolean) as string[]

  patterns.forEach((pattern) => {
    // remove the pattern with surrounding commas/spaces
    const regex = new RegExp(`,?\\s*${pattern}\\s*`, 'gi')
    cleaned = cleaned.replace(regex, '')
  })

  cleaned = cleaned
    .replace(/,\s*,/g, ',') // repeated commas
    .replace(/\s{2,}/g, ' ') // multiple spaces
    .replace(/^,|,$/g, '') // trim commas at start/end
    .trim()

  return cleaned
}
