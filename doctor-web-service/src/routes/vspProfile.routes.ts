import generateRoutePaths from '@utils/generateRoutePaths'
import profileRouteConstants from '@constants/profile.routeConstants'
import vspProfilePaths from '@staticData/vspProfile.paths'

import VspRecords from 'screens/PatientDetailsOverview.tsx/pages/VspPatientProfile/tabs/VspRecords'
import VspPrescription from 'screens/PatientDetailsOverview.tsx/pages/VspPatientProfile/tabs/VspPrescription'
import VspPatientPlansList from 'screens/PatientDetailsOverview.tsx/pages/VspPatientProfile/tabs/VspPatientPlansList'
import VspCaseDetails from 'screens/PatientDetailsOverview.tsx/pages/VspPatientProfile/tabs/VspCaseDetails'
import VspProduction from 'screens/PatientDetailsOverview.tsx/pages/VspPatientProfile/tabs/VspProduction'
import VspTracking from 'screens/PatientDetailsOverview.tsx/pages/VspPatientProfile/tabs/VspTracking'
import VspRetention from 'screens/PatientDetailsOverview.tsx/pages/VspPatientProfile/tabs/VspRetention'

const componentLookUp = {
  [profileRouteConstants.CASE_DETAILS]: VspCaseDetails,
  [profileRouteConstants.VSP_CASE_RECORD]: VspRecords,
  [profileRouteConstants.VSP_PRESCRIPTION]: VspPrescription,
  [profileRouteConstants.VSP_PLANS]: VspPatientPlansList,
  [profileRouteConstants.VSP_PRODUCTION]: VspProduction,
  [profileRouteConstants.VSP_TRACKING]: VspTracking,
  [profileRouteConstants.VSP_RETENTION]: VspRetention,
}

export default generateRoutePaths(vspProfilePaths, componentLookUp)
