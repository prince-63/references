import HttpMethod from '@constants/httpMethods.constants'
import invitationStatusTypes from '@constants/invitationStatusTypes'
import treatmentTypeMain from '@constants/treatmentTypeMain'
import {createSlice, createAsyncThunk} from '@reduxjs/toolkit'
import apiHelper from '@utils/apiHelper'
import {URL_GET_TRACKING_DETAILS, URL_POST_TRACKING_DETAILS} from 'redux/Endpoints/apiEndpoints'
import {
  TrackingAddingPayload,
  TrackingDetailsType,
} from 'screens/Patients/LeadsProfile/main/treatment/Tracking/types/tracking.types'

interface ApiPostDataForGetTrackingDetails {
  patient_id: string
  doctor_id: number
  treatment_subtype: keyof typeof treatmentTypeMain
}
export const getTrackingDetails = createAsyncThunk(
  'api/getTrackingDetails',
  async (postDataToGetTrackingDetails: ApiPostDataForGetTrackingDetails, {rejectWithValue}) => {
    const {patient_id, doctor_id, treatment_subtype} = postDataToGetTrackingDetails
    try {
      const response = await apiHelper(
        URL_GET_TRACKING_DETAILS +
          '?doctor_id=' +
          doctor_id +
          '&patient_id=' +
          patient_id +
          '&treatment_subtype=' +
          treatment_subtype,
        HttpMethod.GET
      )
      return response.data
    } catch (error: any) {
      handlePostTrackingDetails({})
      return rejectWithValue(error.response?.data)
    }
  }
)

export const postTrackingDetails = createAsyncThunk(
  'api/postTrackingDetails',
  async (payloadForPostTrackingDetails: TrackingAddingPayload, {rejectWithValue}) => {
    try {
      const response = await apiHelper(
        URL_POST_TRACKING_DETAILS,
        HttpMethod.POST,
        payloadForPostTrackingDetails
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response.data)
    }
  }
)
const Tracking = createSlice({
  name: 'tracking',
  initialState: {
    dataGetTrackingDetails: {} as TrackingDetailsType,
    errorGetTrackingDetails: null as string | null,
    loadingGetTrackingDetails: false,
    // Post Tracking
    dataPostTrackingDetails: {
      is_invitation_sent: invitationStatusTypes.UNASSIGNED,
    } as any,
    errorPostTrackingDetails: null as string | null,
    loadingPostTrackingDetails: false,
    isModalTrackingAddedOpen: false,
  },
  reducers: {
    handlePostTrackingDetails(state, action) {
      state.dataGetTrackingDetails = action.payload
    },
    setIsModalAddedTrackingOpen(state, action) {
      state.isModalTrackingAddedOpen = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getTrackingDetails.pending, (state) => {
        state.loadingGetTrackingDetails = true
        state.errorGetTrackingDetails = null
      })
      .addCase(getTrackingDetails.fulfilled, (state, action) => {
        state.loadingGetTrackingDetails = false
        state.dataGetTrackingDetails = action.payload
      })
      .addCase(getTrackingDetails.rejected, (state, action) => {
        state.loadingGetTrackingDetails = false
        state.errorGetTrackingDetails =
          typeof action.payload === 'string' ? action.payload : 'An error occurred'
      })

      .addCase(postTrackingDetails.pending, (state) => {
        state.loadingPostTrackingDetails = true
        state.errorPostTrackingDetails = null
      })
      .addCase(postTrackingDetails.fulfilled, (state, action) => {
        state.loadingPostTrackingDetails = false
        state.dataPostTrackingDetails = action.payload
      })
      .addCase(postTrackingDetails.rejected, (state, action) => {
        state.loadingPostTrackingDetails = false
        state.errorPostTrackingDetails =
          typeof action.payload === 'string' ? action.payload : 'An error occurred'
      })
  },
})
export const {handlePostTrackingDetails, setIsModalAddedTrackingOpen} = Tracking.actions

export default Tracking.reducer
