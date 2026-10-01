import {useEffect, useState} from 'react'
import {useNavigate} from 'react-router-dom'

type RouterPath = {
  pathname?: string
  search?: string
  hash?: string
  state?: unknown
  key?: string
}
import {getStorageType} from 'utils/storage'

// Custom hook to prompt the user before navigating away
export default (shouldBlock: boolean, setShouldBlock: (value: boolean) => void) => {
  const navigate = useNavigate()
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [nextLocation, setNextLocation] = useState<string | Partial<RouterPath>>('')

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!shouldBlock) return
      e.preventDefault()
      getStorageType().setItem('defaultRoute', '/')
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [shouldBlock])

  //  function to call when attempting to navigate away
  const handleNavigationAttempt = (nextPath: string | Partial<RouterPath>) => {
    if (shouldBlock) {
      setIsModalVisible(true)
      setNextLocation(nextPath)
      // Prevent navigation by not calling navigate here
    } else {
      navigate(nextPath) // Navigate if not blocking
    }
  }

  //  modal close handler
  const handleModalClose = (confirmNavigation: boolean) => {
    setIsModalVisible(false)
    setShouldBlock(!confirmNavigation) // Update block state based on user choice
    if (confirmNavigation) {
      navigate(nextLocation) // Navigate if user confirmed
    }
  }

  return {isModalVisible, handleModalClose, handleNavigationAttempt}
}
