import React from 'react'
import {render, waitFor} from '@testing-library/react'
import PatientListV3, {BASE_APP_PATIENT_URL} from 'screens/Patients/PatientListV3/patientlist'
import {URL_PATIENTS_LIST_V3_CASES} from 'redux/Endpoints/apiEndpoints'

const mockApiHelper = jest.fn()
const mockDispatchAction = jest.fn()

let mockState: any = {
  calendar: {practiceLocationsList: []},
  productionSetup: {enabledProductOptions: []},
  orders: {activeVendorsList: []},
  serviceConfiguration: {
    serviceConfig: {
      ALIGNER_PLANNING_MANUFACTURING: false,
      MANUFACTURING: false,
      PLANNING: false,
      VSP_PLANNING: false,
      BRACES_ADD_ON: false,
      PAYMENT_AND_BILLING: false,
    },
  },
}

jest.mock('@utils/apiHelper', () => ({
  __esModule: true,
  default: (...args: any[]) => mockApiHelper(...args),
}))

jest.mock('@hooks/useDispatchAction', () => ({
  __esModule: true,
  default: () => ({dispatchAction: mockDispatchAction}),
}))

jest.mock('react-redux', () => ({
  useSelector: (selector: any) => selector(mockState),
}))

jest.mock('context/AuthContext', () => {
  const React = require('react')
  return {
    AuthContext: React.createContext({userId: '1', organizationId: '2', profileId: '3'}),
  }
})

jest.mock('react-router-dom', () => ({
  useLocation: () => ({state: null}),
  useNavigate: () => jest.fn(),
}))

jest.mock('@hooks/useProfileBasePath', () => ({
  __esModule: true,
  default: () => '/profile',
}))

jest.mock('redux/Slices/AppSlice/Calendar/calendar.slice', () => ({
  getPracticeLocationsList: jest.fn((payload) => ({
    type: 'calendar/getPracticeLocationsList',
    payload,
  })),
}))

jest.mock('redux/Slices/AppSlice/ProductionSetup/Production.slice', () => ({
  getEnabledProductListOptions: jest.fn((payload) => ({
    type: 'production/getEnabledProductListOptions',
    payload,
  })),
}))

jest.mock('redux/Slices/AppSlice/orders/orders.slice', () => ({
  getVendorsList: jest.fn((payload) => ({type: 'orders/getVendorsList', payload})),
}))

jest.mock('components/spinner/Spinner', () => ({
  __esModule: true,
  default: () => <div>spinner</div>,
}))

jest.mock('antd', () => {
  const React = require('react')
  return {
    Spin: ({children}: any) => <>{children}</>,
    Input: (props: any) => <input {...props} />,
    Select: ({children}: any) => <select>{children}</select>,
    Pagination: () => <div>pagination</div>,
  }
})

jest.mock('@tanstack/react-table', () => ({
  getCoreRowModel: jest.fn(() => jest.fn()),
  useReactTable: jest.fn(() => ({
    getHeaderGroups: () => [{id: 'header-group', headers: []}],
    getRowModel: () => ({rows: []}),
  })),
  flexRender: jest.fn(() => null),
}))

describe('PatientListV3', () => {
  beforeEach(() => {
    mockApiHelper.mockReset()
    mockDispatchAction.mockReset()
    mockState = {
      calendar: {practiceLocationsList: []},
      productionSetup: {enabledProductOptions: []},
      orders: {activeVendorsList: []},
      serviceConfiguration: {
        serviceConfig: {
          ALIGNER_PLANNING_MANUFACTURING: false,
          MANUFACTURING: false,
          PLANNING: false,
          VSP_PLANNING: false,
          BRACES_ADD_ON: false,
          PAYMENT_AND_BILLING: false,
        },
      },
    }
    mockApiHelper.mockResolvedValue({
      data: {
        patients: [],
        pagination: {total_patients: 0},
      },
    })
  })

  it('refetches with the VSP endpoint once service configuration resolves after refresh', async () => {
    const {rerender} = render(<PatientListV3 />)

    await waitFor(() => expect(mockApiHelper).toHaveBeenCalledTimes(1))
    expect(mockApiHelper.mock.calls[0][0]).toBe(URL_PATIENTS_LIST_V3_CASES)

    mockState = {
      ...mockState,
      serviceConfiguration: {
        serviceConfig: {
          ...mockState.serviceConfiguration.serviceConfig,
          VSP_PLANNING: true,
        },
      },
    }

    rerender(<PatientListV3 />)

    await waitFor(() => expect(mockApiHelper).toHaveBeenCalledTimes(2))
    expect(mockApiHelper.mock.calls[1][0]).toBe(`${BASE_APP_PATIENT_URL}/patient/list/v3/vsp-cases`)
  })
})
