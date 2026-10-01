// apiSlice.ts

import {createSlice, createAsyncThunk} from '@reduxjs/toolkit'
import {URL_INVITE_PATIENT} from '../../../Endpoints/apiEndpoints'
import HttpMethod from '../../../../@constants/httpMethods.constants'
import apiHelper from '../../../../@utils/apiHelper'

interface ApiResponse {
  data: any
}

interface ApiPostData {
  data: any
}

export const postApiDataAddAndSendInvite = createAsyncThunk(
  'api/postDataAddAndSendInvite',
  async (postDataAddAndSendInvite: ApiPostData, {rejectWithValue}) => {
    const {doctor_name, patient_id} = postDataAddAndSendInvite.data
    try {
      const response = await apiHelper(
        URL_INVITE_PATIENT + patient_id + '/' + doctor_name,
        HttpMethod.GET,
        postDataAddAndSendInvite.data
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error_code)
    }
  }
)

const AddAndSendInviteSlice = createSlice({
  name: 'apiAddAndSendInvite',
  initialState: {
    isModalConnectWithPatientOpen: false,
    data: null as ApiResponse | null,
    error: null as string | null,
    loading: false,
  },
  reducers: {
    clearDataAddAndSendInvite: (state) => {
      return {
        ...state,
        data: null,
        error: null,
        loading: false,
      }
    },
    setIsModalConnectWithPatientOpen(state, action) {
      state.isModalConnectWithPatientOpen = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(postApiDataAddAndSendInvite.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(postApiDataAddAndSendInvite.fulfilled, (state, action) => {
        state.loading = false
        state.data = action.payload
      })
      .addCase(postApiDataAddAndSendInvite.rejected, (state, action) => {
        state.loading = false
        state.error = typeof action.payload === 'string' ? action.payload : 'An error occurred'
      })
  },
})
export const {clearDataAddAndSendInvite, setIsModalConnectWithPatientOpen} =
  AddAndSendInviteSlice.actions
export default AddAndSendInviteSlice.reducer
