import React from 'react'
import {render, screen, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {AuthContext} from 'context/AuthContext'
import CustomerActionPending from './CustomerActionPending'
import MyTasks from './MyTasks'
import NeedsAttention from './NeedsAttention'
import StatBoxes from './StatBoxes'
import PracticeVendorDashboard from './PracticeVendorDashboard'

const mockDispatch = jest.fn()
const mockNavigate = jest.fn()

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}))

jest.mock('@hooks/useDispatchAction', () => () => ({dispatchAction: mockDispatch}))

const mockDashboard = jest.fn()
jest.mock('@hooks/useDashboard', () => () => mockDashboard())

jest.mock('@hooks/useAllUserPlan', () => () => ({
  isDesignLabUser: true,
  isEnterprisePlanUser: true,
  isStarterPlanUser: false,
  isPractice: true,
}))

jest.mock('@hooks/useFeatureAccess', () => ({
  useFeatureAccess: () => ({
    permissionChecks: {
      dashboard: {
        orderStatusCards: {isViewable: true},
        myTasks: {isViewable: true},
        customerActionPending: {isViewable: true},
        needsAttention: {isViewable: true},
      },
      profilesAccountsAndSettings: {
        addEditBrandingDetails: {isViewable: true},
      },
    },
  }),
}))

jest.mock('@hooks/useSubscriptionDetails', () => () => ({subscriptionData: {}}))
jest.mock('@hooks/useActiveProfile', () => () => ({customerTrackingEnabled: true}))

jest.mock('react-redux', () => ({
  useSelector: (selector: any) =>
    selector({
      apiDoctorProfileGet: {
        gettingStartedData: {user_added: true, customer_added: true},
        gettingStartedLoading: false,
      },
      DoctorDashboard: {loadingEnterpriseLabStaffCounts: false},
      settings: {account: {salutation: 'Dr', first_name: 'Ada', last_name: 'Lovelace'}},
    }),
}))

const resetReturn = {type: 'RESET_ORDERS'}
const setReturn = (payload: any) => ({type: 'SET_ORDERS', payload})

jest.mock('redux/Slices/AppSlice/orders/orders.slice', () => ({
  resetOrderFilters: jest.fn(() => resetReturn),
  setOrderFilters: jest.fn((payload: any) => setReturn(payload)),
}))

jest.mock('redux/Slices/AppSlice/subscription/subscription.slice', () => ({
  getSubscriptionDetails: jest.fn((payload: any) => ({type: 'GET_SUB', payload})),
  requestForExtension: jest.fn((payload: any) => ({type: 'REQUEST_EXT', payload})),
}))

jest.mock('redux/Slices/AppSlice/DoctorProfile/DoctorProfileGetSlice', () => ({
  getApiDataDoctorProfile: jest.fn((payload: any) => ({type: 'GET_PROFILE', payload})),
}))

jest.mock('@utils/getActiveProfile', () => ({
  __esModule: true,
  default: () => ({brand_name_added: true}),
}))
jest.mock('@utils/isTrialPlanStarted', () => ({__esModule: true, default: () => false}))
jest.mock('utils/storage', () => ({
  getStorageType: () => ({getItem: () => 'false', setItem: jest.fn()}),
}))

const ordersSlice = jest.requireMock('redux/Slices/AppSlice/orders/orders.slice')
const subscriptionSlice = jest.requireMock('redux/Slices/AppSlice/subscription/subscription.slice')
const doctorProfileSlice = jest.requireMock(
  'redux/Slices/AppSlice/DoctorProfile/DoctorProfileGetSlice'
)

jest.mock('../../components/BorderedCard', () => ({
  __esModule: true,
  default: ({children}: any) => <div data-testid='border-card'>{children}</div>,
}))

jest.mock('../../components/ActionItem', () => ({
  __esModule: true,
  default: ({title, count, onClick}: any) => (
    <button data-testid='action-item' onClick={onClick}>
      {title}
      {typeof count !== 'undefined' ? <>:{count}</> : null}
    </button>
  ),
}))

jest.mock('components/when/When', () => ({
  __esModule: true,
  default: ({isTrue, children}: any) => (isTrue ? <>{children}</> : null),
}))

jest.mock('components/page/Page', () => ({
  __esModule: true,
  default: ({children}: any) => <div data-testid='page'>{children}</div>,
}))

// eslint-disable-next-line react/display-name
jest.mock('components/GettingStarted/GettingStartedSideScreen', () => () => (
  <div data-testid='getting-started' />
))
jest.mock('components/subscription/modals/SubscriptionInfoModal', () => ({
  __esModule: true,
  default: (props: any) => (
    <button data-testid='trial-modal' onClick={props.onClick}>
      Trial
    </button>
  ),
}))

