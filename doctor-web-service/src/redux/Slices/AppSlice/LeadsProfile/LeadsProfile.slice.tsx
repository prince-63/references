import HttpMethod from '@constants/httpMethods.constants'
import leadsOverviewConstants from '@constants/leadsOverview.constants'
import {createAsyncThunk, createSlice} from '@reduxjs/toolkit'
import apiHelper from '@utils/apiHelper'
import patientOverviewAlignerActionFilterConstants from '@constants/patientOverviewAlignerActionFilterConstants.constants'
import {IPatientTimeline} from 'screens/Patients/NewPatientProfile/patientTimeline.types'
import {
  URL_ASSIGN_PRACTICE,
  URL_GET_CASE_INFORMATION,
  URL_GET_LEADS_OVERVIEW,
  URL_LEADS_OVERVIEW_GETTING_STARTED_MARK_READ,
  URL_GET_PATIENT_TIMELINE,
  URL_GET_PATIENT_TIMELINE_LIST,
} from 'redux/Endpoints/apiEndpoints'
import {
  getOverviewDataType,
  gettingStartedOverviewDataType,
} from 'screens/Patients/LeadsProfile/leadsProfile.types'
import {caseInfoEmptyData} from 'screens/Patients/LeadsProfile/main/caseInformation/AddCaseInformation'
import {IFile} from 'screens/Patients/LeadsProfile/main/treatment/types/treatmentPlan.types'
import productTypes from '@constants/productTypes'

interface ApiPostData {
  patient_id: string
  doctor_id: string
  product_type: string
}
// Interface for Relations
export interface Relations {
  molar: number | null
  canine: number | null
  incisor: number | null
  skeletal: number | null
}

// Interface for the main object
export interface CaseInfo {
  cheif_complaint: string
  missing_teeth: number[] | null // Assuming missing_teeth is a number, change type if needed
  allergy: string[] | null
  medical_condition: string[] | null
  dental_history: string[] | null
  relations: Relations
  overjet: string
  deep_bite: string
  deep_bite_in_percentage: string
  open_bite: string
  midline: string
  remarks: string
  extra_oral_remarks: string
  cephalometric_analysis: string
  diagnosis: string
  treatment_objective: string
  files: IFile[]
  filesToSave?: File[]
}
export interface CaseInfoResponse {
  metadata: CaseInfo | null
  files: IFile[]
}

export const getCaseInformation = createAsyncThunk(
  'api/getCaseInformation',
  async (postDataToGetCaseInformation: ApiPostData, {rejectWithValue}) => {
    try {
      const response = await apiHelper(
        `${URL_GET_CASE_INFORMATION}?patient_id=${postDataToGetCaseInformation.patient_id}&doctor_id=${postDataToGetCaseInformation.doctor_id}&product_type=${postDataToGetCaseInformation.product_type}`,
        HttpMethod.GET
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response.data)
    }
  }
)

interface ApiGetLeadsOverviewPostData {
  data: any
}

export const getApiLeadsOverview = createAsyncThunk(
  'api/postDataLeadsOverviewGet',
  async (postDataLeadsOverviewGet: ApiGetLeadsOverviewPostData, {rejectWithValue}) => {
    const {patient_id, doctor_id} = postDataLeadsOverviewGet.data
    try {
      const response = await apiHelper(
        URL_GET_LEADS_OVERVIEW + patient_id + '/' + doctor_id,
        HttpMethod.GET
      )

      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data)
    }
  }
)

// export const getApiGettingStartedLeadsOverview = createAsyncThunk(
//   'api/postGettingStartedDataLeadsOverviewGet',
//   async (
//     postGettingStartedDataLeadsOverviewGet: {
//       patient_id: number
//       doctor_id: number
//     },
//     {rejectWithValue}
//   ) => {
//     const {patient_id, doctor_id} = postGettingStartedDataLeadsOverviewGet
//     try {
//       const response = await apiHelper(
//         URL_GET_LEADS_OVERVIEW_GETTING_STARTED + doctor_id + '/' + patient_id,
//         HttpMethod.GET
//       )

//       return response.data
//     } catch (error: any) {
//       return rejectWithValue(error.response?.data)
//     }
//   }
// )

