import generateRoutePaths from '@utils/generateRoutePaths'
import profileRouteConstants from '@constants/profile.routeConstants'
import customerProfilePaths from '@staticData/customerProfile.paths'

import CustomerProfileTabs from 'screens/PatientDetailsOverview.tsx/pages/CustomerPatientProfile/screens/tabs/CustomerProfileTabs'
import Records from 'screens/PatientDetailsOverview.tsx/pages/CustomerPatientProfile/tabs/Records'
import CustomerPrescription from 'screens/PatientDetailsOverview.tsx/pages/CustomerPatientProfile/tabs/CustomerPrescription'
import CustomerPatientPlansList from 'screens/PatientDetailsOverview.tsx/pages/CustomerPatientProfile/tabs/CustomerPatientPlansList'
import ViewTreatmentPlan from 'screens/PatientDetailsOverview.tsx/components/ViewTreatmentPlan'
import ViewActiveOrder from 'screens/PatientDetailsOverview.tsx/pages/CustomerPatientProfile/tabs/ViewActiveOrder'
import CustomerTreatmentSummary from 'screens/PatientDetailsOverview.tsx/pages/CustomerPatientProfile/screens/CustomerTreatmentSummary'

const componentLookUp = {
  [profileRouteConstants.CUSTOMER_TABS]: CustomerProfileTabs,
  [profileRouteConstants.CUSTOMER_CASE_RECORD]: Records,
  [profileRouteConstants.CUSTOMER_PRESCRIPTION]: CustomerPrescription,
  [profileRouteConstants.CUSTOMER_PLANS]: CustomerPatientPlansList,
  [profileRouteConstants.CUSTOMER_VIEW_TREATMENT_PLAN]: ViewTreatmentPlan,
  [profileRouteConstants.VIEW_ORDER]: ViewActiveOrder,
  [profileRouteConstants.CUSTOMER_TREATMENT_SUMMARY]: CustomerTreatmentSummary,
}

export default generateRoutePaths(customerProfilePaths, componentLookUp)
