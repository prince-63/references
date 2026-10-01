import React from 'react'
import {render, screen} from '@testing-library/react'
import {getMobileSidebarMenuItems} from 'components/menu/getMobileSidebarMenuItems'
import sidebarRouteConstants from '@constants/sidebar.routeConstants'
import {AuthContext} from 'context/AuthContext'

// mocks for hooks used by getMobileSidebarMenuItems
const mockUseAllUserPlan = jest.fn()
const mockUseFeatureAccess = jest.fn()
const mockUseActiveProfile = jest.fn()
const mockUseSelector = jest.fn()
const mockUseDispatchAction = jest.fn()

jest.mock('@hooks/useAllUserPlan', () => ({
  __esModule: true,
  default: () => mockUseAllUserPlan(),
}))
jest.mock('@hooks/useFeatureAccess', () => ({
  __esModule: true,
  useFeatureAccess: () => mockUseFeatureAccess(),
}))
jest.mock('@hooks/useActiveProfile', () => ({
  __esModule: true,
  default: () => mockUseActiveProfile(),
}))
jest.mock('react-redux', () => ({
  useSelector: () => mockUseSelector(),
}))
jest.mock('@hooks/useDispatchAction', () => ({
  __esModule: true,
  default: () => mockUseDispatchAction(),
}))

function renderKeys(props: {selectedMenu: string; expiredPlan: boolean}) {
  render(
    <AuthContext.Provider value={{profileId: '1'}}>
      <div data-testid='items'>
        {JSON.stringify(getMobileSidebarMenuItems(props).map((i: any) => i.key))}
      </div>
    </AuthContext.Provider>
  )
  return screen.getByTestId('items').textContent || ''
}

describe('getMobileSidebarMenuItems', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // default hook returns
    mockUseAllUserPlan.mockReturnValue({
      isOwner: false,
      isStarterPlanUser: false,
      isPractice: false,
      isInternalUser: false,
      isAdmin: false,
    })
    mockUseFeatureAccess.mockReturnValue({
      sidebarAccess: {
        tracking: {tracking: true, alignerTracking: true, patientAnalytics: true},
      },
    })
    mockUseActiveProfile.mockReturnValue({customerTrackingEnabled: true})
    mockUseDispatchAction.mockReturnValue({dispatchAction: jest.fn()})
  })

  it('hides tracking when PLANNING config is enabled (desktop consistency)', () => {
    mockUseSelector.mockImplementation((selector) =>
      selector({
        kanban: {workflowCounts: null},
        serviceConfiguration: {serviceConfig: {PLANNING: true}},
      })
    )

    const keys = renderKeys({selectedMenu: '', expiredPlan: false})
    expect(keys).not.toContain(sidebarRouteConstants.ALIGNER_ANALYTICS_PARENT)
    expect(keys).not.toContain(sidebarRouteConstants.ALIGNER_TRACKING)
  })

  it('shows tracking when PLANNING config is disabled', () => {
    mockUseSelector.mockImplementation((selector) =>
      selector({
        kanban: {workflowCounts: null},
        serviceConfiguration: {serviceConfig: {PLANNING: false}},
      })
    )

    const keys = renderKeys({selectedMenu: '', expiredPlan: false})
    expect(keys).toContain(sidebarRouteConstants.ALIGNER_ANALYTICS_PARENT)
  })
})
