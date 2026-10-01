import HttpMethod from '@constants/httpMethods.constants'
import reducer, {
  addTimeLineComment,
  cloneOrder,
  createOrder,
  getActiveUsers,
  getAlignerOrderDetailsList,
  getOrderDetails,
  getOrderDetailsList,
  getSelectedPatientDetails,
  getUnprocessedOrderDetailsList,
  getVendorsList,
  updateOrder,
  validatePatient,
  zipOrder,
} from 'redux/Slices/AppSlice/orders/orders.slice'
import apiHelper from '@utils/apiHelper'
import {
  URL_ADD_ORDER_TIMELINE_COMMENT,
  URL_CLONE_ORDER,
  URL_CREATE_ORDER,
  URL_GET_ACTIVE_PRACTICES,
  URL_GET_LEADS_PROFILE_DETAILS,
  URL_GET_ORDER_DETAILS,
  URL_GET_ORDER_DETAILS_LIST,
  URL_GET_ORDER_TIMELINE_COMMENTS,
  URL_GET_UNPROCESSED_ORDER_DETAILS_LIST,
  URL_LIST_PRACTICES,
  URL_ORDER_STATUS_UPDATE,
  URL_VALIDATE_PATIENT,
  URL_ZIP_ORDER,
} from 'redux/Endpoints/apiEndpoints'
import rolesConstants from '@constants/roles.constants'
import ordersPageFilterBarConstants from '@constants/ordersPageFilterBar.constants'

jest.mock('@utils/apiHelper', () => jest.fn())
jest.mock('utils/ConstFunctions', () => ({
  safeParseInt: (value: any) => {
    const n = parseInt(value, 10)
    return Number.isNaN(n) ? 0 : n
  },
}))

const mockedApiHelper = apiHelper as jest.MockedFunction<typeof apiHelper>
const baseThunkArgs = {dispatch: jest.fn(), getState: jest.fn(), extra: undefined as undefined}
const initial = reducer(undefined, {type: '@@init'})

const makePending = (action: any, payload?: any) => reducer(initial, action('id', payload as any))

const mockGetStateWithStep = (step: number) => {
  baseThunkArgs.getState.mockReturnValue({orders: {currentStep: step}} as any)
}

