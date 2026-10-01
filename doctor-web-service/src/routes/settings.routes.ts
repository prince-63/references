import generateRoutePaths from '@utils/generateRoutePaths'
import routeConstants from '@constants/settings.routeConstants'
import settingsPaths from '@staticData/settings.paths'
import AccountPage from 'screens/settings/account/AccountPage'
import BillingPage from 'screens/settings/billing/BillingPage'
import ProfileManagementPage from 'screens/settings/profileManagement/ProfileManagementPage'
import SubscriptionPage from 'screens/settings/subscription/SubscriptionPage'
import ServicesPage from 'screens/settings/services/ServicesPage'
import WorkflowPage from 'screens/settings/workflow/WorkflowPage'
import CardDisplayPage from 'screens/settings/cardDisplay/CardDisplayPage'
import WorkflowManagementPage from 'screens/settings/workflow/WorkflowManagementPage'
import LabList from 'screens/Labs/LabList/LabList'
import OverviewPanel from 'screens/settings/services/components/OverviewPanel'
import Storage from 'screens/settings/Storage/Storage'
import StarterPlanServicePage from 'screens/settings/services/StarterPlanServicePage'
import RewardsConfigurationPage from 'screens/settings/rewardsConfiguration/RewardsConfigurationPage'
import CaseTeamPage from 'screens/settings/caseTeam/CaseTeamPage'

const componentLookUp = {
  [routeConstants.ACCOUNT]: AccountPage,
  [routeConstants.BILLING]: BillingPage,
  [routeConstants.PROFILE_MANAGEMENT]: ProfileManagementPage,
  [routeConstants.SUBSCRIPTION]: SubscriptionPage,
  [routeConstants.SERVICES]: ServicesPage,
  [routeConstants.WORKFLOW]: WorkflowPage,
  [routeConstants.CARD_DISPLAY]: CardDisplayPage,
  [routeConstants.WORKFLOW_MANAGEMENT]: WorkflowManagementPage,
  [routeConstants.ADD_ONS]: StarterPlanServicePage,
  [routeConstants.LABS]: LabList,
  [routeConstants.OVERVIEW]: OverviewPanel,
  [routeConstants.REWARDS_CONFIGURATION]: RewardsConfigurationPage,
  [routeConstants.STORAGE]: Storage,
  [routeConstants.CASE_TEAM]: CaseTeamPage,
}

export default generateRoutePaths(settingsPaths, componentLookUp)
