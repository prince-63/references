import HttpMethod from '@constants/httpMethods.constants'
import {createSlice, createAsyncThunk} from '@reduxjs/toolkit'
import apiHelper from '@utils/apiHelper'
import {AddAppointmentFormValues} from 'components/addAppointment/addAppointment.types'
import {AddReminderFormValues} from 'components/AddReminder/addReminder.types'
import {
  URL_ACTIVE_CLINIC_LIST,
  URL_ADD_APPOINTMENT_EVENT,
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
import {
  CustomEventContentArg,
  CustomEventInput,
  IPatient,
  IPatientList,
  IPracticeLocation,
} from 'screens/Calendar/calendar.types'
import {optionType} from 'types/optionType'
import transformEvents from './transformEvents'
import reminderTypeConstants from '@constants/reminderType.constants'
import {safeParseInt} from 'utils/ConstFunctions'

export const getPatientsList = createAsyncThunk(
  'api/getAllPatientsList',
  async (
    params: {
      doctor_id: number
    },
    {rejectWithValue}
  ) => {
    try {
      const response = await apiHelper(URL_GET_ALL_PATIENTS, HttpMethod.POST, params)
      const patientsList: IPatient[] = response.data
      return patientsList.map((patient) => ({
        value: patient.patient_id,
        label: patient.patient_name,
        is_tracking_added: patient.is_tracking_added,
        amount_due: patient.amount_due,
        practice_location_id: patient.practice_location_id,
        treatment_cost_added: patient.treatment_cost_added,
        has_ongoing_orders: patient.has_ongoing_orders,
        patient_type: patient.patient_type,
        has_any_order: patient.has_any_order,
      }))
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.status?.message)
    }
  }
)
export const getPracticeLocationsList = createAsyncThunk(
  'api/getPracticeLocationsList',
  async (
    params: {
      doctor_id: number
      include_unassigned?: boolean
    },
    {rejectWithValue}
  ) => {
    try {
      const response = await apiHelper(URL_ACTIVE_CLINIC_LIST, HttpMethod.POST, {
        doctor_id: safeParseInt(params.doctor_id),
      })
      const practiceLocations: IPracticeLocation[] = response.data.practice_location_list

      if (params.include_unassigned) {
        return [
          {value: null as unknown as string, label: 'Unassigned'},
          ...practiceLocations.map((practiceLocation: IPracticeLocation) => ({
            value: practiceLocation.practice_location_id,
            label: practiceLocation.practice_location_name,
          })),
        ]
      } else {
        return practiceLocations.map((practiceLocation: IPracticeLocation) => ({
          value: practiceLocation.practice_location_id,
          label: practiceLocation.practice_location_name,
        }))
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.status?.message)
    }
  }
)

