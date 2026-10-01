import HttpMethod from '@constants/httpMethods.constants'
import reducer, {
  AddBatchTaskData,
  AddMyTaskData,
  DeleteMyTaskData,
  PatientOrderList,
  UpdateMyTaskData,
  addProductionTaskLocal,
  clearAllBatchProductionTaskLists,
  clearMyTaskList,
  clearProductionChecklistLocal,
  clearProductionTaskList,
  clearProductionTaskListByBatch,
  getCheckListData,
  getCustomerOrderDetail,
  getMyTaskList,
  getPatientDetails,
  getPatientDoctorMiniDashboardV4,
  getVspMiniDashboard,
  setMyTaskList,
  setProductionChecklistLocal,
  setProductionTaskList,
  setProductionTaskListByBatch,
  toggleProductionTaskLocal,
  toggleCustomerTracking,
} from '../redux/Slices/AppSlice/Profile/Profile.slice'
import apiHelper from '@utils/apiHelper'
import {
  URL_BATCHES_TASK_CREATION,
  URL_CUSTOMER_ORDER_DETAIL,
  URL_GET_MY_TASK_LIST,
  URL_GET_PATIENT_DETAILS,
  URL_GET_PRODUCTION_CHECKLIST_DATA,
  URL_MY_TASK_CREATION,
  URL_MY_TASK_DELETE,
  URL_MY_TASK_UPDATE,
  URL_PATIENT_DOCTOR_MINI_DASHBOARD_V4,
  URL_PATIENT_ORDER_LIST,
  URL_TOGGLE_CUSTOMER_TRACKING,
} from 'redux/Endpoints/apiEndpoints'

jest.mock('@utils/apiHelper', () => jest.fn())
const mockedApiHelper = apiHelper as jest.MockedFunction<typeof apiHelper>
const baseArgs = {dispatch: jest.fn(), getState: jest.fn(), extra: undefined as undefined}

beforeEach(() => {
  mockedApiHelper.mockReset()
  baseArgs.dispatch.mockReset()
  baseArgs.getState.mockReset()
})

describe('Profile slice reducers', () => {
  it('sets and clears main task lists', () => {
    const initial = reducer(undefined, {type: 'init'})
    const withMyTasks = reducer(initial, setMyTaskList([{my_task_id: 1} as any]))
    expect(withMyTasks.myTaskList?.[0].my_task_id).toBe(1)

    const clearedMy = reducer(withMyTasks, clearMyTaskList())
    expect(clearedMy.myTaskList).toBeNull()

    const withProd = reducer(initial, setProductionTaskList([{my_task_id: 2} as any]))
    expect(withProd.productionTaskList?.[0].my_task_id).toBe(2)
    const clearedProd = reducer(withProd, clearProductionTaskList())
    expect(clearedProd.productionTaskList).toBeNull()
  })

  it('manages production tasks by batch with computed keys', () => {
    const initial = reducer(undefined, {type: 'init'})
    const withBatch = reducer(
      initial,
      setProductionTaskListByBatch({patient_id: 10, batch_id: 5, tasks: [{my_task_id: 3} as any]})
    )
    expect(withBatch.productionTaskListByBatch['10:5'][0].my_task_id).toBe(3)

    const clearedBatch = reducer(
      withBatch,
      clearProductionTaskListByBatch({patient_id: 10, batch_id: 5})
    )
    expect(clearedBatch.productionTaskListByBatch['10:5']).toBeUndefined()

    const resetAll = reducer(withBatch, clearAllBatchProductionTaskLists())
    expect(resetAll.productionTaskListByBatch).toEqual({})
    expect(resetAll.loadingProductionTasksByBatch).toEqual({})
  })

  it('handles local checklist add/toggle/clear', () => {
    const base = reducer(
      undefined,
      setProductionChecklistLocal({
        patientId: 7,
        tasks: [
          {
            my_task_id: 1,
            patient_id: 7,
            title: 'Seed',
            description: null,
            due_date: 'd',
            status: 'PENDING',
            priority: 'LOW',
          } as any,
        ],
      })
    )

    const withLocal = reducer(
      base,
      addProductionTaskLocal({patientId: 7, title: 'Check', priority: 'HIGH'})
    )
    const added = withLocal.productionChecklistLocalByPatient[7]?.[1]
    expect(added?.title).toBe('Check')
    expect(added?.status).toBe('PENDING')
    expect(added?.priority).toBe('HIGH')

    const toggled = reducer(withLocal, toggleProductionTaskLocal({patientId: 7, my_task_id: 1}))
    expect(toggled.productionChecklistLocalByPatient[7]?.[0].status).toBe('COMPLETED')

    const cleared = reducer(withLocal, clearProductionChecklistLocal({patientId: 7}))
    expect(cleared.productionChecklistLocalByPatient[7]).toBeUndefined()
  })
})

