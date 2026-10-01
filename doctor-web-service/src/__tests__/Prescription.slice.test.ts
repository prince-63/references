import HttpMethod from '@constants/httpMethods.constants'
import reducer, {
  deletePrescription,
  getApiDataPrescription,
  getApiDataPrescriptionByPatient,
  postApiDataPrescriptionAdd,
  resetPrescriptionState,
  updatePrescription,
} from 'redux/Slices/AppSlice/Prescription/Prescription.slice'
import apiHelper from '@utils/apiHelper'
import {
  URL_CREATE_PRESCRIPTION,
  URL_DELETE_PRESCRIPTION_BY_ID,
  URL_GET_PRESCRIPTION_BY_ID,
  URL_GET_PRESCRIPTION_BY_PATIENT,
  URL_UPDATE_PRESCRIPTION_BY_ID,
} from 'redux/Endpoints/apiEndpoints'

jest.mock('@utils/apiHelper', () => jest.fn())

const mockedApiHelper = apiHelper as jest.MockedFunction<typeof apiHelper>
const baseThunkArgs = {dispatch: jest.fn(), getState: jest.fn(), extra: undefined as undefined}
const initial = reducer(undefined, {type: '@@init'})

const makePending = (action: any, payload?: any) => reducer(initial, action('id', payload as any))

describe('Prescription slice reducers', () => {
  it('resets prescription state', () => {
    const modified = reducer(initial, getApiDataPrescription.fulfilled({x: 1} as any, 'id', 1))
    const cleared = reducer(modified, resetPrescriptionState())
    expect(cleared.prescriptionData).toBeNull()
    expect(cleared.prescriptionsByPatient).toEqual([])
  })
})

describe('Prescription slice thunks', () => {
  beforeEach(() => {
    mockedApiHelper.mockReset()
  })

  it('adds prescription via POST', async () => {
    mockedApiHelper.mockResolvedValueOnce({data: {created: true}} as any)
    const res = await postApiDataPrescriptionAdd({data: {foo: 'bar'}} as any)(
      baseThunkArgs.dispatch,
      baseThunkArgs.getState,
      baseThunkArgs.extra
    )
    expect(mockedApiHelper).toHaveBeenCalledWith(URL_CREATE_PRESCRIPTION, HttpMethod.POST, {
      foo: 'bar',
    })
    expect(res.payload).toEqual({created: true})

    const pending = reducer(initial, postApiDataPrescriptionAdd.pending('id', {data: {}} as any))
    expect(pending.postLoading).toBe(true)
    const fulfilled = reducer(
      initial,
      postApiDataPrescriptionAdd.fulfilled({} as any, 'id', {data: {}} as any)
    )
    expect(fulfilled.postSuccess).toBe(true)
  })

  it('gets prescription by id', async () => {
    mockedApiHelper.mockResolvedValueOnce({data: {id: 5}} as any)
    const res = await getApiDataPrescription(5)(
      baseThunkArgs.dispatch,
      baseThunkArgs.getState,
      baseThunkArgs.extra
    )
    expect(mockedApiHelper).toHaveBeenCalledWith(`${URL_GET_PRESCRIPTION_BY_ID}/5`, HttpMethod.GET)
    expect(res.payload).toEqual({id: 5})

    const pending = makePending(getApiDataPrescription.pending, 5)
    expect(pending.getLoading).toBe(true)
    const fulfilled = reducer(initial, getApiDataPrescription.fulfilled({id: 5} as any, 'id', 5))
    expect(fulfilled.prescriptionData).toEqual({id: 5})
  })

  it('appends orderId query when calling by patient', async () => {
    mockedApiHelper.mockResolvedValueOnce({data: []} as any)
    await getApiDataPrescriptionByPatient({patientId: 7, orderId: 'xyz'})(
      baseThunkArgs.dispatch,
      baseThunkArgs.getState,
      baseThunkArgs.extra
    )
    expect(mockedApiHelper).toHaveBeenCalledWith(
      `${URL_GET_PRESCRIPTION_BY_PATIENT}/7?orderId=xyz`,
      HttpMethod.GET
    )

    mockedApiHelper.mockResolvedValueOnce({data: []} as any)
    await getApiDataPrescriptionByPatient({patientId: 7, orderId: null})(
      baseThunkArgs.dispatch,
      baseThunkArgs.getState,
      baseThunkArgs.extra
    )
    expect(mockedApiHelper).toHaveBeenCalledWith(
      `${URL_GET_PRESCRIPTION_BY_PATIENT}/7?orderId=null`,
      HttpMethod.GET
    )
  })

  it('gets prescriptions by patient with flexible payload shapes', async () => {
    mockedApiHelper.mockResolvedValueOnce({data: {prescriptions: [{prescription_id: 1}]}} as any)
    const res = await getApiDataPrescriptionByPatient(9)(
      baseThunkArgs.dispatch,
      baseThunkArgs.getState,
      baseThunkArgs.extra
    )
    expect(mockedApiHelper).toHaveBeenCalledWith(
      `${URL_GET_PRESCRIPTION_BY_PATIENT}/9`,
      HttpMethod.GET
    )
    expect(res.payload).toEqual({prescriptions: [{prescription_id: 1}]})

    const pending = makePending(getApiDataPrescriptionByPatient.pending, 9)
    expect(pending.getByPatientLoading).toBe(true)
    const fulfilled = reducer(
      initial,
      getApiDataPrescriptionByPatient.fulfilled(
        {prescriptions: [{prescription_id: 1}]} as any,
        'id',
        9
      )
    )
    expect(fulfilled.prescriptionsByPatient).toEqual([{prescription_id: 1}])
  })

  it('updates a prescription', async () => {
    mockedApiHelper.mockResolvedValueOnce({data: {ok: true}} as any)
    await updatePrescription({prescriptionId: 12, data: {notes: 'n'}})(
      baseThunkArgs.dispatch,
      baseThunkArgs.getState,
      baseThunkArgs.extra
    )
    expect(mockedApiHelper).toHaveBeenCalledWith(
      `${URL_UPDATE_PRESCRIPTION_BY_ID}/12`,
      HttpMethod.PUT,
      {notes: 'n'}
    )
  })

  it('deletes a prescription and removes it from state', async () => {
    mockedApiHelper.mockResolvedValueOnce({data: {deleted: true}} as any)
    const result = await deletePrescription(21)(
      baseThunkArgs.dispatch,
      baseThunkArgs.getState,
      baseThunkArgs.extra
    )
    expect(mockedApiHelper).toHaveBeenCalledWith(
      `${URL_DELETE_PRESCRIPTION_BY_ID}/21`,
      HttpMethod.DELETE,
      {}
    )
    expect(result.payload).toEqual({data: {deleted: true}})

    const populated = {
      ...initial,
      prescriptionsByPatient: [{prescription_id: 21}, {prescription_id: 99}] as any,
    }
    const fulfilled = reducer(populated, deletePrescription.fulfilled({} as any, 'id', 21))
    expect(fulfilled.prescriptionsByPatient).toEqual([{prescription_id: 99}])
  })
})