export const getEventsInDateRange = createAsyncThunk(
  'api/getEventsInDateRange',
  async (
    params: {
      doctor_id: number
      start_date: string
      end_date: string
    },
    {rejectWithValue}
  ) => {
    try {
      const response = await apiHelper(URL_GET_EVENTS_FOR_DATE_RANGE, HttpMethod.POST, params)
      return transformEvents(response.data)
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.status?.message)
    }
  }
)
export const addReminderEvent = createAsyncThunk(
  'api/addReminderEvent',
  async (payload: AddReminderFormValues & {doctor_id: number}, {rejectWithValue}) => {
    try {
      const response = await apiHelper(URL_ADD_REMINDER_EVENT, HttpMethod.POST, payload)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.status?.message)
    }
  }
)
export const addAppointmentEvent = createAsyncThunk(
  'api/addAppointmentEvent',
  async (payload: AddAppointmentFormValues & {doctor_id: number}, {rejectWithValue}) => {
    try {
      const response = await apiHelper(URL_ADD_APPOINTMENT_EVENT, HttpMethod.POST, payload)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error_code)
    }
  }
)
export const updateReminderEvent = createAsyncThunk(
  'api/updateReminderEvent',
  async (
    payload: AddReminderFormValues & {doctor_id: number; reminder_id: number},
    {rejectWithValue}
  ) => {
    try {
      const response = await apiHelper(URL_UPDATE_REMINDER_EVENT, HttpMethod.POST, payload)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.status?.message)
    }
  }
)
export const deleteEvent = createAsyncThunk(
  'api/deleteEvent',
  async (
    payload: {
      reminder_id: number
      isAppointment: boolean
      isReminder: boolean
      braces_journey_id?: number | null
      aligner_journey_id?: number | null
      patient_id?: number | null
      reminder_category?: keyof typeof reminderTypeConstants | null
    },
    {rejectWithValue}
  ) => {
    try {
      const payloadData = {
        reminder_id: payload.reminder_id,
        ...(payload.isAppointment && {braces_journey_id: payload.braces_journey_id}),
        ...(payload.isReminder && {aligner_journey_id: payload.aligner_journey_id}),
        ...(payload.isReminder && {reminder_category: payload.reminder_category}),
        ...(payload.isReminder && {patient_id: payload.patient_id}),
      }
      const response = await apiHelper(
        !payload.isAppointment ? URL_DELETE_REMINDER_EVENT : URL_DELETE_APPOINTMENT_EVENT,
        HttpMethod.POST,
        payloadData
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.status?.message)
    }
  }
)
export const updateAppointmentEvent = createAsyncThunk(
  'api/updateAppointmentEvent',
  async (
    payload: AddAppointmentFormValues & {doctor_id: number; reminder_id: number},
    {rejectWithValue}
  ) => {
    try {
      const response = await apiHelper(URL_UPDATE_APPOINTMENT_EVENT, HttpMethod.POST, payload)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.status?.message)
    }
  }
)

export const getNotes = createAsyncThunk(
  'api/getNotes',
  async (
    payload: {
      patient_id: number
      profile_id: number
    },
    {rejectWithValue}
  ) => {
    try {
      const response = await apiHelper(
        `${URL_GET_PROFILE_NOTES}${payload.profile_id}/${payload.patient_id}`,
        HttpMethod.GET
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.status?.message)
    }
  }
)

export const addNotes = createAsyncThunk(
  'api/addNotes',
  async (
    payload: {
      notes: string
      user_profile_id: number
      patient_id: number
    },
    {rejectWithValue}
  ) => {
    try {
      const response = await apiHelper(URL_ADD_NOTES, HttpMethod.POST, payload)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.status?.message)
    }
  }
)

export const updateNotes = createAsyncThunk(
  'api/updateNotes',
  async (
    payload: {
      note_id: number
      user_profile_id: number
      patient_id: number
      notes: string
    },
    {rejectWithValue}
  ) => {
    try {
      const response = await apiHelper(URL_UPDATE_NOTES, HttpMethod.PUT, payload)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.status?.message)
    }
  }
)

export const deleteNotes = createAsyncThunk(
  'api/deleteNotes',
  async (
    payload: {
      patientId: number
      noteId: number
    },
    {rejectWithValue}
  ) => {
    try {
      const response = await apiHelper(
        URL_DELETE_NOTES + payload?.patientId + '/' + payload?.noteId,
        HttpMethod.DELETE,
        {}
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.status?.message)
    }
  }
)