describe('Profile slice extra reducers', () => {
  it('sets loading flags based on my_task_type and stores results', () => {
    const pendingMy = reducer(
      undefined,
      getMyTaskList.pending('req', {
        doctor_id: 1,
        patient_id: 2,
        filter: 'ALL',
        order: 'ASC',
      } as any)
    )
    expect(pendingMy.loadingMyTasks).toBe(true)

    const fulfilledMy = reducer(
      pendingMy,
      getMyTaskList.fulfilled([{my_task_id: 9}] as any, 'req', {my_task_type: undefined} as any)
    )
    expect(fulfilledMy.loadingMyTasks).toBe(false)
    expect(fulfilledMy.myTaskList?.[0].my_task_id).toBe(9)

    const pendingProd = reducer(
      undefined,
      getMyTaskList.pending('req', {
        doctor_id: 1,
        patient_id: 2,
        filter: 'ALL',
        order: 'ASC',
        my_task_type: 'PRODUCTION_CHECK_LIST',
      } as any)
    )
    expect(pendingProd.loadingProductionTasks).toBe(true)

    const fulfilledProd = reducer(
      pendingProd,
      getMyTaskList.fulfilled([{my_task_id: 11}] as any, 'req', {
        my_task_type: 'PRODUCTION_CHECK_LIST',
      } as any)
    )
    expect(fulfilledProd.productionTaskList?.[0].my_task_id).toBe(11)

    const pendingBatch = reducer(
      undefined,
      getMyTaskList.pending('req', {
        doctor_id: 1,
        patient_id: 2,
        filter: 'ALL',
        order: 'ASC',
        my_task_type: 'PRODUCTION_CHECK_LIST_BATCH',
        patient_id: 2,
        batch_id: 4,
      } as any)
    )
    expect(pendingBatch.loadingProductionTasksByBatch['2:4']).toBe(true)
  })

  it('handles checklist data and patient orders', () => {
    const pendingCheck = reducer(undefined, getCheckListData.pending('req', {batch_id: 1}))
    expect(pendingCheck.loadingProductionTasks).toBe(true)
    const fulfilledCheck = reducer(
      pendingCheck,
      getCheckListData.fulfilled([{id: 1}] as any, 'req', {batch_id: 1})
    )
    expect(fulfilledCheck.loadingProductionTasks).toBe(false)
    expect(fulfilledCheck.getProductionChecklist?.[0].id).toBe(1)

    const pendingOrders = reducer(
      undefined,
      PatientOrderList.pending('req', {
        doctor_id: 1,
        patient_id: 2,
        sort_criteria: {type: 'date', sort: 'ASC'},
      } as any)
    )
    expect(pendingOrders.loadingPatientOrderList).toBe(true)
    const fulfilledOrders = reducer(
      pendingOrders,
      PatientOrderList.fulfilled([{order_status: 'SUBMITTED'}] as any, 'req', {
        doctor_id: 1,
        patient_id: 2,
        sort_criteria: {type: 'date', sort: 'ASC'},
      } as any)
    )
    expect(fulfilledOrders.loadingPatientOrderList).toBe(false)
    expect(fulfilledOrders.patientOrderList).toEqual([{order_status: 'SUBMITTED'}])
  })

  it('computes pagination for customer order detail', () => {
    const pending = reducer(
      undefined,
      getCustomerOrderDetail.pending('req', {
        customer_profile_id: 1,
        sort_criteria: {type: 'date', sort: 'ASC'},
      } as any)
    )
    expect(pending.loadingCustomerOrderDetail).toBe(true)

    const payload = {
      orders: [
        {
          order_id: '1',
          pagination_details: {
            page_number: '2',
            page_size: '10',
            total_patients: '20',
            total_pages: '2',
            has_next: true,
            has_previous: false,
          },
        },
      ],
      pagination_details: {
        page_number: '2',
        page_size: '10',
        total_patients: '20',
        total_pages: '2',
        has_next: true,
        has_previous: false,
      },
    }
    const fulfilled = reducer(
      pending,
      getCustomerOrderDetail.fulfilled(payload as any, 'req', {
        customer_profile_id: 1,
        sort_criteria: {type: 'date', sort: 'ASC'},
      } as any)
    )
    expect(fulfilled.loadingCustomerOrderDetail).toBe(false)
    expect(fulfilled.customerOrderDetail[0].order_id).toBe('1')
    expect(fulfilled.customerOrderPagination?.page_number).toBe(2)
  })

  it('handles mini dashboard, patient details, and toggle tracking', () => {
    const pendingMini = reducer(
      undefined,
      getPatientDoctorMiniDashboardV4.pending('req', {customer_profile_id: 1, profile_id: 5})
    )
    expect(pendingMini.loadingMiniDashboard).toBe(true)
    const fulfilledMini = reducer(
      pendingMini,
      getPatientDoctorMiniDashboardV4.fulfilled({customer_tracking_enabled: false}, 'req', {
        customer_profile_id: 1,
        profile_id: 5,
      })
    )
    expect(fulfilledMini.loadingMiniDashboard).toBe(false)
    expect((fulfilledMini.miniDashboardData as any).customer_tracking_enabled).toBe(false)

    const pendingDetails = reducer(undefined, getPatientDetails.pending('req', {patientId: 9}))
    expect(pendingDetails.loadingPatientDetails).toBe(true)
    const fulfilledDetails = reducer(
      pendingDetails,
      getPatientDetails.fulfilled({name: 'P'}, 'req', {patientId: 9})
    )
    expect(fulfilledDetails.patientDetailsList).toEqual({name: 'P'})

    const pendingToggle = reducer(
      undefined,
      toggleCustomerTracking.pending('req', {customerProfileId: 1})
    )
    expect(pendingToggle.togglingCustomerTracking).toBe(true)
    const fulfilledToggle = reducer(
      pendingToggle,
      toggleCustomerTracking.fulfilled({customer_tracking_enabled: true, extra: 'x'}, 'req', {
        customerProfileId: 1,
      })
    )
    expect(fulfilledToggle.togglingCustomerTracking).toBe(false)
    expect((fulfilledToggle.miniDashboardData as any).customer_tracking_enabled).toBe(true)

    const rejectedToggle = reducer(
      pendingToggle,
      toggleCustomerTracking.rejected('err' as any, 'req', {customerProfileId: 1}, 'boom')
    )
    expect(rejectedToggle.toggleCustomerTrackingStatus).toBe('failed')
    expect(rejectedToggle.toggleCustomerTrackingError).toBe('boom')
  })

  it('ignores stale mini dashboard responses when a newer request is already pending', () => {
    const firstPending = reducer(
      undefined,
      getPatientDoctorMiniDashboardV4.pending('older-request', {
        customer_profile_id: 1,
        profile_id: 5,
      })
    )

    const secondPending = reducer(
      firstPending,
      getVspMiniDashboard.pending('newer-request', {
        customer_profile_id: 1,
        profile_id: 5,
        order_sort_by: 'ORDER_ID',
        patient_sort_by: 'PATIENT_NAME',
        order_by: 'ASC',
        pagination: {
          order_pagination: {page_no: 1, page_size: 10},
          patient_pagination: {page_no: 1, page_size: 10},
        },
      })
    )

    const staleFulfilled = reducer(
      secondPending,
      getPatientDoctorMiniDashboardV4.fulfilled(
        {total_patients: 0, total_customer_orders: 0, last_order_at: null},
        'older-request',
        {customer_profile_id: 1, profile_id: 5}
      )
    )

    expect(staleFulfilled.loadingMiniDashboard).toBe(true)
    expect(staleFulfilled.miniDashboardData).toBeNull()

    const latestFulfilled = reducer(
      staleFulfilled,
      getVspMiniDashboard.fulfilled(
        {
          total_patients: 12,
          total_customer_orders: 7,
          last_order_at: '2026-04-15T10:00:00.000Z',
          customer_tracking_enabled: true,
          customer_stl_file_view_enabled: false,
          customer_scan_file_view_enabled: false,
          customer_print_file_view_enabled: false,
          vsp_order_details: {
            pagination_details: {
              page_number: 1,
              page_size: 10,
              total_patients: 7,
              total_pages: 1,
              has_next: false,
              has_previous: false,
            },
            order_info_list: [],
          },
          vsp_patient_details: {
            pagination_details: {
              page_number: 1,
              page_size: 10,
              total_patients: 12,
              total_pages: 2,
              has_next: true,
              has_previous: false,
            },
            patient_info_list: [],
          },
        } as any,
        'newer-request',
        {
          customer_profile_id: 1,
          profile_id: 5,
          order_sort_by: 'ORDER_ID',
          patient_sort_by: 'PATIENT_NAME',
          order_by: 'ASC',
          pagination: {
            order_pagination: {page_no: 1, page_size: 10},
            patient_pagination: {page_no: 1, page_size: 10},
          },
        }
      )
    )

    expect(latestFulfilled.loadingMiniDashboard).toBe(false)
    expect((latestFulfilled.miniDashboardData as any).total_patients).toBe(12)
  })
})

