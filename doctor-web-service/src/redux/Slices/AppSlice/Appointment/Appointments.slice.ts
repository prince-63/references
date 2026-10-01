import HttpMethod from '@constants/httpMethods.constants'
import {createAsyncThunk, createSlice} from '@reduxjs/toolkit'
import apiHelper from '@utils/apiHelper'
import {URL_APPOINTMENTS_LIST} from 'redux/Endpoints/apiEndpoints'
import {RowDataForAppointmentsList} from 'screens/Patients/LeadsProfile/main/appointments/types/appointments.types'
export const getAppointmentsList = createAsyncThunk(
  'api/getAppointmentsList',
  async (
    params: {
      doctor_id: number
      status: string
      patient_id: number
    },
    {rejectWithValue}
  ) => {
    try {
      const response = await apiHelper(
        `${URL_APPOINTMENTS_LIST}?doctor_id=${params.doctor_id}&patient_id=${params.patient_id}&filter=${params.status}`,
        HttpMethod.GET
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response.data)
    }
  }
)

const AppointmentsSlice = createSlice({
  name: 'appointments',
  initialState: {
    appointmentsList: [] as RowDataForAppointmentsList[],
    loadingAppointmentsList: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getAppointmentsList.pending, (state) => {
      state.loadingAppointmentsList = true
    })

    builder.addCase(getAppointmentsList.fulfilled, (state, action) => {
      state.loadingAppointmentsList = false
      state.appointmentsList = action.payload
    })

    builder.addCase(getAppointmentsList.rejected, (state) => {
      state.loadingAppointmentsList = false
    })
  },
})
export default AppointmentsSlice.reducer
