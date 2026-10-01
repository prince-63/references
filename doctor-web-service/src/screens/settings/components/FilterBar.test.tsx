import React from 'react'
import {render, screen, fireEvent} from '@testing-library/react'
import FilterBar from './FilterBar'
import routeConstants from '@constants/settings.routeConstants'

const mockNavigate = jest.fn()
const mockUseNavigate = jest.fn()
const mockUseSelector = jest.fn()
const mockUseFeatureAccess = jest.fn()
const mockUseAllUserPlan = jest.fn()

jest.mock('context/CustomNavigationContext', () => ({
  useNavigate: () => mockUseNavigate(),
}))

jest.mock('react-redux', () => ({
  useSelector: (fn: any) => mockUseSelector(fn),
}))

jest.mock('@hooks/useFeatureAccess', () => ({
  useFeatureAccess: () => mockUseFeatureAccess(),
}))

jest.mock('@hooks/useAllUserPlan', () => ({
  __esModule: true,
  default: () => mockUseAllUserPlan(),
}))

const buildFilter = (active?: string) => {
  const entries = Object.values(routeConstants).reduce(
    (acc, key) => ({...acc, [key]: false}),
    {} as Record<string, boolean>
  )
  if (active) entries[active] = true
  return entries as any
}

describe('FilterBar', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseNavigate.mockReturnValue({navigate: mockNavigate, shouldBlock: false})
    mockUseFeatureAccess.mockReturnValue({
      permissionChecks: {
        profilesAccountsAndSettings: {addEditBillingDetails: {isViewable: true}},
        labManagement: {labManagement: {isViewable: true}},
      },
    })
    mockUseAllUserPlan.mockReturnValue({
      isInternalUser: false,
      isOwner: true,
      isPractice: false,
      isStarterPlanUser: false,
    })
    mockUseSelector.mockImplementation((fn: any) =>
      fn({appointments: {loadingAppointmentsList: false}})
    )
  })

  it('renders permitted tabs and navigates with handleFilterChange when unblocked', () => {
    expect.assertions(7)
    const handleFilterChange = jest.fn()

    render(
      <FilterBar
        filter={buildFilter(routeConstants.ACCOUNT)}
        handleFilterChange={handleFilterChange}
      />
    )

    expect(screen.getByText('Account')).toBeInTheDocument()
    expect(screen.getByText('Billing')).toBeInTheDocument()
    expect(screen.getByText('Subscription')).toBeInTheDocument()
    expect(screen.getByText('Storage')).toBeInTheDocument()

    fireEvent.click(screen.getByText('Billing'))
    expect(handleFilterChange).toHaveBeenCalledWith(routeConstants.BILLING)
    expect(mockNavigate).toHaveBeenCalledWith('/settings/billing')

    fireEvent.click(screen.getByText('Configurations'))
    expect(mockNavigate).toHaveBeenCalledWith('/settings/workflow-management/overview')
  })

  it('navigates to add-ons for starter plan users', () => {
    expect.assertions(1)
    mockUseAllUserPlan.mockReturnValue({
      isInternalUser: false,
      isOwner: true,
      isPractice: false,
      isStarterPlanUser: true,
    })

    render(<FilterBar filter={buildFilter()} handleFilterChange={jest.fn()} />)

    fireEvent.click(screen.getByText('Configurations'))
    expect(mockNavigate).toHaveBeenCalledWith('/settings/workflow-management/add-ons')
  })

  it('filters tabs based on permissions and plan flags', () => {
    expect.assertions(5)
    mockUseAllUserPlan.mockReturnValue({isInternalUser: true, isOwner: false, isPractice: false})
    mockUseFeatureAccess.mockReturnValue({
      permissionChecks: {profilesAccountsAndSettings: {}, labManagement: {}},
    })

    render(<FilterBar filter={buildFilter()} handleFilterChange={jest.fn()} />)

    expect(screen.queryByText('Configurations')).not.toBeInTheDocument()
    expect(screen.queryByText('Billing')).not.toBeInTheDocument()
    expect(screen.queryByText('Subscription')).not.toBeInTheDocument()
    expect(screen.queryByText('Storage')).not.toBeInTheDocument()
    expect(screen.queryByText('Labs')).not.toBeInTheDocument()
  })
})