describe('orders slice thunks', () => {
  beforeEach(() => {
    mockedApiHelper.mockReset()
    baseThunkArgs.dispatch.mockReset()
    baseThunkArgs.getState.mockReset()
  })

  it('fetches selected patient details', async () => {
    mockedApiHelper.mockResolvedValueOnce({data: {patient: true}} as any)
    const result = await getSelectedPatientDetails({doctor_id: 1, patient_id: 2})(
      baseThunkArgs.dispatch,
      baseThunkArgs.getState,
      baseThunkArgs.extra
    )
    expect(mockedApiHelper).toHaveBeenCalledWith(
      `${URL_GET_LEADS_PROFILE_DETAILS}?doctorId=1&patientId=2`,
      HttpMethod.GET
    )
    expect(result.payload).toEqual({patient: true})
  })

  it('retrieves order details and preserves updateLoadingState', async () => {
    mockedApiHelper.mockResolvedValueOnce({data: {order: 7}} as any)
    const result = await getOrderDetails({doctor_id: 1, order_id: 'abc', updateLoadingState: true})(
      baseThunkArgs.dispatch,
      baseThunkArgs.getState,
      baseThunkArgs.extra
    )
    expect(mockedApiHelper).toHaveBeenCalledWith(URL_GET_ORDER_DETAILS, HttpMethod.POST, {
      doctor_id: 1,
      order_id: 'abc',
    })
    expect(result.payload).toEqual({data: {order: 7}, updateLoadingState: true})
  })

  it('updates and clones orders', async () => {
    mockedApiHelper.mockResolvedValue({data: {ok: true}} as any)
    await updateOrder({doctor_id: 1, order_id: 'o1', status: 'APPROVED'})(
      baseThunkArgs.dispatch,
      baseThunkArgs.getState,
      baseThunkArgs.extra
    )
    expect(mockedApiHelper).toHaveBeenCalledWith(URL_ORDER_STATUS_UPDATE, HttpMethod.PUT, {
      doctor_id: 1,
      order_id: 'o1',
      status: 'APPROVED',
    })

    mockedApiHelper.mockResolvedValueOnce({data: {clone: true}} as any)
    await cloneOrder({doctor_id: 2, customer_order_id: 'c1'})(
      baseThunkArgs.dispatch,
      baseThunkArgs.getState,
      baseThunkArgs.extra
    )
    expect(mockedApiHelper).toHaveBeenCalledWith(URL_CLONE_ORDER, HttpMethod.POST, {
      doctor_id: 2,
      customer_order_id: 'c1',
    })
  })

  it('fetches order list and aligns loading flag passthrough', async () => {
    mockedApiHelper.mockResolvedValueOnce({data: {list: [1]}} as any)
    const payload = {
      doctor_id: 5,
      page_number: 1,
      is_org_admin: true,
      sort_criteria: {type: 'DATE', sort: 'DESC'},
      order_flow: ordersPageFilterBarConstants.ALIGNER,
    }
    const result = await getOrderDetailsList(payload as any)(
      baseThunkArgs.dispatch,
      baseThunkArgs.getState,
      baseThunkArgs.extra
    )
    expect(mockedApiHelper).toHaveBeenCalledWith(URL_GET_ORDER_DETAILS_LIST, HttpMethod.POST, {
      ...payload,
      page_size: 10,
    })
    expect(result.payload).toEqual({data: {list: [1]}, updateLoadingState: undefined})

    const pending = makePending(getOrderDetailsList.pending, payload)
    expect(pending.loadingOrderList).toBe(true)
  })

  it('fetches aligner order list via shared thunk', async () => {
    mockedApiHelper.mockResolvedValueOnce({data: {list: [2]}} as any)
    const payload = {
      doctor_id: 5,
      page_number: 1,
      is_org_admin: true,
      sort_criteria: {type: 'DATE', sort: 'DESC'},
      order_flow: ordersPageFilterBarConstants.ALIGNER,
    }
    await getAlignerOrderDetailsList(payload as any)(
      baseThunkArgs.dispatch,
      baseThunkArgs.getState,
      baseThunkArgs.extra
    )
    expect(mockedApiHelper).toHaveBeenCalledWith(URL_GET_ORDER_DETAILS_LIST, HttpMethod.POST, {
      ...payload,
      page_size: 10,
    })
  })

  it('fetches unprocessed order list with size override', async () => {
    mockedApiHelper.mockResolvedValueOnce({data: {rows: [1]}} as any)
    const payload = {
      customer_id: null,
      search_term: null,
      due_by_filter: null,
      sort_option: null,
      page: 1,
      roles: ['ROLE'],
    }
    const result = await getUnprocessedOrderDetailsList(payload as any)(
      baseThunkArgs.dispatch,
      baseThunkArgs.getState,
      baseThunkArgs.extra
    )
    expect(mockedApiHelper).toHaveBeenCalledWith(
      URL_GET_UNPROCESSED_ORDER_DETAILS_LIST,
      HttpMethod.POST,
      {...payload, size: 10}
    )
    expect(result.payload).toEqual({data: {rows: [1]}})
  })

  it('validates patient and creates order', async () => {
    mockedApiHelper.mockResolvedValueOnce({data: {valid: true}} as any)
    await validatePatient({doctor_id: 1, patient_email_id: 'p'})(
      baseThunkArgs.dispatch,
      baseThunkArgs.getState,
      baseThunkArgs.extra
    )
    expect(mockedApiHelper).toHaveBeenCalledWith(URL_VALIDATE_PATIENT, HttpMethod.POST, {
      doctor_id: 1,
      patient_email_id: 'p',
    })

    mockedApiHelper.mockResolvedValueOnce({data: {created: true}} as any)
    mockGetStateWithStep(3)
    await createOrder({doctor_id: 1, order_id: 'o1'} as any)(
      baseThunkArgs.dispatch,
      baseThunkArgs.getState,
      baseThunkArgs.extra
    )
    expect(mockedApiHelper).toHaveBeenCalledWith(URL_CREATE_ORDER, HttpMethod.POST, {
      current_step: 3,
      doctor_id: 1,
      order_id: 'o1',
    })
  })

  it('adds timeline comment and fetches updated comments', async () => {
    mockedApiHelper.mockResolvedValueOnce({} as any) // add comment
    mockedApiHelper.mockResolvedValueOnce({data: [{c: 1}]} as any) // get comments
    const res = await addTimeLineComment({order_id: 'o1', doctor_id: 2, notes: 'note'})(
      baseThunkArgs.dispatch,
      baseThunkArgs.getState,
      baseThunkArgs.extra
    )
    expect(mockedApiHelper).toHaveBeenNthCalledWith(
      1,
      URL_ADD_ORDER_TIMELINE_COMMENT,
      HttpMethod.POST,
      {
        order_id: 'o1',
        doctor_id: 2,
        notes: 'note',
      }
    )
    expect(mockedApiHelper).toHaveBeenNthCalledWith(
      2,
      `${URL_GET_ORDER_TIMELINE_COMMENTS}?order_id=o1`,
      HttpMethod.GET
    )
    expect(res.payload).toEqual([{c: 1}])
  })

  it('zips orders', async () => {
    mockedApiHelper.mockResolvedValueOnce({data: {zip: true}} as any)
    await zipOrder({order_id: 'z1', doctor_id: 4})(
      baseThunkArgs.dispatch,
      baseThunkArgs.getState,
      baseThunkArgs.extra
    )
    expect(mockedApiHelper).toHaveBeenCalledWith(URL_ZIP_ORDER, HttpMethod.POST, {
      order_id: 'z1',
      doctor_id: 4,
    })
  })

  it('gets active users and returns transformed options', async () => {
    mockedApiHelper.mockResolvedValueOnce({
      data: {
        doctor_invitation_details_list: [
          {admin: true, profile_id: 9, salutation: 'Dr', first_name: 'A', last_name: 'B'},
          {admin: false, profile_id: 8, salutation: '', first_name: 'C', last_name: 'D'},
        ],
      },
    } as any)
    const res = await getActiveUsers({
      data: {
        doctor_id: 1,
        invitation_status: 'ACCEPTED',
        search: '',
        page_number: 1,
        page_size: 10,
        sort_order: 'PRACTICE_NAME_ASC',
        invitation_roles: [],
      },
    })(baseThunkArgs.dispatch, baseThunkArgs.getState, baseThunkArgs.extra)

    expect(mockedApiHelper).toHaveBeenCalledWith(URL_GET_ACTIVE_PRACTICES, HttpMethod.POST, {
      doctor_id: 1,
      invitation_status: 'ACCEPTED',
      search: '',
      page_number: 1,
      page_size: 10,
      sort_order: 'PRACTICE_NAME_ASC',
      invitation_roles: [],
    })
    expect(res.payload).toEqual([
      {value: 9, label: 'Dr. A B'},
      {value: 8, label: 'C D'},
    ])
  })

  it('gets vendors list with and without own doctor filtering', async () => {
    mockedApiHelper.mockResolvedValueOnce({
      data: {
        doctor_invitation_details_list: [
          {profile_id: 5, org_name: 'Org1', doctor_id: 11, organization_id: 22, display_name: null},
          {profile_id: 6, org_name: null, doctor_id: 12, organization_id: 23, display_name: 'Disp'},
        ],
      },
    } as any)
    ;(window.localStorage as any).setItem('profileId', '5')

    const res1 = await getVendorsList({doctor_id: 7, withoutOwnDoctor: true})(
      baseThunkArgs.dispatch,
      baseThunkArgs.getState,
      baseThunkArgs.extra
    )
    expect(mockedApiHelper).toHaveBeenCalledWith(
      URL_LIST_PRACTICES,
      HttpMethod.POST,
      expect.objectContaining({
        invitation_roles: [rolesConstants.VENDOR],
      })
    )
    expect(res1.payload).toEqual([
      {value: 6, label: 'Disp', lab_doctor_id: 12, lab_organization_id: 23},
    ])

    mockedApiHelper.mockResolvedValueOnce({
      data: {
        doctor_invitation_details_list: [
          {profile_id: 9, org_name: 'Org9', doctor_id: 19, organization_id: 29, display_name: null},
        ],
      },
    } as any)
    const res2 = await getVendorsList({doctor_id: 7, isInternalUserToShow: true})(
      baseThunkArgs.dispatch,
      baseThunkArgs.getState,
      baseThunkArgs.extra
    )
    expect(mockedApiHelper).toHaveBeenCalledWith(
      URL_LIST_PRACTICES,
      HttpMethod.POST,
      expect.objectContaining({invitation_roles: [rolesConstants.INTERNAL_USER]})
    )
    expect(res2.payload).toEqual([
      {value: 9, label: 'Org9', lab_doctor_id: 19, lab_organization_id: 29},
    ])
  })
})
