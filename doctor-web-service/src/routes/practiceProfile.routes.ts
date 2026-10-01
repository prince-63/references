import generateRoutePaths from '@utils/generateRoutePaths'
import routeConstants from '@constants/practiceProfile.routeConstants'
import practiceProfileRoutesPaths from '../@staticData/practiceProfile.paths'
import ProfileTab from 'screens/PracticeList/components/ProfileTab'
import PatientsTab from 'screens/PracticeList/components/PatientsTab'
import OrdersTab from 'screens/PracticeList/components/OrdersTab'
import SettingsTab from 'screens/PracticeList/components/SettingsTab'

const componentLookUp = {
  [routeConstants.PROFILE]: ProfileTab,
  [routeConstants.PATIENTS]: PatientsTab,
  [routeConstants.ORDERS]: OrdersTab,
  [routeConstants.SETTINGS]: SettingsTab,
}

export default generateRoutePaths(practiceProfileRoutesPaths, componentLookUp)
