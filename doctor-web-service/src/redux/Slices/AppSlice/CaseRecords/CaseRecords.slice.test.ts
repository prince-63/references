import HttpMethod from '@constants/httpMethods.constants'
import reducer, {
  createCaseRecord,
  deleteCaseRecord,
  getAllCaseRecord,
  getCaseRecord,
  getSingleCaseRecord,
  markFilesUploadComplete,
  resetCaseRecordState,
  resetFilesUploadStatus,
} from './CaseRecords.slice'
import apiHelper from '@utils/apiHelper'
import {
  URL_CREATE_CASE_RECORD,
  URL_DELETE_CASE_RECORD,
  URL_GET_ALL_CASE_RECORD,
  URL_GET_CASE_RECORD,
  URL_GET_SINGLE_CASE_RECORD,
} from 'redux/Endpoints/apiEndpoints'

jest.mock('@utils/apiHelper', () => jest.fn())

const mockedApiHelper = apiHelper as jest.MockedFunction<typeof apiHelper>
const baseArgs = {dispatch: jest.fn(), getState: jest.fn(), extra: undefined as undefined}

beforeAll(() => {
  // Lightweight FormData stub so thunks can append payloads
  if (!('FormData' in global)) {
    ;(global as any).FormData = class {
      public store: Record<string, unknown[]> = {}
      append(key: string, value: unknown) {
        this.store[key] = [...(this.store[key] || []), value]
      }
    }
  }
})

beforeEach(() => {
  mockedApiHelper.mockReset()
  baseArgs.dispatch.mockReset()
  baseArgs.getState.mockReset()
})

