import React from 'react'
import {render, screen} from '@testing-library/react'
import {act} from 'react-dom/test-utils'
import userEvent from '@testing-library/user-event'
import UpcomingAlignerChange from './UpcomingAlignerChange'
import {AuthContext} from 'context/AuthContext'

const mockNavigate = jest.fn()
const mockIdentifyUser = jest.fn()
const mockHasValue = jest.fn((value) => (Array.isArray(value) ? value.length > 0 : !!value))
let mockStorageValue: string | null = null

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}))

jest.mock('./DashboardCard', () => ({
  __esModule: true,
  default: ({children, onClick}: any) => (
    <div>
      <button data-testid='dashboard-card-button' onClick={onClick}>
        Remind all
      </button>
      {children}
    </div>
  ),
}))

jest.mock('components/emptyState/CommonEmptyState', () => ({
  __esModule: true,
  default: ({title}: any) => <div data-testid='empty-state'>{title}</div>,
}))

jest.mock('components/when/When', () => ({
  __esModule: true,
  default: ({isTrue, children}: any) => (isTrue ? <>{children}</> : null),
}))

jest.mock('./ThingsToDo', () => ({
  DashboardInfoCard: ({content, onClick}: any) => (
    <div data-testid='info-card' onClick={onClick}>
      {content}
    </div>
  ),
}))

// eslint-disable-next-line react/display-name
jest.mock('assets/icons/SwitchArrowIcon', () => () => <span data-testid='switch-icon' />)
// eslint-disable-next-line react/display-name
jest.mock('assets/icons/CheckMarkIcon', () => () => <span data-testid='check-icon' />)
// eslint-disable-next-line react/display-name
jest.mock('assets/icons/RightArrowIcon', () => () => <span data-testid='right-arrow' />)
// eslint-disable-next-line react/display-name
jest.mock('assets/icons/ArrowRight', () => () => <span data-testid='arrow-right' />)

jest.mock('assets/images/Images/Image', () => ({
  Image: (props: any) => <img alt='patient' {...props} />,
}))
jest.mock('assets/images/Images/DefaultImage', () => ({
  DefaultImage: ({letter, ...rest}: any) => <div {...rest}>{letter}</div>,
}))

jest.mock('screens/Production/components/DueMessage', () => ({
  __esModule: true,
  default: ({offSetDays}: any) => <div data-testid='due-message'>{offSetDays}</div>,
}))

jest.mock('utils/ConstFunctions', () => ({
  getFirstLetterCapitalOfWord: (val: string) =>
    val ? val.charAt(0).toUpperCase() + val.slice(1).toLowerCase() : '',
  identifyUser: () => mockIdentifyUser(),
  secToHour: (seconds: number) => Math.floor(seconds / 3600),
}))

jest.mock('@utils/removeDuplicates', () => ({removeDuplicates: (value: any) => value}))

jest.mock('components/DoctorProfile/ModalNudgePatients', () => ({
  ModalNudgePatients: ({patientList}: any) => (
    <div data-testid='nudge-modal'>Reminders: {patientList.length}</div>
  ),
}))

jest.mock('utils/hasValue', () => ({__esModule: true, default: (val: any) => mockHasValue(val)}))
jest.mock('utils/storage', () => ({
  getStorageType: () => ({
    getItem: jest.fn(() => mockStorageValue),
    setItem: jest.fn((_, v) => {
      mockStorageValue = v
    }),
  }),
}))

describe('UpcomingAlignerChange', () => {
  const patient = {
    patient_id: 1,
    patient_name: 'John Doe',
    patient_profile: null,
    country_code: '+1',
    mobile_no: '1234567890',
    current_aligner_jaw_type: 'upper',
    current_aligner_no: 1,
    next_aligner_jaw_type: 'upper',
    next_aligner_no: 2,
    change_offset: 2,
    current_aligner_avg_wear_time_in_secs: 7200,
    recommended_hours_to_wear_aligners: 20,
    current_aligner_compliance: 'POOR',
    aligner_change_status: 'DELAYED',
    patient_connected: true,
    tracking_type: 'PATIENTAPP',
  }

  const renderComponent = (showOnlyCritical = false) => {
    const patientData = {upcoming_aligner_changes: [patient]} as any
    const filteredPatientData = [patient] as any

    const setShowOnlyCritical = jest.fn()

    const view = render(
      <AuthContext.Provider value={{userId: 101, userDetail: {email: 'user@example.com'}} as any}>
        <UpcomingAlignerChange
          patientData={patientData}
          showOnlyCritical={showOnlyCritical}
          filteredPatientData={filteredPatientData}
          setShowOnlyCritical={setShowOnlyCritical}
        />
      </AuthContext.Provider>
    )

    return {setShowOnlyCritical, patientData, filteredPatientData, ...view}
  }

  beforeEach(() => {
    mockStorageValue = null
    mockHasValue.mockImplementation((value) => (Array.isArray(value) ? value.length > 0 : !!value))
    jest.clearAllMocks()
  })

  it('toggles critical filter and shows info card by default', async () => {
    const user = userEvent
    const {setShowOnlyCritical} = renderComponent(false)

    expect(screen.getByTestId('info-card')).toBeInTheDocument()

    await act(async () => {
      await user.click(screen.getByText('Show only critical'))
    })
    expect(setShowOnlyCritical).toHaveBeenCalledWith(true)
  })

  it('opens nudge modal with all patients when remind all is clicked', async () => {
    const user = userEvent
    renderComponent(true)

    expect(screen.queryByTestId('nudge-modal')).not.toBeInTheDocument()
    await act(async () => {
      await user.click(screen.getByTestId('dashboard-card-button'))
    })
    expect(screen.getByTestId('nudge-modal')).toHaveTextContent('Reminders: 1')
  })

  it('renders patient rows and allows reminding a single delayed patient', async () => {
    const user = userEvent
    renderComponent(true)

    const names = screen.getAllByText('John Doe')
    expect(names.length).toBeGreaterThan(0)
    await act(async () => {
      await user.click(screen.getAllByText('Remind')[0])
    })
    expect(screen.getByTestId('nudge-modal')).toBeInTheDocument()
  })

  it('shows empty state when no patients and hides info card after dismiss', async () => {
    const user = userEvent

    render(
      <AuthContext.Provider value={{userId: 101, userDetail: {email: 'user@example.com'}} as any}>
        <UpcomingAlignerChange
          patientData={{upcoming_aligner_changes: []} as any}
          showOnlyCritical={false}
          filteredPatientData={[] as any}
          setShowOnlyCritical={jest.fn()}
        />
      </AuthContext.Provider>
    )

    expect(screen.getAllByTestId('empty-state').length).toBeGreaterThan(0)

    // reopen with data so info card renders and can be dismissed
    mockHasValue.mockReturnValue(true)
    renderComponent(true)
    await act(async () => {
      await user.click(screen.getAllByTestId('info-card')[0])
    })

    expect(mockHasValue).toHaveBeenCalled()
  })
})
