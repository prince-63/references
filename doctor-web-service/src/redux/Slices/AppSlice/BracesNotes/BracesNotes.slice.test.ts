import bracesReminderStatus from '@constants/bracesReminderStatus'
import bracesTreatmentStageConstants from '@constants/bracesTreatmentStage.constants.ts'
import HttpMethod from '@constants/httpMethods.constants'
import jawType from '@constants/jawType'
import reducer, {
  getAppointmentReminderList,
  getBracesNotesDetails,
  getBracesNotesList,
  getBracesTreatmentMaterialNameList,
  getBracesTreatmentMaterialShapeList,
  getBracesTreatmentMaterialSizeList,
  getBracesTreatmentStageList,
  getSpaceClosureToolAndAccessoriesList,
  postAddAccessories,
  postAddMaterialName,
  postAddMaterialSize,
  postAddPhotos,
  postAddSpaceAndClosure,
  postAttachBracesNotes,
  postDeleteAppointment,
  postDeleteAppointmentReminder,
  postUpdateAttachedBracesNotes,
  postUpdateFilesAppointment,
  setAccessoriesList,
  setAppointmentDetails,
  setAppointmentList,
  setAppointmentReminderList,
  setBracesTreatmentStageList,
} from './BracesNotes.slice'
import apiHelper from '@utils/apiHelper'

jest.mock('@utils/apiHelper', () => jest.fn())

const mockedApiHelper = apiHelper as jest.MockedFunction<typeof apiHelper>

const baseArgs = {dispatch: jest.fn(), getState: jest.fn(), extra: undefined as undefined}

beforeEach(() => {
  mockedApiHelper.mockReset()
  baseArgs.dispatch.mockReset()
  baseArgs.getState.mockReset()
})

beforeAll(() => {
  // Lightweight FormData stub for thunk calls that append payloads
  if (!('FormData' in global)) {
    ;(global as any).FormData = class {
      private store: Record<string, unknown[]> = {}
      append(key: string, value: unknown) {
        this.store[key] = [...(this.store[key] || []), value]
      }
    }
  }
})

