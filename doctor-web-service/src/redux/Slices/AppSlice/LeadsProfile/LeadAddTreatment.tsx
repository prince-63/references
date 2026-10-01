import HttpMethod from '@constants/httpMethods.constants'
import treatmentTypeMain from '@constants/treatmentTypeMain'
import {createAsyncThunk, createSlice} from '@reduxjs/toolkit'
import apiHelper from '@utils/apiHelper'
import {URL_GET_LEAD_TREATMENT_LIST} from 'redux/Endpoints/apiEndpoints'
import {ITreatment} from 'screens/Patients/LeadsProfile/main/treatment/types/addTreatment.types'
export interface payloadForAddTreatment {
  doctor_id: number
  patient_id: number
  treatment_type: string
  treatment_sub_type: string
}
export const getLeadsTreatmentList = createAsyncThunk(
  'api/getLeadsTreatmentList',
  async (
    apiGetLeadTreatmentParams: {
      doctor_id: string
      patient_id: string
    },
    {rejectWithValue}
  ) => {
    try {
      const response = await apiHelper(
        `${URL_GET_LEAD_TREATMENT_LIST}?doctorId=${apiGetLeadTreatmentParams.doctor_id}&patientId=${apiGetLeadTreatmentParams.patient_id}`,
        HttpMethod.GET
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response.data)
    }
  }
)

const LeadAddTreatment = createSlice({
  name: 'addTreatment',
  initialState: {
    loadingTreatment: false,
    treatmentsFetchError: null as string | null,
    treatments: [] as ITreatment[],
    addTreatmentList: {} as ITreatment,
    isModalSuccessAddTreatmentOpen: false,
    selectedTreatment: treatmentTypeMain.ALIGNERS,
  },
  reducers: {
    setIsModalSuccessAddTreatmentOpen(state, action) {
      state.isModalSuccessAddTreatmentOpen = action.payload
    },
    setSelectedTreatment(state, action) {
      state.selectedTreatment = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getLeadsTreatmentList.pending, (state) => {
        state.loadingTreatment = true
        state.treatmentsFetchError = null
      })
      .addCase(getLeadsTreatmentList.fulfilled, (state, action) => {
        state.loadingTreatment = false
        state.treatments = action.payload
      })
      .addCase(getLeadsTreatmentList.rejected, (state, action) => {
        state.loadingTreatment = false
        state.treatmentsFetchError =
          typeof action.payload === 'string' ? action.payload : 'An error occurred'
      })
  },
})
export const {setIsModalSuccessAddTreatmentOpen, setSelectedTreatment} = LeadAddTreatment.actions

export default LeadAddTreatment.reducer
