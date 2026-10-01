import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'

/**
 * Returns the base profile path based on whether VSP_PLANNING is enabled.
 * When VSP_PLANNING is true, returns '/vsp-profile', otherwise '/profile'.
 */
const useProfileBasePath = () => {
  const {serviceConfig} = useSelector((state: RootState) => state.serviceConfiguration)
  const isVspPlanning = serviceConfig?.VSP_PLANNING ?? false
  return isVspPlanning ? '/vsp-profile' : '/profile'
}

export default useProfileBasePath