describe('BracesNotes slice', () => {
  it('returns the initial state', () => {
    const state = reducer(undefined, {type: 'unknown'})
    expect(state.getAppointmentReminderListLoading).toBe(false)
    expect(state.bracesNotesList).toEqual([])
    expect(state.bracesTreatmentStageList).toEqual([])
  })

  it('updates basic reducers', () => {
    const baseState = reducer(undefined, {type: 'init'})
    const reminderState = reducer(
      baseState,
      setAppointmentReminderList([{status: bracesReminderStatus.UPCOMING}] as any)
    )
    expect(reminderState.appointmentReminderList).toHaveLength(1)

    const listState = reducer(baseState, setAppointmentList([{id: 1}] as any))
    expect(listState.bracesNotesList[0].id).toBe(1)

    const stageState = reducer(
      baseState,
      setBracesTreatmentStageList([{value: '1', label: 'Stage 1'}])
    )
    expect(stageState.bracesTreatmentStageList[0].label).toBe('Stage 1')

    const accessoriesState = reducer(baseState, setAccessoriesList({accessoriesList: ['hooks']}))
    expect(accessoriesState.accessoriesList).toEqual(['hooks'])

    const detailsState = reducer(baseState, setAppointmentDetails({id: 5} as any))
    expect(detailsState.bracesNotesDetails).toEqual({id: 5})
  })

  it('handles appointment reminder lifecycle flags', () => {
    const pendingState = reducer(
      undefined,
      getAppointmentReminderList.pending('request', {doctor_id: 1, patient_id: 2})
    )
    expect(pendingState.getAppointmentReminderListLoading).toBe(true)

    const fulfilledState = reducer(
      pendingState,
      getAppointmentReminderList.fulfilled([{status: 'UPCOMING'}] as any, 'request', {
        doctor_id: 1,
        patient_id: 2,
      })
    )
    expect(fulfilledState.getAppointmentReminderListLoading).toBe(false)
    expect(fulfilledState.appointmentReminderList[0].status).toBe('UPCOMING')

    const rejectedState = reducer(
      pendingState,
      getAppointmentReminderList.rejected(null as any, 'request', {doctor_id: 1, patient_id: 2})
    )
    expect(rejectedState.getAppointmentReminderListLoading).toBe(false)
  })

  it('splits treatment material lists by jaw type', () => {
    const shapeUpperState = reducer(
      undefined,
      getBracesTreatmentMaterialShapeList.fulfilled([{value: '1', label: 'Upper'}], 'req', {
        jawType: jawType.UPPER,
      })
    )
    expect(shapeUpperState.bracesTreatmentMaterialShapeList.upper).toHaveLength(1)

    const shapeLowerState = reducer(
      shapeUpperState,
      getBracesTreatmentMaterialShapeList.fulfilled([{value: '2', label: 'Lower'}], 'req', {
        jawType: jawType.LOWER,
      })
    )
    expect(shapeLowerState.bracesTreatmentMaterialShapeList.lower[0].value).toBe('2')

    const nameState = reducer(
      undefined,
      getBracesTreatmentMaterialNameList.fulfilled([{value: '10', label: 'Bracket'}], 'req', {
        jawType: jawType.UPPER,
      })
    )
    expect(nameState.bracesTreatmentMaterialNameList.upper[0].label).toBe('Bracket')

    const sizeState = reducer(
      undefined,
      getBracesTreatmentMaterialSizeList.fulfilled([{value: 7, label: 'Small'}] as any, 'req', {
        jawType: jawType.BOTH,
      })
    )
    expect(sizeState.bracesTreatmentMaterialSizeList.upper[0].label).toBe('Small')
  })

  it('updates accessory and stage lists from thunks', () => {
    const spaceState = reducer(
      undefined,
      getSpaceClosureToolAndAccessoriesList.fulfilled(
        {spaceClosureToolList: ['tool'], accessoriesList: ['elastic']},
        'req',
        {doctor_id: 1}
      )
    )
    expect(spaceState.spaceClosureToolList).toEqual(['tool'])
    expect(spaceState.accessoriesList).toEqual(['elastic'])

    const stageState = reducer(
      undefined,
      getBracesTreatmentStageList.fulfilled([{value: '1', label: 'Stage'}], 'req', {data: null})
    )
    expect(stageState.bracesTreatmentStageList[0].label).toBe('Stage')
  })

  it('handles appointment mutation flows', () => {
    const addPending = reducer(undefined, postAttachBracesNotes.pending('req', {} as any))
    expect(addPending.postAddAppointmentLoading).toBe(true)

    const addFulfilled = reducer(
      addPending,
      postAttachBracesNotes.fulfilled('saved', 'req', {} as any)
    )
    expect(addFulfilled.postAddAppointmentLoading).toBe(false)
    expect(addFulfilled.postAddAppointmentData).toBe('saved')

    const updateFulfilled = reducer(
      addFulfilled,
      postUpdateAttachedBracesNotes.fulfilled('updated', 'req', {} as any)
    )
    expect(updateFulfilled.postAddAppointmentData).toBe('updated')

    const deleteReminderState = reducer(
      undefined,
      postDeleteAppointmentReminder.fulfilled('deleted', 'req', {reminder_id: 1})
    )
    expect(deleteReminderState.deleteAppointmentReminderData).toBe('deleted')

    const deleteAppointmentState = reducer(
      undefined,
      postDeleteAppointment.fulfilled('deleted appointment', 'req', {
        appointment_id: 1,
        doctor_id: 1,
        profile_id: 2,
        organization_id: 3,
      })
    )
    expect(deleteAppointmentState.deleteAppointmentReminderData).toBe('deleted appointment')

    const filesPending = reducer(
      undefined,
      postUpdateFilesAppointment.pending('req', {appointment_id: 1, doctor_id: 1, files: []})
    )
    expect(filesPending.postUpdateFilesAppointmentLoading).toBe(true)

    const filesFinished = reducer(
      filesPending,
      postUpdateFilesAppointment.fulfilled('ok', 'req', {
        appointment_id: 1,
        doctor_id: 1,
        files: [],
      })
    )
    expect(filesFinished.postUpdateFilesAppointmentLoading).toBe(false)
  })

  it('handles details and photo flows', () => {
    const detailsState = reducer(
      undefined,
      getBracesNotesDetails.fulfilled({id: 'abc'} as any, 'req', {appointment_id: 'abc'})
    )
    expect(detailsState.bracesAppointmentDetails.id).toBe('abc')

    const photosPending = reducer(
      undefined,
      postAddPhotos.pending('req', {doctor_id: 1, appointment_id: 2, files: []})
    )
    expect(photosPending.postAddPhotosLoading).toBe(true)

    const photosState = reducer(
      photosPending,
      postAddPhotos.fulfilled('stored', 'req', {doctor_id: 1, appointment_id: 2, files: []})
    )
    expect(photosState.postAddPhotosLoading).toBe(false)
    expect(photosState.postAddPhotosData).toBe('stored')
  })
})