describe('CaseRecords slice reducers', () => {
  it('initializes defaults and toggles upload flags', () => {
    const initial = reducer(undefined, {type: 'init'})
    expect(initial.loadingCreate).toBe(false)
    expect(initial.areAllFilesUploaded).toBe(false)

    const marked = reducer(initial, markFilesUploadComplete())
    expect(marked.areAllFilesUploaded).toBe(true)

    const resetUpload = reducer(marked, resetFilesUploadStatus())
    expect(resetUpload.areAllFilesUploaded).toBe(false)
  })

  it('resets the slice state to defaults', () => {
    const dirtyState = {
      ...reducer(undefined, {type: 'init'}),
      loadingCreate: true,
      loadingGet: true,
      loadingGetAll: true,
      errorCreate: 'e1',
      errorGet: 'e2',
      errorGetAll: 'e3',
      successCreate: true,
      successGet: true,
      successGetAll: true,
      caseRecordData: {id: 1} as any,
      allCaseRecords: [{id: 1}] as any,
    }

    const resetState = reducer(dirtyState, resetCaseRecordState())
    expect(resetState.loadingCreate).toBe(false)
    expect(resetState.loadingGet).toBe(false)
    expect(resetState.loadingGetAll).toBe(false)
    expect(resetState.errorCreate).toBeNull()
    expect(resetState.errorGet).toBeNull()
    expect(resetState.errorGetAll).toBeNull()
    expect(resetState.caseRecordData).toBeNull()
    expect(resetState.allCaseRecords).toBeNull()
  })

  it('handles createCaseRecord lifecycle', () => {
    const pendingState = reducer(
      undefined,
      createCaseRecord.pending('req', {
        chief_complaint: 'pain',
        patient_id: 1,
        profile_id: 2,
        scan_file_ids: [],
        xray_file_ids: [],
        doctor_id: 3,
        case_record_id: null,
      } as any)
    )
    expect(pendingState.loadingCreate).toBe(true)
    expect(pendingState.errorCreate).toBeNull()

    const fulfilledState = reducer(
      pendingState,
      createCaseRecord.fulfilled('ok' as any, 'req', {
        chief_complaint: 'pain',
        patient_id: 1,
        profile_id: 2,
        scan_file_ids: [],
        xray_file_ids: [],
        doctor_id: 3,
        case_record_id: null,
      } as any)
    )
    expect(fulfilledState.loadingCreate).toBe(false)
    expect(fulfilledState.successCreate).toBe(true)

    const rejectedState = reducer(
      pendingState,
      createCaseRecord.rejected(
        null as any,
        'req',
        {
          chief_complaint: 'pain',
          patient_id: 1,
          profile_id: 2,
          scan_file_ids: [],
          xray_file_ids: [],
          doctor_id: 3,
          case_record_id: null,
        } as any,
        'failed to save'
      )
    )
    expect(rejectedState.loadingCreate).toBe(false)
    expect(rejectedState.errorCreate).toBe('failed to save')
  })

  it('handles fetching a case record and captures payload', () => {
    const pendingState = reducer(undefined, getCaseRecord.pending('req', {patient_id: 10}))
    expect(pendingState.loadingGet).toBe(true)

    const fulfilledState = reducer(
      pendingState,
      getCaseRecord.fulfilled({data: 'record'} as any, 'req', {patient_id: 10})
    )
    expect(fulfilledState.loadingGet).toBe(false)
    expect(fulfilledState.caseRecordData).toEqual({data: 'record'})

    const rejectedState = reducer(
      pendingState,
      getCaseRecord.rejected(null as any, 'req', {patient_id: 10}, 'not found')
    )
    expect(rejectedState.errorGet).toBe('not found')
  })

  it('selects latest record on getAllCaseRecord and handles empty payloads', () => {
    const emptyState = reducer(undefined, getAllCaseRecord.fulfilled([], 'req', {patient_id: 1}))
    expect(emptyState.allCaseRecords).toEqual([])
    expect(emptyState.caseRecordData).toBeNull()

    const records = [
      {case_record_id: 1, created_at: '2023-01-01'} as any,
      {case_record_id: 2, created_at: ''} as any,
      {case_record_id: 3, created_at: '2024-02-01'} as any,
    ]
    const fulfilledState = reducer(
      undefined,
      getAllCaseRecord.fulfilled(records, 'req', {patient_id: 1})
    )
    expect(fulfilledState.allCaseRecords).toHaveLength(3)
    expect(fulfilledState.caseRecordData?.case_record_id).toBe(3)
  })

  it('tracks getSingleCaseRecord and deleteCaseRecord flags', () => {
    const pendingSingle = reducer(undefined, getSingleCaseRecord.pending('req', 7))
    expect(pendingSingle.loadingGetSingle).toBe(true)

    const fulfilledSingle = reducer(
      pendingSingle,
      getSingleCaseRecord.fulfilled({id: 7} as any, 'req', 7)
    )
    expect(fulfilledSingle.loadingGetSingle).toBe(false)
    expect(fulfilledSingle.caseRecordData).toEqual({id: 7})

    const rejectedSingle = reducer(
      pendingSingle,
      getSingleCaseRecord.rejected(null as any, 'req', 7, 'oops')
    )
    expect(rejectedSingle.errorGetSingle).toBe('oops')

    const pendingDelete = reducer(undefined, deleteCaseRecord.pending('req', 5))
    expect(pendingDelete.loadingDelete).toBe(true)

    const fulfilledDelete = reducer(
      pendingDelete,
      deleteCaseRecord.fulfilled('done' as any, 'req', 5)
    )
    expect(fulfilledDelete.loadingDelete).toBe(false)
    expect(fulfilledDelete.successDelete).toBe(true)

    const rejectedDelete = reducer(
      pendingDelete,
      deleteCaseRecord.rejected(null as any, 'req', 5, 'boom')
    )
    expect(rejectedDelete.loadingDelete).toBe(false)
    expect(rejectedDelete.errorDelete).toBe('boom')
  })
})

