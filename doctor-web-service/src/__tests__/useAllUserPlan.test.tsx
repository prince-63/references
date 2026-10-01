import React from 'react'
import {render, screen} from '@testing-library/react'
import {AuthContext} from 'context/AuthContext'
import useAllUserPlan from '@hooks/useAllUserPlan'

const mockUseActiveProfile = jest.fn()
const mockDispatchAction = jest.fn()
let mockState: any

jest.mock('react-redux', () => ({
  useSelector: (selector: any) => selector(mockState),
}))

jest.mock('@hooks/useActiveProfile', () => ({
  __esModule: true,
  default: () => mockUseActiveProfile(),
}))

jest.mock('@hooks/useDispatchAction', () => ({
  __esModule: true,
  default: () => ({dispatchAction: mockDispatchAction}),
}))

const HookProbe = () => {
  const {isEnterprisePlanUser, isGrowthPlanUser} = useAllUserPlan()

  return (
    <>
      <div data-testid='enterprise'>{String(isEnterprisePlanUser)}</div>
      <div data-testid='growth'>{String(isGrowthPlanUser)}</div>
    </>
  )
}

describe('useAllUserPlan', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockState = {
      subscription: {subscriptionData: {plan_metadata: {plan_name: null}}},
    }
  })

  it('recognizes enterprise owner profiles created from aligner lab role selection', () => {
    mockState.subscription.subscriptionData.plan_metadata.plan_name = 'ENTERPRISE'
    mockUseActiveProfile.mockReturnValue({
      activeProfile: {
        profile_type: 'OWNER',
        subrole_name: null,
        roles: [{name: 'ENTERPRISE_COMPANY_LAB'}],
      },
    })

    render(
      <AuthContext.Provider value={{userId: '1'} as any}>
        <HookProbe />
      </AuthContext.Provider>
    )

    expect(screen.getByTestId('enterprise')).toHaveTextContent('true')
    expect(screen.getByTestId('growth')).toHaveTextContent('false')
  })

  it('recognizes growth owner profiles created from in-house lab role selection', () => {
    mockState.subscription.subscriptionData.plan_metadata.plan_name = 'GROWTH'
    mockUseActiveProfile.mockReturnValue({
      activeProfile: {
        profile_type: 'OWNER',
        subrole_name: null,
        roles: [{name: 'IN_OFFICE_MANUFACTURER'}],
      },
    })

    render(
      <AuthContext.Provider value={{userId: '1'} as any}>
        <HookProbe />
      </AuthContext.Provider>
    )

    expect(screen.getByTestId('growth')).toHaveTextContent('true')
    expect(screen.getByTestId('enterprise')).toHaveTextContent('false')
  })
})