describe('BracesNotes thunks', () => {
  it('filters appointment reminders to upcoming only', async () => {
    mockedApiHelper.mockResolvedValueOnce({
      data: [{status: bracesReminderStatus.UPCOMING}, {status: bracesReminderStatus.COMPLETED}],
    })

    const result = await getAppointmentReminderList({doctor_id: 1, patient_id: 2})(
      baseArgs.dispatch,
      baseArgs.getState,
      baseArgs.extra
    )

    expect(mockedApiHelper).toHaveBeenCalledWith(
      expect.stringContaining('?doctor_id=1&patient_id=2'),
      HttpMethod.GET
    )
    expect(result.payload).toEqual([{status: bracesReminderStatus.UPCOMING}])
  })

  it('propagates braces notes fetch errors via rejectWithValue', async () => {
    mockedApiHelper.mockRejectedValueOnce({response: {data: 'error'}})

    const result = await getBracesNotesList({doctor_id: 5, patient_id: 9})(
      baseArgs.dispatch,
      baseArgs.getState,
      baseArgs.extra
    )

    expect(result.type).toMatch(/rejected$/)
    expect(result.payload).toBe('error')
  })

  it('sorts and labels treatment stages', async () => {
    mockedApiHelper.mockResolvedValueOnce({
      data: [
        {
          material_stage_id: 2,
          material_stage_type: bracesTreatmentStageConstants.FINISHING_AND_DETAILING,
        },
        {
          material_stage_id: 1,
          material_stage_type: bracesTreatmentStageConstants.LEVELLING_AND_ALIGNMENT,
        },
      ],
    })

    const result = await getBracesTreatmentStageList({data: null})(
      baseArgs.dispatch,
      baseArgs.getState,
      baseArgs.extra
    )

    expect(result.payload[0]).toEqual({value: '1', label: 'Levelling & Alignment'})
    expect(result.payload[1].value).toBe('2')
  })

  it('maps material shapes, names, sizes, and accessory lists', async () => {
    mockedApiHelper
      .mockResolvedValueOnce({data: [{id: 7, material_shape: 'upper'}]})
      .mockResolvedValueOnce({data: [{id: 5, name: 'Bracket'}]})
      .mockResolvedValueOnce({data: [{id: 3, name: 'Small'}]})
      .mockResolvedValueOnce({
        data: [
          {material_tool_type: 'SPACE_CLOSURE_TOOL', material_tool_name: 'tool'},
          {material_tool_type: 'ACCESSORIES', material_tool_name: 'elastic'},
        ],
      })

    const shapeResult = await getBracesTreatmentMaterialShapeList({
      treatmentMaterialStageId: 1,
      jawType: jawType.UPPER,
    })(baseArgs.dispatch, baseArgs.getState, baseArgs.extra)
    expect(shapeResult.payload).toEqual([{value: '7', label: 'Upper'}])

    const nameResult = await getBracesTreatmentMaterialNameList({
      doctor_id: 1,
      treatmentMaterialShapeId: 7,
      jawType: jawType.UPPER,
    })(baseArgs.dispatch, baseArgs.getState, baseArgs.extra)
    expect(nameResult.payload).toEqual([{value: '5', label: 'Bracket'}])

    const sizeResult = await getBracesTreatmentMaterialSizeList({
      doctor_id: 1,
      treatmentMaterialNameId: 5,
      jawType: jawType.LOWER,
    })(baseArgs.dispatch, baseArgs.getState, baseArgs.extra)
    expect(sizeResult.payload).toEqual([{value: 3, label: 'Small'}])

    const accessoryResult = await getSpaceClosureToolAndAccessoriesList({doctor_id: 1})(
      baseArgs.dispatch,
      baseArgs.getState,
      baseArgs.extra
    )
    expect(accessoryResult.payload).toEqual({
      spaceClosureToolList: ['tool'],
      accessoriesList: ['elastic'],
    })
  })

  it('handles accessory and material creation responses and errors', async () => {
    mockedApiHelper
      .mockRejectedValueOnce({response: {data: {error_code: 'E1'}}})
      .mockResolvedValueOnce({data: 'size-added'})
      .mockResolvedValueOnce({data: 'space-added'})
      .mockResolvedValueOnce({data: 'accessory-added'})

    const addNameResult = await postAddMaterialName({id: 1, doctor_id: 1, material_name: 'arch'})(
      baseArgs.dispatch,
      baseArgs.getState,
      baseArgs.extra
    )
    expect(addNameResult.payload).toBe('E1')

    const addSizeResult = await postAddMaterialSize({id: 1, doctor_id: 1, material_name: 'M'})(
      baseArgs.dispatch,
      baseArgs.getState,
      baseArgs.extra
    )
    expect(addSizeResult.payload).toBe('size-added')

    const addSpaceResult = await postAddSpaceAndClosure({
      doctor_id: 1,
      material_name: 'name',
      material_tool_type: 'SPACE_CLOSURE_TOOL',
    })(baseArgs.dispatch, baseArgs.getState, baseArgs.extra)
    expect(addSpaceResult.payload).toBe('space-added')

    const addAccessoryResult = await postAddAccessories({
      doctor_id: 1,
      material_name: 'name',
      material_tool_type: 'ACCESSORIES',
    })(baseArgs.dispatch, baseArgs.getState, baseArgs.extra)
    expect(addAccessoryResult.payload).toBe('accessory-added')
  })

  it('sends appointment attachments, updates, and photos', async () => {
    mockedApiHelper
      .mockResolvedValueOnce({data: 'appointment-added'})
      .mockResolvedValueOnce({data: 'appointment-updated'})
      .mockResolvedValueOnce({data: 'files-updated'})
      .mockResolvedValueOnce({data: 'photos-added'})

    const attachResult = await postAttachBracesNotes({files: [], doctor_id: 1} as any)(
      baseArgs.dispatch,
      baseArgs.getState,
      baseArgs.extra
    )
    expect(attachResult.payload).toBe('appointment-added')

    const updateResult = await postUpdateAttachedBracesNotes({files: [], doctor_id: 1} as any)(
      baseArgs.dispatch,
      baseArgs.getState,
      baseArgs.extra
    )
    expect(updateResult.payload).toBe('appointment-updated')

    const updateFilesResult = await postUpdateFilesAppointment({
      appointment_id: 1,
      doctor_id: 1,
      files: [],
    })(baseArgs.dispatch, baseArgs.getState, baseArgs.extra)
    expect(updateFilesResult.payload).toBe('files-updated')

    const addPhotosResult = await postAddPhotos({appointment_id: 1, doctor_id: 1, files: []})(
      baseArgs.dispatch,
      baseArgs.getState,
      baseArgs.extra
    )
    expect(addPhotosResult.payload).toBe('photos-added')
  })
})
