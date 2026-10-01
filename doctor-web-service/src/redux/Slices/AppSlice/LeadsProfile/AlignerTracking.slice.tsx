import HttpMethod from '@constants/httpMethods.constants'
import {createAsyncThunk, createSlice} from '@reduxjs/toolkit'
import apiHelper from '@utils/apiHelper'
import {
  URL_GET_ALIGNER_UPDATES,
  URL_GET_ALIGNER_UPDATE_DETAILS,
  URL_FORCE_ALIGNER_CHANGE,
  URL_GET_RESUME_TREATMENT_DETAILS,
  URL_PAUSE_OR_RESUME_TREATMENT,
} from 'redux/Endpoints/apiEndpoints'
import {
  IActions,
  IAlignerUpdateDetails,
  IPausedTreatmentData,
  ResumeTreatmentFormValues,
} from 'screens/Patients/LeadsProfile/leadsProfile.types'

import {IFile} from 'screens/Patients/LeadsProfile/main/treatment/types/treatmentPlan.types'
import hasValue from 'utils/hasValue'
export interface IForceAlignerPhotoNameArray {
  original_filename: string
  save_as_filename: string
}
export interface ApiForceAlignerData {
  patient_id: number
  aligner_journey_id: number
  new_aligner_no: number
  previous_aligner_change_date: string
  aligner_action_type: string
  with_previous_aligner_photo_files: IForceAlignerPhotoNameArray[] | []
  with_new_aligner_photo_files: IForceAlignerPhotoNameArray[] | []
  without_new_aligner_photo_files: IForceAlignerPhotoNameArray[] | []
  previous_aligner_change_time: string
}
export interface IForceAlignerProps {
  startJawType: string
  endJawType: string
  startAlignerNumber: number
  endAlignerNumber: number
  changeTime?: number
  changeDate?: number
  alignerJourneyId?: number
  files?: IFile[]
}
interface IForceAlignerChange {
  startJawType: ''
  endJawType: ''
  startAlignerNumber: 0
  endAlignerNumber: 0
}
export interface ApiForceAlignerDataPayload {
  details: ApiForceAlignerData
  photo: File[]
}
export const forceAlignerChangeAPI = createAsyncThunk(
  'api/forceAlignerChange',
  async (postDataToGetTrackingDetails: ApiForceAlignerDataPayload, {rejectWithValue}) => {
    try {
      const formData = new FormData()
      formData.append('details', JSON.stringify(postDataToGetTrackingDetails.details))
      if (hasValue(postDataToGetTrackingDetails.photo)) {
        postDataToGetTrackingDetails.photo.forEach((file) => {
          formData.append('photo', file)
        })
      }
      const response = await apiHelper(`${URL_FORCE_ALIGNER_CHANGE}`, HttpMethod.POST, formData)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data)
    }
  }
)
export const pauseOrResumeTreatment = createAsyncThunk(
  'api/pauseOrResumeTreatment',

  async (
    resumeTreatmentPayload: {
      aligner_journey_id: number
      treatment_state: string
      resume_date?: string
      start_date?: string
      aligner_no?: number
      wear_days?: number | string
      reason_for_pausing?: string | null
      jaw_type?: string
      end_date?: string
    },
    {rejectWithValue}
  ) => {
    try {
      const response = await apiHelper(
        `${URL_PAUSE_OR_RESUME_TREATMENT}`,
        HttpMethod.POST,
        resumeTreatmentPayload
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response.data)
    }
  }
)

