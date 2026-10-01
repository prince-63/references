import React from 'react'
import {render} from '@testing-library/react'
import PatientList from 'screens/Patients/PatientList/PatientList'

// Mock internal hooks and components to keep the component lightweight for tests
jest.mock('@hooks/useSubscriptionDetails', () => ({
  __esModule: true,
  default: jest.fn().mockReturnValue({
    loadingSubscriptionData: false,
    subscriptionData: {},
  }),
}))
jest.mock('@utils/isPlanExpired', () => ({
  __esModule: true,
  default: jest.fn().mockReturnValue(false),
}))

jest.mock('@hooks/useAllUserPlan', () => ({
  __esModule: true,
  default: jest.fn().mockReturnValue({
    isDesignLabUser: false,
    isCustomer: false,
    isVendor: false,
    isPractice: false,
    isAlignerCompanyOrg: false,
    isGrowthPlanUser: false,
    isOrganization: false,
    isStarterPlanUser: false,
  }),
}))

jest.mock('@hooks/useFeatureAccess', () => ({
  __esModule: true,
  useFeatureAccess: jest.fn().mockReturnValue({
    permissionChecks: {patientManagement: {patientConnectionStatus: {isViewable: false}}},
    sidebarAccess: {},
  }),
}))

jest.mock('@hooks/useAllUserRoles', () => ({
  __esModule: true,
  default: jest.fn().mockReturnValue({isEnterprisePlanUser: false}),
}))

jest.mock('@hooks/useFilter', () => ({
  __esModule: true,
  default: jest.fn().mockReturnValue({filter: {}}),
}))

jest.mock('@hooks/useActiveProfile', () => ({
  __esModule: true,
  default: jest.fn().mockReturnValue({activeProfile: {roles: []}}),
}))

jest.mock('@hooks/useDispatchAction', () => ({
  __esModule: true,
  default: jest.fn().mockReturnValue({dispatchAction: jest.fn()}),
}))

// Simplify react-redux hooks
jest.mock('react-redux', () => ({
  useSelector: jest.fn().mockImplementation((cb) =>
    cb({
      patientsList: {
        statusFilter: null,
        globalFilter: null,
        practiceLocation: null,
        customerOrPractice: null,
        brandName: null,
        patient_type: null,
        practiceLocationForOrg: null,
        customerOrPracticeForOrg: null,
      },
      apiAddAndSendInvite: {isModalConnectWithPatientOpen: false},
      mobileSidebar: {isBottomBarOpen: false},
    })
  ),
  useDispatch: () => jest.fn(),
}))

// Provide a minimal AuthContext provider
jest.mock('context/AuthContext', () => ({
  AuthContext: React.createContext({userId: '1', organizationId: '1', profileId: '1'}),
}))

// Router mocks
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useSearchParams: jest.fn().mockReturnValue([new URLSearchParams(), jest.fn()]),
}))

// Stub out all sub-components that are not under test
jest.mock('./components/TableContainerForPatientList', () => {
  const Component = () => <div>patient-list-table</div>
  Component.displayName = 'TableContainerForPatientList'
  return {__esModule: true, default: Component}
})
jest.mock('./components/TableContainerForStarterPlanUserPatientList', () => {
  const Component = () => <div>starter-patient-list</div>
  Component.displayName = 'TableContainerForStarterPlanUserPatientList'
  return {__esModule: true, default: Component}
})
jest.mock('./components/PatientsFilterData', () => {
  const Component = () => <div>filter-data</div>
  Component.displayName = 'PatientsFilterData'
  return {__esModule: true, default: Component}
})
jest.mock('./components/types/FilterSelector', () => {
  const Component = () => <div>filter-selector</div>
  Component.displayName = 'FilterSelector'
  return {__esModule: true, default: Component}
})
jest.mock('screens/Practices/PracticeList/components/PracticeSearchInput', () => {
  const Component = () => <div>search-input</div>
  Component.displayName = 'PracticeSearchInput'
  return {__esModule: true, default: Component}
})
jest.mock('components/subscription/SubscriptionInfoCardWrapper', () => {
  const Component = () => <div>subscription-card</div>
  Component.displayName = 'SubscriptionInfoCardWrapper'
  return {__esModule: true, default: Component}
})
jest.mock('components/when/When', () => {
  const WhenComp = ({isTrue, children}: any) => (isTrue ? children : null)
  WhenComp.displayName = 'When'
  return {__esModule: true, When: WhenComp}
})
jest.mock('components/emptyState/NoAccess', () => {
  const Component = () => <div>no-access</div>
  Component.displayName = 'NoAccess'
  return {__esModule: true, default: Component}
})

describe('PatientList component', () => {
  it('renders without exploding and includes expected container class', () => {
    const {container} = render(<PatientList />)
    expect(container).toBeInTheDocument()

    // by default expiredPlan false and bottom bar closed; margin div should be mb-3
    expect(container.querySelector('div.mb-3')).toBeInTheDocument()
  })
})
