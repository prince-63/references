/**
 * Check if the current view is the app view
 * @returns {boolean} True if the current view is the app view
 */
export const isAppView = (): boolean => {
  // First check for the injected flag from native app
  if (typeof window !== 'undefined' && (window as any).isAppWebView === true) {
    return true
  }

  // Fallback to user agent check
  const userAgent = window.navigator.userAgent.toLowerCase()
  return userAgent.includes('mobile') || userAgent.includes('android') || userAgent.includes('ios')
}
