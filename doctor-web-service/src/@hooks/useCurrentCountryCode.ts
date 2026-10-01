import {useEffect, useState} from 'react'
import {fetchCountryCode} from '../@utils/fetchCountryCode'

export const useCurrentCountryCode = () => {
  const [currentCountryCode, setCurrentCountryCode] = useState<string | null>(null)
  const [hasFetched, setHasFetched] = useState<boolean>(false)

  useEffect(() => {
    if (!hasFetched) {
      fetchCountryCode()
        .then((code) => {
          if (code) {
            setCurrentCountryCode(code)
          }
        })
        .catch(() => {
          setCurrentCountryCode(null)
        })
        .finally(() => {
          setHasFetched(true)
        })
    }
  }, [hasFetched])

  return currentCountryCode
}
