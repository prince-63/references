import {useState, useEffect} from 'react'

const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [networkType, setNetworkType] = useState<string | null>(null)

  useEffect(() => {
    const updateStatus = () => {
      setIsOnline(navigator.onLine)
      if ('connection' in navigator) {
        setNetworkType((navigator.connection as any).effectiveType)
      }
    }

    window.addEventListener('online', updateStatus)
    window.addEventListener('offline', updateStatus)

    if ('connection' in navigator) {
      ;(navigator.connection as any).addEventListener('change', updateStatus)
    }

    updateStatus()

    return () => {
      window.removeEventListener('online', updateStatus)
      window.removeEventListener('offline', updateStatus)
      if ('connection' in navigator) {
        ;(navigator.connection as any).removeEventListener('change', updateStatus)
      }
    }
  }, [])

  return {isOnline, networkType}
}
export default useNetworkStatus
