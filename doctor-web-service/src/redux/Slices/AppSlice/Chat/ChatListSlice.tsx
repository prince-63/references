// apiSlice.ts

import {createSlice, createAsyncThunk} from '@reduxjs/toolkit'
import {URL_CHAT_LIST, URL_CHAT_LIST_PATIENT} from '../../../Endpoints/apiEndpoints'
import HttpMethod from '../../../../@constants/httpMethods.constants'
import apiHelper from '../../../../@utils/apiHelper'
import {RowDataForBroadcastListPatients} from 'screens/Patients/Chat/components/broadCast/broadCastTypes'
import broadCastListPatientsFilterOptionType from '@constants/broadCastListPatientsFilterOptionType'

interface ApiResponse {
  practice_location_list: any
  size: number
}

interface ApiPostData {
  data: any
}

export const postApiDataChatList = createAsyncThunk(
  'api/postDataChatList',
  async (postDataChatList: ApiPostData, {rejectWithValue}) => {
    try {
      const response = await apiHelper(URL_CHAT_LIST, HttpMethod.POST, postDataChatList.data)

      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data)
    }
  }
)
export const getBroadCastPatientsList = createAsyncThunk(
  'api/getBroadCastPatientsList',
  async (
    payload: {
      doctor_id: number
      aligner_journey_filter: keyof typeof broadCastListPatientsFilterOptionType
    },
    {rejectWithValue}
  ) => {
    try {
      const response = await apiHelper(URL_CHAT_LIST_PATIENT, HttpMethod.POST, payload)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data)
    }
  }
)

const ChatListSlice = createSlice({
  name: 'apiChatList',
  initialState: {
    data: null as ApiResponse | null,
    error: null as string | null,
    loading: false,
    broadCastPatientsList: [] as RowDataForBroadcastListPatients[],
    loadingBroadCastPatientsList: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(postApiDataChatList.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(postApiDataChatList.fulfilled, (state, action) => {
        state.loading = false
        state.data = action.payload
      })
      .addCase(postApiDataChatList.rejected, (state, action) => {
        state.loading = false
        state.error = typeof action.payload === 'string' ? action.payload : 'An error occurred'
      })
      .addCase(getBroadCastPatientsList.pending, (state) => {
        state.loadingBroadCastPatientsList = true
      })
      .addCase(getBroadCastPatientsList.fulfilled, (state, action) => {
        state.loadingBroadCastPatientsList = false
        state.broadCastPatientsList = action.payload
      })
      .addCase(getBroadCastPatientsList.rejected, (state) => {
        state.loadingBroadCastPatientsList = false
      })
  },
})

export default ChatListSlice.reducer
