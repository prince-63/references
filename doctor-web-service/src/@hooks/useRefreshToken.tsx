import refreshToken from '@utils/refreshToken'
import {useEffect} from 'react'
import {getStorageType} from 'utils/storage'

const useRefreshToken = () => {
  useEffect(() => {
    // Check the last refresh time
    const lastRefreshTime = getStorageType().getItem('lastRefreshTime')
    if (lastRefreshTime) {
      const lastRefreshDate = new Date(lastRefreshTime)
      const now = new Date()
      const hoursSinceLastRefresh = (now.getTime() - lastRefreshDate.getTime()) / (1000 * 60 * 60)

      // If it's been more than 23 hours since the last refresh, refresh the token immediately
      if (hoursSinceLastRefresh >= 23) {
        refreshToken()
      }
    } else {
      // If there's no last refresh time, refresh the token immediately
      refreshToken()
    }

    // Set up an interval to refresh the token every 23 hours
    const intervalId = setInterval(
      () => {
        refreshToken()
      },
      23 * 60 * 60 * 1000
    ) // 23 hours in milliseconds

    // Clean up the interval on component unmount
    return () => clearInterval(intervalId)
  }, [])
}

export default useRefreshToken