beforeEach(() => {
  jest.clearAllMocks()
  ordersSlice.resetOrderFilters.mockReturnValue(resetReturn)
  ordersSlice.setOrderFilters.mockImplementation((payload: any) => setReturn(payload))
  subscriptionSlice.getSubscriptionDetails.mockImplementation((payload: any) => ({
    type: 'GET_SUB',
    payload,
  }))
  subscriptionSlice.requestForExtension.mockImplementation((payload: any) => ({
    type: 'REQUEST_EXT',
    payload,
  }))
  doctorProfileSlice.getApiDataDoctorProfile.mockImplementation((payload: any) => ({
    type: 'GET_PROFILE',
    payload,
  }))
  mockDashboard.mockReturnValue({
    enterprise_lab_staff: {
      practice_order: {
        customer_action_pending: {
          active: 1,
          invited: 2,
          in_review: 3,
          approved: 4,
          stl_files_uploaded: 5,
        },
        my_task: {in_progress: 7, review_assigned_orders_to_me: 8},
        need_attention: {
          urgent_orders: 9,
          in_re_plan: 10,
          stl_files_requested: 11,
          due_today: 12,
          overdue: 13,
        },
        count: {
          ordered: 1,
          in_progress: 2,
          in_review: 3,
          replan: 4,
          approved: 5,
          stl_files_requested: 6,
          stl_files_uploaded: 7,
          completed: 8,
        },
      },
      customer_orders: {
        customer_action_pending: {
          active: 1,
          invited: 2,
          in_review: 3,
          approved: 4,
          stl_files_uploaded: 5,
        },
        my_task: {in_progress: 14, review_assigned_orders_to_me: 15},
        need_attention: {
          urgent_orders: 16,
          in_re_plan: 17,
          stl_files_requested: 18,
          due_today: 19,
          overdue: 20,
        },
        count: {
          ordered: 9,
          in_progress: 10,
          in_review: 11,
          replan: 12,
          approved: 13,
          stl_files_requested: 14,
          stl_files_uploaded: 15,
          completed: 16,
        },
      },
    },
    loadingEnterpriseLabStaffCounts: false,
  })
  mockDispatch.mockImplementation(() => ({
    unwrap: () => Promise.resolve({profiles: [{brand_name_added: true}]}),
  }))
})

const renderWithAuth = (ui: React.ReactNode) =>
  render(
    <AuthContext.Provider value={{userId: '1', profileId: '2'} as any}>{ui}</AuthContext.Provider>
  )

describe('Enterprise lab staff dashboard cards', () => {
  it('navigates to practice orders from CustomerActionPending', async () => {
    render(<CustomerActionPending filter={{PRACTICE_ORDER: true, CUSTOMER_ORDER: false} as any} />)

    await userEvent.click(screen.getByText(/In Review/i))

    expect(mockDispatch).toHaveBeenCalledWith(resetReturn)
    expect(mockDispatch).toHaveBeenCalledWith(setReturn({filterByOrderStatus: 'IN_REVIEW'}))
    expect(mockNavigate).toHaveBeenCalledWith('/aligner-orders')
  })

  it('routes customer tasks to orders with query', async () => {
    render(<MyTasks filter={{PRACTICE_ORDER: false, CUSTOMER_ORDER: true} as any} />)

    await userEvent.click(screen.getByText(/Review assigned orders to me/i))

    expect(mockDispatch).toHaveBeenCalledWith(resetReturn)
    expect(mockDispatch).toHaveBeenCalledWith(setReturn({filterByAssignedUser: 'ASSIGNED_TO_ME'}))
    expect(mockNavigate).toHaveBeenCalledWith('/orders?customerOrders=true')
  })

  it('shows STL action for customer orders and navigates overdue', async () => {
    render(<NeedsAttention filter={{PRACTICE_ORDER: false, CUSTOMER_ORDER: true} as any} />)

    expect(screen.getByText(/STL files requested/i)).toBeInTheDocument()
    await userEvent.click(screen.getByText(/Overdue/i))

    expect(mockDispatch).toHaveBeenCalledWith(setReturn({filterByDueBy: 'OVERDUE'}))
    expect(mockNavigate).toHaveBeenCalledWith('/unprocessed-orders?customerOrders=true')
  })

  it('hides STL stats for practice orders', () => {
    render(
      <StatBoxes counts={{ordered: 1, in_progress: 2}} filter={{PRACTICE_ORDER: true} as any} />
    )

    expect(screen.queryByText(/STL files/i)).toBeNull()
    expect(screen.getByText(/Ordered/i)).toBeInTheDocument()
  })

  it('navigates practice needs attention items without STL entry', async () => {
    render(<NeedsAttention filter={{PRACTICE_ORDER: true, CUSTOMER_ORDER: false} as any} />)

    expect(screen.queryByText('STL files requested')).toBeNull()

    await userEvent.click(screen.getByText(/Due today/i))

    expect(mockDispatch).toHaveBeenCalledWith(setReturn({filterByDueBy: 'DUE_TODAY'}))
    expect(mockNavigate).toHaveBeenCalledWith('/aligner-orders')
  })

  it('routes customer order stats and falls back to zero counts', async () => {
    render(<StatBoxes counts={{}} filter={{PRACTICE_ORDER: false, CUSTOMER_ORDER: true} as any} />)

    expect(screen.getAllByText('0').length).toBeGreaterThan(0)

    await userEvent.click(screen.getByText(/Approved/i))

    expect(mockDispatch).toHaveBeenCalledWith(setReturn({filterByOrderStatus: 'APPROVED'}))
    expect(mockNavigate).toHaveBeenCalledWith('/orders?customerOrders=true')
  })
})

describe('PracticeVendorDashboard', () => {
  it('renders cards when permissions allow and triggers startup actions', () => {
    renderWithAuth(
      <PracticeVendorDashboard filter={{PRACTICE_ORDER: true, CUSTOMER_ORDER: false} as any} />
    )

    expect(screen.getByText(/Welcome back,\s*Dr.*Ada Lovelace/i)).toBeInTheDocument()
    expect(screen.getByText('In Progress')).toBeInTheDocument()
    expect(screen.getAllByText(/In Review/i).length).toBeGreaterThan(0)
    expect(screen.getByText(/Urgent orders/i)).toBeInTheDocument()
    expect(mockDispatch).toHaveBeenCalledWith({type: 'GET_SUB', payload: {doctor_id: 1}})
    return waitFor(() => expect(mockNavigate).toHaveBeenCalled())
  })
})
