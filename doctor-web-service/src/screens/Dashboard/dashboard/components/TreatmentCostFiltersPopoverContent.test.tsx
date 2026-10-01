import React from 'react'
import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TreatmentCostFiltersPopoverContent from './TreatmentCostFiltersPopoverContent'
import getInitialValues from 'screens/billingsAndPayments/helpers/getInitialValues'
import {useSelector} from 'react-redux'
import useActiveProfile from '@hooks/useActiveProfile'
import {useFormikContext} from 'formik'

jest.mock('antd', () => ({
  Collapse: ({items}: any) => (
    <div data-testid='collapse'>
      {items?.map((item: any) => (
        <div key={item.key}>
          <div>{item.label}</div>
          <div>{item.children}</div>
        </div>
      ))}
    </div>
  ),
  ConfigProvider: ({children}: any) => <div data-testid='config'>{children}</div>,
}))

// eslint-disable-next-line react/display-name
jest.mock('assets/icons/ExpandIcon', () => () => <span data-testid='expand-icon' />)

// eslint-disable-next-line react/display-name
jest.mock('components/atom/Buttons/AntdButton', () => ({text, onClick, disabled}: any) => (
  <button disabled={disabled} onClick={onClick}>
    {text}
  </button>
))

jest.mock(
  'screens/billingsAndPayments/components/filterDrawerComponents/FilterByPracticeLocation',
  () =>
    function MockPracticeLocation() {
      return <div data-testid='filter-practice-location' />
    }
)

jest.mock(
  'screens/billingsAndPayments/components/filterDrawerComponents/FilterByTreatment',
  () =>
    function MockFilterTreatment() {
      return <div data-testid='filter-treatment' />
    }
)

jest.mock('@hooks/useActiveProfile', () => jest.fn())
jest.mock('react-redux', () => ({useSelector: jest.fn()}))
jest.mock('formik', () => ({useFormikContext: jest.fn()}))

const mockUseSelector = useSelector as unknown as jest.Mock
const mockUseActiveProfile = useActiveProfile as unknown as jest.Mock
const mockUseFormikContext = useFormikContext as unknown as jest.Mock

const practiceLocationsList = [{id: 1, name: 'Main Clinic'}]

const buildFormikContext = () => ({
  values: {checked_practice_location_list: [], other: 'value'},
  resetForm: jest.fn(),
  setValues: jest.fn(),
  handleSubmit: jest.fn(),
  isSubmitting: false,
})

describe('TreatmentCostFiltersPopoverContent', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseSelector.mockImplementation((selector: any) =>
      selector({apiProductionList: {data: ['brandA']}, calendar: {practiceLocationsList}})
    )
    mockUseActiveProfile.mockReturnValue({activeProfile: {profile_type: 'OWNER'}})
  })

  it('resets form values with practice locations when brand data is present', () => {
    const ctx = buildFormikContext()
    mockUseFormikContext.mockReturnValue(ctx)

    render(<TreatmentCostFiltersPopoverContent />)

    expect(ctx.resetForm).toHaveBeenCalledWith(
      expect.objectContaining({
        values: expect.objectContaining({checked_practice_location_list: practiceLocationsList}),
      })
    )
  })

  it('applies default filters on Reset including practice locations', async () => {
    const user = userEvent
    const ctx = buildFormikContext()
    mockUseFormikContext.mockReturnValue(ctx)

    render(<TreatmentCostFiltersPopoverContent />)

    await user.click(screen.getByText('Reset'))

    expect(ctx.setValues).toHaveBeenCalledWith(
      expect.objectContaining({
        ...getInitialValues(),
        checked_practice_location_list: practiceLocationsList,
      })
    )
  })

  it('submits through formik when Apply is clicked', async () => {
    const user = userEvent
    const ctx = buildFormikContext()
    mockUseFormikContext.mockReturnValue(ctx)

    render(<TreatmentCostFiltersPopoverContent />)

    await user.click(screen.getByText('Apply'))

    expect(ctx.handleSubmit).toHaveBeenCalled()
  })

  it('does not reset when brand list missing', () => {
    mockUseSelector.mockImplementation((selector: any) =>
      selector({apiProductionList: {}, calendar: {practiceLocationsList}})
    )
    const ctx = buildFormikContext()
    mockUseFormikContext.mockReturnValue(ctx)

    render(<TreatmentCostFiltersPopoverContent />)

    expect(ctx.resetForm).not.toHaveBeenCalled()
  })
})
