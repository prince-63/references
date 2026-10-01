/**
 * Safely extracts environment variables, stripping quotes and ensuring valid absolute URLs.
 */
export const getEnvVariable = (key: string, defaultValue: string = ''): string => {
  const value = process.env[key]
  if (!value) return defaultValue

  // Remove literal single or double quotes at the start and end (common in .env files)
  return value.replace(/^['"]|['"]$/g, '').trim()
}

/**
 * Ensures the given URL string is absolute and doesn't have trailing slashes that might cause double-slashes when appending paths.
 */
export const sanitizeBaseUrl = (url: string): string => {
  if (!url) return ''
  // Strip trailing slashes
  return url.replace(/\/+$/, '')
}

export const getLocalAppOrigin = (): string => {
  if (process.env.NODE_ENV !== 'development' || typeof window === 'undefined') return ''

  const localHostnames = ['localhost', '127.0.0.1', '0.0.0.0', '::1', '[::1]']
  if (!localHostnames.includes(window.location.hostname)) return ''

  return sanitizeBaseUrl(window.location.origin)
}

export const getAppBaseUrl = (): string => {
  return getLocalAppOrigin() || sanitizeBaseUrl(getEnvVariable('REACT_APP_BASE_APP_URL'))
}
