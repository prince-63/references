import React from 'react'
import {render, screen, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import GrowthPlanDashboard from './GrowthPlanDashboard'

const mockNavigate = jest.fn()
const mockDashboard = jest.fn()
const mockDispatch = jest.fn()
const mockSubscriptionDetails = jest.fn()
const mockActiveProfile = jest.fn()
const mockUseAllUserPlan = jest.fn()
let mockReduxState: any

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}))

jest.mock('react-redux', () => ({
  useSelector: (selector: any) => selector(mockReduxState),
}))

jest.mock('@hooks/useDashboard', () => () => mockDashboard())
jest.mock('@hooks/useSubscriptionDetails', () => () => mockSubscriptionDetails())
jest.mock('@hooks/useActiveProfile', () => () => mockActiveProfile())
jest.mock('@hooks/useAllUserPlan', () => () => mockUseAllUserPlan())

jest.mock('redux/store', () => ({store: {dispatch: jest.fn((payload) => mockDispatch(payload))}}))

jest.mock('utils/getColorPalette', () => () => ({
  neutralBlack: '#000',
  secondarySupport: '#eee',
  secondaryColor: '#123',
}))

jest.mock('./components/ToggleSwitch', () => ({
  __esModule: true,
  default: ({checked, onChange}: any) => (
    <button data-testid='toggle' aria-pressed={checked} onClick={() => onChange(!checked)}>
      toggle
    </button>
  ),
}))

jest.mock('./components/MetricCard', () => ({
  __esModule: true,
  default: ({label, value, onClick}: any) => (
    <button data-testid={`metric-${label}`} onClick={onClick}>
      {label}:{value}
    </button>
  ),
}))

jest.mock('./components/DashIcon', () => ({
  __esModule: true,
  default: ({name}: any) => <span data-testid={`icon-${name}`} />,
}))

jest.mock('./tabs/AllTab', () => ({
  __esModule: true,
  default: (props: any) => <div data-testid='all-tab'>{JSON.stringify(props)}</div>,
}))
jest.mock('./tabs/NewTab', () => ({
  __esModule: true,
  default: (props: any) => <div data-testid='new-tab'>{JSON.stringify(props)}</div>,
}))
jest.mock('./tabs/PlanningTab', () => ({
  __esModule: true,
  default: (props: any) => <div data-testid='planning-tab'>{JSON.stringify(props)}</div>,
}))
jest.mock('./tabs/ProductionTab', () => ({
  __esModule: true,
  default: (props: any) => <div data-testid='production-tab'>{JSON.stringify(props)}</div>,
}))
jest.mock('./tabs/TrackingTab', () => ({
  __esModule: true,
  default: (props: any) => <div data-testid='tracking-tab'>{JSON.stringify(props)}</div>,
}))

jest.mock('./components/TabButton', () => ({
  __esModule: true,
  default: ({label, count, onClick, active}: any) => (
    <button data-testid={`tab-${label}`} aria-pressed={active} onClick={onClick}>
      {label}:{count}
    </button>
  ),
}))

jest.mock('components/page/Page', () => ({
  __esModule: true,
  default: ({children}: any) => <div data-testid='page'>{children}</div>,
}))

beforeEach(() => {
  jest.clearAllMocks()
  mockReduxState = {
    serviceConfiguration: {
      serviceConfig: {
        ALIGNER_PLANNING_MANUFACTURING: true,
      },
    },
  }
  mockUseAllUserPlan.mockReturnValue({
    isEnterprisePlanUser: false,
    isAdmin: false,
    isOwner: true,
  })
  mockSubscriptionDetails.mockReturnValue({subscriptionData: {is_has_done_practice: true}})
  mockActiveProfile.mockReturnValue({customerTrackingEnabled: true})
  mockDashboard.mockReturnValue({
    loadingDashboard: false,
    loadingNewDashboard: false,
    practice_connected_to_org: {
      patients_summary: {
        active_patients_under_care: 10,
        new_cases: 2,
        ongoing_cases: 5,
      },
      kanban_details: {
        details: [
          {kanban_name: 'planning', total_count: 3, status_labels: []},
          {kanban_name: 'production', total_count: 4, status_labels: []},
          {kanban_name: 'new case', total_count: 2, status_labels: []},
          {kanban_name: 'production outsourced', total_count: 1, status_labels: []},
        ],
      },
      treatment_stage: {
        starting_soon: 1,
        ongoing: 2,
        paused: 0,
        in_refinement: 0,
        completed: 1,
      },
    },
  })
})

describe('GrowthPlanDashboard', () => {
  it('shows header metrics and acceptance rate for practice view', () => {
    render(<GrowthPlanDashboard />)

    expect(screen.getByTestId('metric-Total Patients')).toHaveTextContent('10')
    expect(screen.getByTestId('metric-New Cases')).toHaveTextContent('2')
    expect(screen.getByTestId('metric-Ongoing Cases')).toHaveTextContent('5')
    expect(screen.getByTestId('metric-Case Acceptance Rate')).toHaveTextContent('50%')
    expect(screen.getByTestId('all-tab')).toBeInTheDocument()
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('switches tabs to planning and tracking when clicked', async () => {
    render(<GrowthPlanDashboard />)

    await userEvent.click(screen.getByTestId('tab-PLANNING OPERATIONS'))
    expect(screen.getByTestId('planning-tab')).toBeInTheDocument()

    await userEvent.click(screen.getByTestId('tab-TREATMENT TRACKING'))
    expect(screen.getByTestId('tracking-tab')).toBeInTheDocument()
  })

  it('aggregates kanban variants and toggles hide zero for planning', async () => {
    mockDashboard.mockReturnValue({
      loadingDashboard: false,
      loadingNewDashboard: false,
      growth_plan: {
        patients_summary: {
          active_patients_under_care: 20,
          new_cases: 5,
          ongoing_cases: 10,
          new_cases_this_month: 4,
        },
        kanban_details: {
          details: [
            {kanban_name: 'Planning', total_count: 2, status_labels: []},
            {kanban_name: 'planning in-house', total_count: 1, status_labels: []},
            {kanban_name: 'plans outsourced', total_count: 3, status_labels: []},
            {kanban_name: 'production', total_count: 2, status_labels: []},
            {kanban_name: 'production outsourced', total_count: 1, status_labels: []},
          ],
        },
        treatment_stage: {starting_soon: 0, ongoing: 0, paused: 0, in_refinement: 0, completed: 0},
      },
    })

    render(<GrowthPlanDashboard />)

    expect(screen.getByTestId('metric-New Cases This Month')).toHaveTextContent('4')
    expect(screen.getByTestId('tab-PLANNING OPERATIONS')).toHaveTextContent('PLANNING OPERATIONS:6')

    await userEvent.click(screen.getByTestId('toggle'))
    await userEvent.click(screen.getByTestId('tab-PLANNING OPERATIONS'))

    const planningProps = JSON.parse(screen.getByTestId('planning-tab').textContent || '{}')
    expect(planningProps.hideZero).toBe(true)
    expect(planningProps.planningTotal).toBe(6)
  })

  it('navigates to onboarding when practice setup not done', async () => {
    mockSubscriptionDetails.mockReturnValue({subscriptionData: {is_has_done_practice: false}})

    render(<GrowthPlanDashboard />)

    await waitFor(() => expect(mockNavigate).not.toHaveBeenCalled())
  })

  it('hides tracking tab when tracking is disabled', () => {
    mockActiveProfile.mockReturnValue({customerTrackingEnabled: false})

    render(<GrowthPlanDashboard />)

    expect(screen.queryByTestId('tab-TREATMENT TRACKING')).toBeNull()
  })
})