export const getPausedTreatmentData = createAsyncThunk(
  'api/getPausedTreatmentData',
  async (
    getPausedTreatmentDataParams: {
      aligner_journey_id: number
    },
    {rejectWithValue}
  ) => {
    try {
      const response = await apiHelper(
        `${URL_GET_RESUME_TREATMENT_DETAILS}${getPausedTreatmentDataParams.aligner_journey_id}`,
        HttpMethod.GET
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response.data)
    }
  }
)
export const getAlignerUpdates = createAsyncThunk(
  'api/getAlignerUpdates',
  async (
    getAlignerUpdatesParams: {
      aligner_journey_id: number
    },
    {rejectWithValue}
  ) => {
    try {
      const response = await apiHelper(
        `${URL_GET_ALIGNER_UPDATES}${getAlignerUpdatesParams.aligner_journey_id}`,
        HttpMethod.GET
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response.data)
    }
  }
)
export const getAlignerUpdateDetails = createAsyncThunk(
  'api/getAlignerUpdateDetails',
  async (
    getAlignerUpdateDetailsParams: {
      aligner_action_id: number
    },
    {rejectWithValue}
  ) => {
    try {
      const response = await apiHelper(
        `${URL_GET_ALIGNER_UPDATE_DETAILS}${getAlignerUpdateDetailsParams.aligner_action_id}`,
        HttpMethod.GET
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response.data)
    }
  }
)

const AlignerTracking = createSlice({
  name: 'alignerTracking',
  initialState: {
    resumeTreatmentDetails: {} as ResumeTreatmentFormValues,
    gettingPausedTreatmentData: false,
    pausedTreatmentData: {} as IPausedTreatmentData,
    pausingOrResumingTreatment: false,
    alignerUpdates: {} as IActions,
    alignerUpdateDetails: {} as IAlignerUpdateDetails,
    selectedUpdate: null, // change it to null later
    dataPostForceAlignerChange: {} as any,
    errorPostForceAlignerChange: null as string | null,
    loadingPostForceAlignerChange: false,
    dataForceAlignerData: {
      startJawType: '',
      endJawType: '',
      startAlignerNumber: 0,
      endAlignerNumber: 0,
    } as IForceAlignerChange | null,
  },
  reducers: {
    setResumeTreatmentDetails: (state, action) => {
      state.resumeTreatmentDetails = action.payload
    },
    setDataForceAlignerData(state, action) {
      state.dataForceAlignerData = action.payload
    },
    setSelectedUpdate(state, action) {
      state.selectedUpdate = action.payload
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getPausedTreatmentData.pending, (state) => {
      state.gettingPausedTreatmentData = true
    })

    builder.addCase(getPausedTreatmentData.fulfilled, (state, action) => {
      state.gettingPausedTreatmentData = false
      state.pausedTreatmentData = action.payload
    })
    builder.addCase(getAlignerUpdates.pending, () => {})

    builder
      .addCase(getAlignerUpdates.fulfilled, (state, action) => {
        state.alignerUpdates = action.payload
        // state.selectedUpdate = state.selectedUpdate ?? action.payload.actions[0]?.aligner_acton_id
      })
      .addCase(getAlignerUpdates.rejected, (state) => {
        state.alignerUpdates = {} as IActions
      })
    builder.addCase(getAlignerUpdateDetails.pending, () => {})
    builder
      .addCase(getAlignerUpdateDetails.fulfilled, (state, action) => {
        state.alignerUpdateDetails = action.payload
      })

      .addCase(pauseOrResumeTreatment.pending, (state) => {
        state.pausingOrResumingTreatment = true
      })

      .addCase(pauseOrResumeTreatment.fulfilled, (state) => {
        state.pausingOrResumingTreatment = false
      })

      .addCase(pauseOrResumeTreatment.rejected, (state) => {
        state.pausingOrResumingTreatment = false
      })
      .addCase(forceAlignerChangeAPI.pending, (state) => {
        state.loadingPostForceAlignerChange = true
        state.errorPostForceAlignerChange = null
      })
      .addCase(forceAlignerChangeAPI.fulfilled, (state, action) => {
        state.loadingPostForceAlignerChange = false
        state.dataPostForceAlignerChange = action.payload
      })
      .addCase(forceAlignerChangeAPI.rejected, (state, action) => {
        state.loadingPostForceAlignerChange = false
        state.errorPostForceAlignerChange =
          typeof action.payload === 'string' ? action.payload : 'An error occurred'
      })
  },
})

export const {setResumeTreatmentDetails, setDataForceAlignerData, setSelectedUpdate} =
  AlignerTracking.actions

export default AlignerTracking.reducer