describe('Profile thunks', () => {
  it('creates my task and returns data', async () => {
    mockedApiHelper.mockResolvedValueOnce({data: {ok: true}})
    const payload = {
      doctor_id: 1,
      patient_id: 2,
      title: 't',
      description: null,
      due_date: 'd',
      status: 'PENDING',
      priority: 'HIGH',
    } as any
    const result = await AddMyTaskData(payload)(
      baseArgs.dispatch,
      baseArgs.getState,
      baseArgs.extra
    )
    expect(mockedApiHelper).toHaveBeenCalledWith(URL_MY_TASK_CREATION, HttpMethod.POST, payload)
    expect(result.payload).toEqual({ok: true})
  })

  it('adds batch tasks with sanitized numbers', async () => {
    mockedApiHelper.mockResolvedValueOnce({status: 201, data: {saved: true}} as any)
    const result = await AddBatchTaskData([
      {
        patient_id: '3' as any,
        profile_id: '4' as any,
        manufacturing_batch_id: '5' as any,
        title: 'x',
        checked: 'false' as any,
      },
    ])(baseArgs.dispatch, baseArgs.getState, baseArgs.extra)

    expect(mockedApiHelper).toHaveBeenCalledWith(
      URL_BATCHES_TASK_CREATION,
      HttpMethod.POST,
      {
        data: [
          {patient_id: 3, profile_id: 4, manufacturing_batch_id: 5, title: 'x', checked: true},
        ],
      },
      true
    )
    expect(result.payload).toEqual({ok: true, status: 201, data: {saved: true}})
  })

  it('updates and deletes my task', async () => {
    mockedApiHelper.mockResolvedValueOnce({data: {updated: 1}})
    const updatePayload = {
      my_task_id: 1,
      doctor_id: 1,
      patient_id: 2,
      title: 't',
      description: null,
      due_date: 'd',
      status: 'PENDING',
      priority: 'HIGH',
      profile_id: 1,
      organization_id: 1,
    }
    const updateResult = await UpdateMyTaskData(updatePayload as any)(
      baseArgs.dispatch,
      baseArgs.getState,
      baseArgs.extra
    )
    expect(mockedApiHelper).toHaveBeenCalledWith(URL_MY_TASK_UPDATE, HttpMethod.PUT, updatePayload)
    expect(updateResult.payload).toEqual({updated: 1})

    mockedApiHelper.mockResolvedValueOnce({data: 'deleted'})
    const deleteResult = await DeleteMyTaskData({my_task_id: 9})(
      baseArgs.dispatch,
      baseArgs.getState,
      baseArgs.extra
    )
    expect(mockedApiHelper).toHaveBeenCalledWith(`${URL_MY_TASK_DELETE}9`, HttpMethod.DELETE, {
      my_task_id: 9,
    })
    expect(deleteResult.payload).toBe('deleted')
  })

  it('retrieves tasks, checklist, orders, dashboard, and patient details', async () => {
    mockedApiHelper
      .mockResolvedValueOnce({data: [{my_task_id: 5}]})
      .mockResolvedValueOnce({data: [{id: 1}]})
      .mockResolvedValueOnce({data: [{order_status: 'SUBMITTED'}, {order_status: 'DRAFT'}]})
      .mockResolvedValueOnce({data: {dash: true}})
      .mockResolvedValueOnce({data: {patient: true}})

    const tasks = await getMyTaskList({
      doctor_id: 1,
      patient_id: 2,
      filter: 'ALL',
      order: 'ASC',
    } as any)(baseArgs.dispatch, baseArgs.getState, baseArgs.extra)
    expect(mockedApiHelper).toHaveBeenCalledWith(
      URL_GET_MY_TASK_LIST,
      HttpMethod.POST,
      expect.any(Object)
    )
    expect(tasks.payload).toEqual([{my_task_id: 5}])

    const checklist = await getCheckListData({batch_id: 7})(
      baseArgs.dispatch,
      baseArgs.getState,
      baseArgs.extra
    )
    expect(mockedApiHelper).toHaveBeenCalledWith(
      `${URL_GET_PRODUCTION_CHECKLIST_DATA}7`,
      HttpMethod.GET
    )
    expect(checklist.payload).toEqual([{id: 1}])

    const orders = await PatientOrderList({
      doctor_id: 1,
      patient_id: 2,
      sort_criteria: {type: 'date', sort: 'ASC'},
    } as any)(baseArgs.dispatch, baseArgs.getState, baseArgs.extra)
    expect(mockedApiHelper).toHaveBeenCalledWith(
      URL_PATIENT_ORDER_LIST,
      HttpMethod.POST,
      expect.any(Object)
    )
    expect(orders.payload).toEqual([{order_status: 'SUBMITTED'}])

    const miniDash = await getPatientDoctorMiniDashboardV4({
      customer_profile_id: 11,
      profile_id: 10,
    })(baseArgs.dispatch, baseArgs.getState, baseArgs.extra)
    expect(mockedApiHelper).toHaveBeenCalledWith(
      URL_PATIENT_DOCTOR_MINI_DASHBOARD_V4,
      HttpMethod.POST,
      {customer_profile_id: 11, profile_id: 10}
    )
    expect(miniDash.payload).toEqual({dash: true})

    const patientDetails = await getPatientDetails({patientId: 12})(
      baseArgs.dispatch,
      baseArgs.getState,
      baseArgs.extra
    )
    expect(mockedApiHelper).toHaveBeenCalledWith(`${URL_GET_PATIENT_DETAILS}/12`, HttpMethod.GET)
    expect(patientDetails.payload).toEqual({patient: true})
  })

  it('toggles customer tracking and fetches customer orders', async () => {
    mockedApiHelper
      .mockResolvedValueOnce({data: {toggle: true}})
      .mockResolvedValueOnce({data: [{order_id: '1'}]})

    const toggle = await toggleCustomerTracking({customerProfileId: 3})(
      baseArgs.dispatch,
      baseArgs.getState,
      baseArgs.extra
    )
    expect(mockedApiHelper).toHaveBeenCalledWith(
      `${URL_TOGGLE_CUSTOMER_TRACKING}3`,
      HttpMethod.POST,
      {}
    )
    expect(toggle.payload).toEqual({toggle: true})

    const orders = await getCustomerOrderDetail({
      customer_profile_id: 3,
      sort_criteria: {type: 'date', sort: 'ASC'},
    } as any)(baseArgs.dispatch, baseArgs.getState, baseArgs.extra)
    expect(mockedApiHelper).toHaveBeenCalledWith(
      URL_CUSTOMER_ORDER_DETAIL,
      HttpMethod.POST,
      expect.any(Object)
    )
    expect(orders.payload).toEqual([{order_id: '1'}])
  })
})