export const markGettingStartedComplete = createAsyncThunk(
  'api/postMarkGettingStartedComplete',
  async (
    postMarkGettingStartedComplete: {
      patient_id: number
    },
    {rejectWithValue}
  ) => {
    try {
      const response = await apiHelper(
        URL_LEADS_OVERVIEW_GETTING_STARTED_MARK_READ,
        HttpMethod.POST,
        postMarkGettingStartedComplete
      )

      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data)
    }
  }
)
export const assignPracticeToPatient = createAsyncThunk(
  'api/assignPracticeToPatient',
  async (
    assignPracticeToPatientData: {
      patient_id: number
      practice_profile_id: number
    },
    {rejectWithValue}
  ) => {
    try {
      const response = await apiHelper(
        URL_ASSIGN_PRACTICE,
        HttpMethod.POST,
        assignPracticeToPatientData
      )

      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data)
    }
  }
)

export const getPatientTimeline = createAsyncThunk(
  'api/getPatientTimeline',
  async (
    getPatientTimelineParams: {
      doctor_id: number
      patient_id: number
      filter: keyof typeof patientOverviewAlignerActionFilterConstants
    },
    {rejectWithValue}
  ) => {
    try {
      const response = await apiHelper(
        `${URL_GET_PATIENT_TIMELINE}`,
        HttpMethod.POST,
        getPatientTimelineParams
      )
      return response.data as IPatientTimeline
    } catch (error: any) {
      return rejectWithValue(error.response.data)
    }
  }
)

export const getPatientTimeLineList = createAsyncThunk(
  'api/getPatientTimeLineList',
  async (
    getPatientTimeLineListParams: {
      doctor_id: number
      patient_id: number
      filter: keyof typeof patientOverviewAlignerActionFilterConstants
    },
    {rejectWithValue}
  ) => {
    try {
      const response = await apiHelper(
        `${URL_GET_PATIENT_TIMELINE_LIST}`,
        HttpMethod.POST,
        getPatientTimeLineListParams
      )
      return response.data as IPatientTimeline
    } catch (error: any) {
      return rejectWithValue(error.response.data)
    }
  }
)

type FilterOption = {
  key: keyof typeof patientOverviewAlignerActionFilterConstants
  label: string
}

const INITIAL_FILTER: FilterOption = {
  key: patientOverviewAlignerActionFilterConstants.CURRENT_ALIGNER,
  label: 'Current Aligner',
}