describe('CaseRecords thunks', () => {
  it('creates a case record and appends payload to FormData', async () => {
    mockedApiHelper.mockResolvedValueOnce({data: {ok: true}})

    const payload = {
      chief_complaint: 'pain',
      patient_id: 1,
      profile_id: 2,
      scan_file_ids: [11],
      xray_file_ids: [22],
      doctor_id: 3,
      case_record_id: null,
    }

    const result = await createCaseRecord(payload)(
      baseArgs.dispatch,
      baseArgs.getState,
      baseArgs.extra
    )

    expect(mockedApiHelper).toHaveBeenCalledWith(
      URL_CREATE_CASE_RECORD,
      HttpMethod.POST,
      expect.any(FormData)
    )
    const formDataArg = mockedApiHelper.mock.calls[0][2]
    expect(formDataArg instanceof FormData).toBe(true)
    expect(result.payload).toEqual({ok: true})
  })

  it('returns rejectWithValue message on create failure', async () => {
    mockedApiHelper.mockRejectedValueOnce({response: {data: {status: {message: 'create failed'}}}})

    const result = await createCaseRecord({
      chief_complaint: 'pain',
      patient_id: 1,
      profile_id: 2,
      scan_file_ids: [],
      xray_file_ids: [],
      doctor_id: 3,
      case_record_id: null,
    })(baseArgs.dispatch, baseArgs.getState, baseArgs.extra)

    expect(result.type).toMatch(/rejected$/)
    expect(result.payload).toBe('create failed')
  })

  it('posts case record fetch and returns data', async () => {
    mockedApiHelper.mockResolvedValueOnce({data: {record: 1}})

    const result = await getCaseRecord({patient_id: 9})(
      baseArgs.dispatch,
      baseArgs.getState,
      baseArgs.extra
    )

    expect(mockedApiHelper).toHaveBeenCalledWith(URL_GET_CASE_RECORD, HttpMethod.POST, {
      patient_id: 9,
    })
    expect(result.payload).toEqual({record: 1})
  })

  it('requests all case records by patient id', async () => {
    mockedApiHelper.mockResolvedValueOnce({data: [{case_record_id: 1}]})

    const result = await getAllCaseRecord({patient_id: 99})(
      baseArgs.dispatch,
      baseArgs.getState,
      baseArgs.extra
    )

    expect(mockedApiHelper).toHaveBeenCalledWith(`${URL_GET_ALL_CASE_RECORD}/99`, HttpMethod.GET)
    expect(result.payload).toEqual([{case_record_id: 1}])
  })

  it('includes orderId query parameter when provided', async () => {
    mockedApiHelper.mockResolvedValueOnce({data: []})
    await getAllCaseRecord({patient_id: 42, orderId: 'abc'})(
      baseArgs.dispatch,
      baseArgs.getState,
      baseArgs.extra
    )
    expect(mockedApiHelper).toHaveBeenCalledWith(
      `${URL_GET_ALL_CASE_RECORD}/42?orderId=abc`,
      HttpMethod.GET
    )

    mockedApiHelper.mockResolvedValueOnce({data: []})
    await getAllCaseRecord({patient_id: 42, orderId: null})(
      baseArgs.dispatch,
      baseArgs.getState,
      baseArgs.extra
    )
    expect(mockedApiHelper).toHaveBeenCalledWith(
      `${URL_GET_ALL_CASE_RECORD}/42?orderId=null`,
      HttpMethod.GET
    )
  })

  it('returns default error on getSingleCaseRecord failure', async () => {
    mockedApiHelper.mockRejectedValueOnce({})

    const result = await getSingleCaseRecord(55)(
      baseArgs.dispatch,
      baseArgs.getState,
      baseArgs.extra
    )

    expect(mockedApiHelper).toHaveBeenCalledWith(`${URL_GET_SINGLE_CASE_RECORD}/55`, HttpMethod.GET)
    expect(result.payload).toBe('Something went wrong')
  })

  it('deletes a case record and resolves payload', async () => {
    mockedApiHelper.mockResolvedValueOnce({data: 'deleted'})

    const result = await deleteCaseRecord(7)(baseArgs.dispatch, baseArgs.getState, baseArgs.extra)

    expect(mockedApiHelper).toHaveBeenCalledWith(`${URL_DELETE_CASE_RECORD}/7`, HttpMethod.DELETE)
    expect(result.payload).toBe('deleted')
  })
})
