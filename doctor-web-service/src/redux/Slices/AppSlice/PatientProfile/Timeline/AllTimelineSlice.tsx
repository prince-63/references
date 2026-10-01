// apiSlice.ts

import {createSlice, createAsyncThunk} from '@reduxjs/toolkit'
import {URL_ALL_TIMELINE, URL_TIMELINE_NOTE_ADD} from '../../../../Endpoints/apiEndpoints'
import HttpMethod from '../../../../../@constants/httpMethods.constants'
import apiHelper from '../../../../../@utils/apiHelper'
import {TimelineData} from 'screens/Patients/LeadsProfile/main/Timeline/components/TimelinePart'
import {
  TimelineEventTypeList,
  TimelineEventsType,
} from 'screens/Patients/LeadsProfile/leadsProfile.types'
import {IEventType} from 'screens/Patients/LeadsProfile/main/Timeline/Timeline'

export type PostDataTimeLineNote = {
  doctor_id: number
  patient_id: number
  title: string
  note: string
}

export type PostDataTimeLine = {
  patientId: number
}

export type PostDataTimeLineResponse = {
  events: TimelineData[]
}

const isValidEventType = (type: string) => {
  return Object.values(TimelineEventsType).includes(type as TimelineEventTypeList)
}

export const postApiDataTimelineNoteAdd = createAsyncThunk(
  'api/postApiDataNoteAdd',
  async (postDataNoteAdd: PostDataTimeLineNote, {rejectWithValue}) => {
    try {
      const response = await apiHelper(URL_TIMELINE_NOTE_ADD, HttpMethod.POST, postDataNoteAdd)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.status?.message)
    }
  }
)

export const postApiDataAllTimeline = createAsyncThunk(
  'api/postDataAllTimeline',
  async (postDataAllTimeline: PostDataTimeLine, {rejectWithValue}) => {
    const {patientId} = postDataAllTimeline
    try {
      const response = await apiHelper(URL_ALL_TIMELINE + `${patientId}`, HttpMethod.GET)
      const allEvents: any[] = []
      const alignerChangeEvents: any[] = []
      const events = response.data.events
      Object.keys(events).forEach((day: any) => {
        const dayEvents = events[day]
        if (Array.isArray(dayEvents)) {
          dayEvents.forEach((event) => {
            allEvents.push(event)
            if (
              event.type === TimelineEventsType.FORCE_ALIGNER_CHANGE ||
              event.type === TimelineEventsType.ALIGNER_CHANGE
            ) {
              alignerChangeEvents.push(event)
            }
          })
        }
      })
      const filteredAllEvents: any[] = allEvents.filter((event: any) =>
        isValidEventType(event.type)
      )
      const filteredAlignerChangeEvents: any[] = alignerChangeEvents.filter((event: any) =>
        isValidEventType(event.type)
      )

      return {filteredAllEvents, filteredAlignerChangeEvents}
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.status?.message)
    }
  }
)

const AllTimelineSlice = createSlice({
  name: 'apiAllTimeline',
  initialState: {
    dataTimelineList: {filteredAllEvents: [], filteredAlignerChangeEvents: []} as IEventType,
    errorTimelineList: null as string | null,
    loadingTimelineList: false,

    data: null as any | null,
    error: null as string | null,
    loading: false,
    eventId: '0',
  },
  reducers: {
    setEventId: (state, action) => {
      state.eventId = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(postApiDataAllTimeline.pending, (state) => {
        state.loadingTimelineList = true
        state.errorTimelineList = null
      })
      .addCase(postApiDataAllTimeline.fulfilled, (state, action) => {
        state.loadingTimelineList = false
        state.dataTimelineList = action.payload
      })
      .addCase(postApiDataAllTimeline.rejected, (state, action) => {
        state.loadingTimelineList = false
        state.errorTimelineList =
          typeof action.payload === 'string' ? action.payload : 'An error occurred'
      })

      .addCase(postApiDataTimelineNoteAdd.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(postApiDataTimelineNoteAdd.fulfilled, (state, action) => {
        state.loading = false
        state.data = action.payload
      })
      .addCase(postApiDataTimelineNoteAdd.rejected, (state, action) => {
        state.loading = false
        state.error = typeof action.payload === 'string' ? action.payload : 'An error occurred'
      })
  },
})

export const {setEventId} = AllTimelineSlice.actions
export default AllTimelineSlice.reducer