const CalendarSlice = createSlice({
  name: 'calendar',
  initialState: {
    patientsList: [] as IPatientList[],
    loadingPatientsList: false,
    practiceLocationsList: [] as optionType[],
    loadingPracticeLocationsList: false,
    currentEvents: [] as CustomEventInput[],
    gettingCalendarEvents: false,
    addingReminderEvent: false,
    addingAppointmentEvent: false,
    deletingEvent: false,
    selectedEvent: null as CustomEventContentArg['event'] | null,
    openPopover: null as string | null,
    addNotesLoading: false,
    notes: [] as any,
  },
  reducers: {
    setSelectedEvent: (state, action) => {
      state.selectedEvent = action.payload
    },
    setOpenPopover: (state, action) => {
      state.openPopover = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getPatientsList.pending, (state) => {
        state.loadingPatientsList = true
      })
      .addCase(getPatientsList.fulfilled, (state, action) => {
        state.loadingPatientsList = false
        state.patientsList = action.payload
      })
      .addCase(getPatientsList.rejected, (state) => {
        state.loadingPatientsList = false
      })
      .addCase(getPracticeLocationsList.pending, (state) => {
        state.loadingPracticeLocationsList = true
      })
      .addCase(getPracticeLocationsList.fulfilled, (state, action) => {
        state.loadingPracticeLocationsList = false
        state.practiceLocationsList = action.payload
      })
      .addCase(getPracticeLocationsList.rejected, (state) => {
        state.loadingPracticeLocationsList = false
      })
      .addCase(getEventsInDateRange.pending, (state) => {
        state.gettingCalendarEvents = true
      })
      .addCase(getEventsInDateRange.fulfilled, (state, action) => {
        state.gettingCalendarEvents = false
        state.currentEvents = action.payload
      })
      .addCase(getEventsInDateRange.rejected, (state) => {
        state.gettingCalendarEvents = false
      })
      .addCase(addReminderEvent.pending, (state) => {
        state.addingReminderEvent = true
      })
      .addCase(addReminderEvent.fulfilled, (state) => {
        state.addingReminderEvent = false
      })
      .addCase(addReminderEvent.rejected, (state) => {
        state.addingReminderEvent = false
      })
      .addCase(addAppointmentEvent.pending, (state) => {
        state.addingAppointmentEvent = true
      })
      .addCase(addAppointmentEvent.fulfilled, (state) => {
        state.addingAppointmentEvent = false
      })
      .addCase(addAppointmentEvent.rejected, (state) => {
        state.addingAppointmentEvent = false
      })
      .addCase(updateReminderEvent.pending, (state) => {
        state.addingReminderEvent = true
      })
      .addCase(updateReminderEvent.fulfilled, (state) => {
        state.addingReminderEvent = false
      })
      .addCase(updateReminderEvent.rejected, (state) => {
        state.addingReminderEvent = false
      })
      .addCase(deleteEvent.pending, (state) => {
        state.deletingEvent = true
      })
      .addCase(deleteEvent.fulfilled, (state) => {
        state.deletingEvent = false
      })
      .addCase(deleteEvent.rejected, (state) => {
        state.deletingEvent = false
      })
      .addCase(updateAppointmentEvent.pending, (state) => {
        state.addingAppointmentEvent = true
      })
      .addCase(updateAppointmentEvent.fulfilled, (state) => {
        state.addingAppointmentEvent = false
      })
      .addCase(updateAppointmentEvent.rejected, (state) => {
        state.addingAppointmentEvent = false
      })

      .addCase(getNotes.pending, (state) => {
        state.addNotesLoading = true
      })
      .addCase(getNotes.fulfilled, (state, action) => {
        state.addNotesLoading = false
        state.notes = action.payload
      })
      .addCase(getNotes.rejected, (state) => {
        state.addNotesLoading = false
      })

      .addCase(addNotes.pending, (state) => {
        state.addNotesLoading = true
      })
      .addCase(addNotes.fulfilled, (state) => {
        state.addNotesLoading = false
      })
      .addCase(addNotes.rejected, (state) => {
        state.addNotesLoading = false
      })
      .addCase(updateNotes.pending, (state) => {
        state.addNotesLoading = true
      })
      .addCase(updateNotes.fulfilled, (state) => {
        state.addNotesLoading = false
      })
      .addCase(updateNotes.rejected, (state) => {
        state.addNotesLoading = false
      })
      .addCase(deleteNotes.pending, (state) => {
        state.addNotesLoading = true
      })
      .addCase(deleteNotes.fulfilled, (state) => {
        state.addNotesLoading = false
      })
      .addCase(deleteNotes.rejected, (state) => {
        state.addNotesLoading = false
      })
  },
})

export const {setSelectedEvent, setOpenPopover} = CalendarSlice.actions
export default CalendarSlice.reducer