const LeadsProfile = createSlice({
  name: 'leadsProfile',
  initialState: {
    caseInformation: {metadata: null, files: []} as CaseInfoResponse,
    caseInformationOriginal: {} as CaseInfoResponse,
    reviewCaseInfoData: caseInfoEmptyData as CaseInfo,
    caseInfoFiles: {},
    gettingCaseInformation: false,
    error: null as string | null,
    dataLeadsOverview: {} as getOverviewDataType,
    loadingLeadsOverview: false,
    errorLeadsOverview: null as string | null,
    selectedFilter: INITIAL_FILTER,
    selectedOverviewStep:
      leadsOverviewConstants.ASSESSMENT as (typeof leadsOverviewConstants)[keyof typeof leadsOverviewConstants],
    loadingMarkGettingStartedComplete: false,
    dataMarkGettingStartedComplete: {} as gettingStartedOverviewDataType,
    errorMarkGettingStartedComplete: null as string | null,
    isAssignPracticeDrawerOpen: false,
    skipAssessmentTab: false,
    patientTimeline: {} as IPatientTimeline | null,
    patientTimelineList: [] as IPatientTimeline[],
    loadingPatientTimelineList: false,
    getPatientTimelineLoading: false,
    getPatientTimelineError: null as string | null,
    activeKey: null,
    loadingAssigningPracticeToPatient: false,

    selectedTabMenu: productTypes.ALIGNERS as keyof typeof productTypes,
  },
  reducers: {
    setCaseInformation: (state, action) => {
      state.reviewCaseInfoData = action.payload
    },
    setSelectedFilter: (state, action) => {
      if (state.selectedFilter?.key === action.payload?.key) return
      state.selectedFilter = action.payload
    },
    setSelectedOverviewStep: (state, action) => {
      state.selectedOverviewStep = action.payload
    },
    setSkipAssessmentTab: (state, action) => {
      state.skipAssessmentTab = action.payload
    },
    setDataLeadsOverview: (state, action) => {
      state.dataLeadsOverview = action.payload
    },
    setIsAssignPracticeDrawerOpen: (state, action) => {
      state.isAssignPracticeDrawerOpen = action.payload
    },
    setActiveKey: (state, action) => {
      state.activeKey = action.payload
    },
    setSelectedTabMenu: (state, action) => {
      state.selectedTabMenu = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getCaseInformation.pending, (state) => {
        state.gettingCaseInformation = true
        state.error = null
      })
      .addCase(getCaseInformation.fulfilled, (state, action) => {
        state.gettingCaseInformation = false
        state.caseInformation = action.payload
        state.caseInformationOriginal = action.payload
      })
      .addCase(getCaseInformation.rejected, (state, action) => {
        state.gettingCaseInformation = false
        state.caseInformation = null as any
        state.error = typeof action.payload === 'string' ? action.payload : 'An error occurred'
      })

      //Get overview
      .addCase(getApiLeadsOverview.pending, (state) => {
        state.loadingLeadsOverview = true
        state.errorLeadsOverview = null
      })
      .addCase(getApiLeadsOverview.fulfilled, (state, action) => {
        state.loadingLeadsOverview = false
        state.dataLeadsOverview = action.payload
      })
      .addCase(getApiLeadsOverview.rejected, (state, action) => {
        state.loadingLeadsOverview = false
        state.errorLeadsOverview =
          typeof action.payload === 'string' ? action.payload : 'An error occurred'
      })

      //Getting started overview mark as read
      .addCase(markGettingStartedComplete.pending, (state) => {
        state.loadingMarkGettingStartedComplete = true
        state.errorMarkGettingStartedComplete = null
      })
      .addCase(markGettingStartedComplete.fulfilled, (state, action) => {
        state.loadingMarkGettingStartedComplete = false
        state.dataMarkGettingStartedComplete = action.payload
      })
      .addCase(markGettingStartedComplete.rejected, (state, action) => {
        state.loadingMarkGettingStartedComplete = false
        state.errorMarkGettingStartedComplete =
          typeof action.payload === 'string' ? action.payload : 'An error occurred'
      })

      // Patient Timeline
      .addCase(getPatientTimeline.pending, (state) => {
        state.getPatientTimelineLoading = true
        state.getPatientTimelineError = null
      })
      .addCase(getPatientTimeline.fulfilled, (state, action) => {
        state.getPatientTimelineLoading = false
        state.patientTimeline = action.payload
      })
      .addCase(getPatientTimeline.rejected, (state, action) => {
        state.getPatientTimelineLoading = false
        state.getPatientTimelineError = action.payload as string
      })
      .addCase(assignPracticeToPatient.pending, (state) => {
        state.loadingAssigningPracticeToPatient = true
      })
      .addCase(assignPracticeToPatient.fulfilled, (state) => {
        state.loadingAssigningPracticeToPatient = false
      })
      .addCase(assignPracticeToPatient.rejected, (state) => {
        state.loadingAssigningPracticeToPatient = false
      })
      .addCase(getPatientTimeLineList.pending, (state) => {
        state.loadingPatientTimelineList = true
      })
      .addCase(getPatientTimeLineList.fulfilled, (state, action) => {
        state.loadingPatientTimelineList = false
        state.patientTimelineList = Array.isArray(action.payload)
          ? action.payload
          : action.payload
            ? [action.payload]
            : []
      })
      .addCase(getPatientTimeLineList.rejected, (state) => {
        state.loadingPatientTimelineList = false
      })
  },
})

export const {
  setCaseInformation,
  setSelectedFilter,
  setSelectedOverviewStep,
  setDataLeadsOverview,
  setIsAssignPracticeDrawerOpen,
  setSkipAssessmentTab,
  setActiveKey,
  setSelectedTabMenu,
} = LeadsProfile.actions

export default LeadsProfile.reducer
