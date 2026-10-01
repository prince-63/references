import HttpMethod from '@constants/httpMethods.constants'
import reminderTypeConstants from '@constants/reminderType.constants'
import reducer, {
  addAppointmentEvent,
  addNotes,
  addReminderEvent,
  deleteEvent,
  getEventsInDateRange,
  getNotes,
  getPatientsList,
  getPracticeLocationsList,
  setOpenPopover,
  setSelectedEvent,
  updateAppointmentEvent,
  updateNotes,
  updateReminderEvent,
  deleteNotes,
} from './calendar.slice'
import transformEvents from './transformEvents'
import apiHelper from '@utils/apiHelper'
import {
  URL_ACTIVE_CLINIC_LIST,
  URL_ADD_NOTES,
  URL_ADD_REMINDER_EVENT,
  URL_DELETE_APPOINTMENT_EVENT,
  URL_DELETE_NOTES,
  URL_DELETE_REMINDER_EVENT,
  URL_GET_ALL_PATIENTS,
  URL_GET_EVENTS_FOR_DATE_RANGE,
  URL_GET_PROFILE_NOTES,
  URL_UPDATE_APPOINTMENT_EVENT,
  URL_UPDATE_NOTES,
  URL_UPDATE_REMINDER_EVENT,
} from 'redux/Endpoints/apiEndpoints'

jest.mock('@utils/apiHelper', () => jest.fn())

const mockedApiHelper = apiHelper as jest.MockedFunction<typeof apiHelper>
const baseArgs = {dispatch: jest.fn(), getState: jest.fn(), extra: undefined as undefined}

beforeEach(() => {
  mockedApiHelper.mockReset()
  baseArgs.dispatch.mockReset()
  baseArgs.getState.mockReset()
})

describe('calendar slice reducers', () => {
  it('initializes defaults and updates simple fields', () => {
    const initial = reducer(undefined, {type: 'init'})
    expect(initial.loadingPatientsList).toBe(false)
    expect(initial.practiceLocationsList).toEqual([])

    const withEvent = reducer(initial, setSelectedEvent({id: 1} as any))
    expect(withEvent.selectedEvent).toEqual({id: 1})

    const withPopover = reducer(withEvent, setOpenPopover('notes'))
    expect(withPopover.openPopover).toBe('notes')
  })

  it('toggles loading flags across extra reducers', () => {
    const pendingPatients = reducer(undefined, getPatientsList.pending('req', {doctor_id: 1}))
    expect(pendingPatients.loadingPatientsList).toBe(true)

    const fulfilledPatients = reducer(
      pendingPatients,
      getPatientsList.fulfilled([{value: 1, label: 'A'}] as any, 'req', {doctor_id: 1})
    )
    expect(fulfilledPatients.loadingPatientsList).toBe(false)
    expect(fulfilledPatients.patientsList[0].label).toBe('A')

    const pendingNotes = reducer(undefined, getNotes.pending('req', {patient_id: 1, profile_id: 2}))
    expect(pendingNotes.addNotesLoading).toBe(true)

    const fulfilledNotes = reducer(
      pendingNotes,
      getNotes.fulfilled(['note'], 'req', {patient_id: 1, profile_id: 2})
    )
    expect(fulfilledNotes.addNotesLoading).toBe(false)
    expect(fulfilledNotes.notes).toEqual(['note'])

    const pendingDelete = reducer(
      undefined,
      deleteEvent.pending('req', {reminder_id: 1, isAppointment: false, isReminder: true})
    )
    expect(pendingDelete.deletingEvent).toBe(true)

    const fulfilledDelete = reducer(
      pendingDelete,
      deleteEvent.fulfilled('ok' as any, 'req', {
        reminder_id: 1,
        isAppointment: false,
        isReminder: true,
      })
    )
    expect(fulfilledDelete.deletingEvent).toBe(false)
  })
})

describe('transformEvents', () => {
  it('adds end when end_date is provided', () => {
    const result = transformEvents([
      {
        id: '1',
        start: '2023-01-01',
        end: undefined,
        content: {details: {end_date: '2023-01-02'}},
      } as any,
      {id: '2', start: '2023-01-03', content: {details: {end_date: null}}} as any,
    ])

    expect(result[0].end).toBe('2023-01-02')
    expect(result[1].end).toBeUndefined()
  })
})

