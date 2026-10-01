/**
 * Get the appropriate storage type based on the view type
 * @returns {Storage} The storage object to use (localStorage or sessionStorage)
 */
export const getStorageType = (): Storage => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage
    }
  } catch (error) {
    // Fallback to mock storage if localStorage access throws
  }
  return {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {},
    key: () => null,
    length: 0,
  } as unknown as Storage
}