describe('calendar thunks', () => {
  it('maps patients list response', async () => {
    mockedApiHelper.mockResolvedValueOnce({
      data: [
        {
          patient_id: 7,
          patient_name: 'John',
          is_tracking_added: true,
          amount_due: 10,
          practice_location_id: 2,
          treatment_cost_added: true,
          has_ongoing_orders: false,
          patient_type: 'NEW',
          has_any_order: true,
        },
      ],
    })

    const result = await getPatientsList({doctor_id: 5})(
      baseArgs.dispatch,
      baseArgs.getState,
      baseArgs.extra
    )

    expect(mockedApiHelper).toHaveBeenCalledWith(URL_GET_ALL_PATIENTS, HttpMethod.POST, {
      doctor_id: 5,
    })
    expect(result.payload).toEqual([
      {
        value: 7,
        label: 'John',
        is_tracking_added: true,
        amount_due: 10,
        practice_location_id: 2,
        treatment_cost_added: true,
        has_ongoing_orders: false,
        patient_type: 'NEW',
        has_any_order: true,
      },
    ])
  })

  it('handles practice locations with and without unassigned', async () => {
    mockedApiHelper.mockResolvedValue({
      data: {practice_location_list: [{practice_location_id: 1, practice_location_name: 'Clinic'}]},
    } as any)

    const withUnassigned = await getPracticeLocationsList({doctor_id: 9, include_unassigned: true})(
      baseArgs.dispatch,
      baseArgs.getState,
      baseArgs.extra
    )
    expect(mockedApiHelper).toHaveBeenCalledWith(URL_ACTIVE_CLINIC_LIST, HttpMethod.POST, {
      doctor_id: 9,
    })
    expect((withUnassigned.payload as any)[0]).toEqual({value: null, label: 'Unassigned'})

    const withoutUnassigned = await getPracticeLocationsList({doctor_id: 10})(
      baseArgs.dispatch,
      baseArgs.getState,
      baseArgs.extra
    )
    expect((withoutUnassigned.payload as any)[0]).toEqual({value: 1, label: 'Clinic'})
  })

  it('transforms events from date range API', async () => {
    mockedApiHelper.mockResolvedValueOnce({
      data: [{content: {details: {end_date: '2023-01-02'}}, start: '2023-01-01'}],
    })

    const result = await getEventsInDateRange({
      doctor_id: 1,
      start_date: '2023-01-01',
      end_date: '2023-01-07',
    })(baseArgs.dispatch, baseArgs.getState, baseArgs.extra)

    expect(mockedApiHelper).toHaveBeenCalledWith(URL_GET_EVENTS_FOR_DATE_RANGE, HttpMethod.POST, {
      doctor_id: 1,
      start_date: '2023-01-01',
      end_date: '2023-01-07',
    })
    expect((result.payload as any)[0].end).toBe('2023-01-02')
  })

  it('adds reminder and appointment events', async () => {
    mockedApiHelper
      .mockResolvedValueOnce({data: {reminder: 1}})
      .mockRejectedValueOnce({response: {data: {error_code: 'APPT_ERR'}}})

    const reminderResult = await addReminderEvent({
      doctor_id: 1,
      notes: 'n',
      reminder_date: '2023',
      reminder_time: '10:00',
    } as any)(baseArgs.dispatch, baseArgs.getState, baseArgs.extra)
    expect(mockedApiHelper).toHaveBeenCalledWith(
      URL_ADD_REMINDER_EVENT,
      HttpMethod.POST,
      expect.any(Object)
    )
    expect(reminderResult.payload).toEqual({reminder: 1})

    const appointmentResult = await addAppointmentEvent({doctor_id: 1, notes: 'n'} as any)(
      baseArgs.dispatch,
      baseArgs.getState,
      baseArgs.extra
    )
    expect(appointmentResult.type).toMatch(/rejected$/)
    expect(appointmentResult.payload).toBe('APPT_ERR')
  })

  it('updates reminder and appointment events', async () => {
    mockedApiHelper
      .mockResolvedValueOnce({data: {updated: true}})
      .mockResolvedValueOnce({data: {appt: true}})

    const reminderResult = await updateReminderEvent({
      doctor_id: 1,
      reminder_id: 2,
      notes: 'n',
    } as any)(baseArgs.dispatch, baseArgs.getState, baseArgs.extra)
    expect(mockedApiHelper).toHaveBeenCalledWith(
      URL_UPDATE_REMINDER_EVENT,
      HttpMethod.POST,
      expect.objectContaining({reminder_id: 2})
    )
    expect(reminderResult.payload).toEqual({updated: true})

    const appointmentResult = await updateAppointmentEvent({
      doctor_id: 1,
      reminder_id: 3,
      notes: 'a',
    } as any)(baseArgs.dispatch, baseArgs.getState, baseArgs.extra)
    expect(mockedApiHelper).toHaveBeenCalledWith(
      URL_UPDATE_APPOINTMENT_EVENT,
      HttpMethod.POST,
      expect.objectContaining({reminder_id: 3})
    )
    expect(appointmentResult.payload).toEqual({appt: true})
  })

  it('deletes appointment vs reminder using correct endpoint', async () => {
    mockedApiHelper
      .mockResolvedValueOnce({data: 'reminder deleted'})
      .mockResolvedValueOnce({data: 'appointment deleted'})

    const reminderResult = await deleteEvent({
      reminder_id: 11,
      isAppointment: false,
      isReminder: true,
      aligner_journey_id: 5,
      patient_id: 7,
      reminder_category: 'ALIGNER_REMINDER' as keyof typeof reminderTypeConstants,
    })(baseArgs.dispatch, baseArgs.getState, baseArgs.extra)

    expect(mockedApiHelper).toHaveBeenCalledWith(URL_DELETE_REMINDER_EVENT, HttpMethod.POST, {
      reminder_id: 11,
      aligner_journey_id: 5,
      patient_id: 7,
      reminder_category: 'ALIGNER_REMINDER',
    })
    expect(reminderResult.payload).toBe('reminder deleted')

    const appointmentResult = await deleteEvent({
      reminder_id: 22,
      isAppointment: true,
      isReminder: false,
      braces_journey_id: 9,
    })(baseArgs.dispatch, baseArgs.getState, baseArgs.extra)

    expect(mockedApiHelper).toHaveBeenCalledWith(URL_DELETE_APPOINTMENT_EVENT, HttpMethod.POST, {
      reminder_id: 22,
      braces_journey_id: 9,
    })
    expect(appointmentResult.payload).toBe('appointment deleted')
  })

  it('retrieves, adds, updates, and deletes notes', async () => {
    mockedApiHelper
      .mockResolvedValueOnce({data: ['note']})
      .mockResolvedValueOnce({data: 'added'})
      .mockResolvedValueOnce({data: 'updated'})
      .mockResolvedValueOnce({data: 'deleted'})

    const getResult = await getNotes({patient_id: 3, profile_id: 9})(
      baseArgs.dispatch,
      baseArgs.getState,
      baseArgs.extra
    )
    expect(mockedApiHelper).toHaveBeenCalledWith(`${URL_GET_PROFILE_NOTES}9/3`, HttpMethod.GET)
    expect(getResult.payload).toEqual(['note'])

    const addResult = await addNotes({patient_id: 3, user_profile_id: 1, notes: 'n'})(
      baseArgs.dispatch,
      baseArgs.getState,
      baseArgs.extra
    )
    expect(mockedApiHelper).toHaveBeenCalledWith(URL_ADD_NOTES, HttpMethod.POST, {
      patient_id: 3,
      user_profile_id: 1,
      notes: 'n',
    })
    expect(addResult.payload).toBe('added')

    const updateResult = await updateNotes({
      patient_id: 3,
      user_profile_id: 1,
      note_id: 2,
      notes: 'u',
    })(baseArgs.dispatch, baseArgs.getState, baseArgs.extra)
    expect(mockedApiHelper).toHaveBeenCalledWith(URL_UPDATE_NOTES, HttpMethod.PUT, {
      patient_id: 3,
      user_profile_id: 1,
      note_id: 2,
      notes: 'u',
    })
    expect(updateResult.payload).toBe('updated')

    const deleteResult = await deleteNotes({patientId: 3, noteId: 4})(
      baseArgs.dispatch,
      baseArgs.getState,
      baseArgs.extra
    )
    expect(mockedApiHelper).toHaveBeenCalledWith(`${URL_DELETE_NOTES}3/4`, HttpMethod.DELETE)
    expect(deleteResult.payload).toBe('deleted')
  })
})
