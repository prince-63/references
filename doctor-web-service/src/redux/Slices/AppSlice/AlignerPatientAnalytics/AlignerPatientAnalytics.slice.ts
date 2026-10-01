import filterAlignerPatientAnalyticsConstants from '@constants/filterAlignerPatientAnalyticsConstants'
import HttpMethod from '@constants/httpMethods.constants'
import {createAsyncThunk, createSlice} from '@reduxjs/toolkit'
import apiHelper from '@utils/apiHelper'
import {
  URL_ALIGNER_PATIENT_ANALYTICS_COUNT,
  URL_ALIGNER_PATIENT_ANALYTICS_LIST,
  URL_PATIENT_LIST_FOR_REMIND_ALL,
} from 'redux/Endpoints/apiEndpoints'
import {
  AllPatients,
  CountsDataResponse,
  RequestList,
  ResponseList,
  ResponseListAll,
} from 'screens/AlignerPatientAnalytics/types/alignerPatientAnalytics.types'
import {optionType} from 'types/optionType'

// Async Thunks
export const getAlignerPatientAnalyticsList = createAsyncThunk(
  'api/getAlignerPatientAnalyticsList',
  async (params: RequestList, {rejectWithValue}) => {
    try {
      const response = await apiHelper(URL_ALIGNER_PATIENT_ANALYTICS_LIST, HttpMethod.POST, {
        ...params,
        page_size: 10,
      })
      return response.data
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.error_code)
    }
  },
  {
    condition: (arg, {getState}) => {
      const state = getState() as any
      if (state.AlignerPatientAnalytics?.loadingList) {
        return false
      }
      const lastFetched = state.AlignerPatientAnalytics?.lastFetchedList
      if (lastFetched && Date.now() - lastFetched < 5000) {
        return false
      }
    },
  }
)

export const getPatientListAll = createAsyncThunk(
  'api/getPatientList',
  async (
    params: {
      doctor_id: number
      filter: keyof typeof filterAlignerPatientAnalyticsConstants | null | 'NEED_ATTENTION'
    },
    {rejectWithValue}
  ) => {
    try {
      const response = await apiHelper(URL_PATIENT_LIST_FOR_REMIND_ALL, HttpMethod.POST, params)
      const data: ResponseListAll[] = response.data
      const list = data.map(({patient_id, patient_full_name}) => ({
        value: patient_id,
        label: patient_full_name,
      }))

      return list
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.error_code)
    }
  },
  {
    condition: (arg, {getState}) => {
      const state = getState() as any
      if (state.AlignerPatientAnalytics?.loadingAllList) {
        return false
      }
    },
  }
)

export const getAlignerAnalyticsCountsData = createAsyncThunk(
  'api/getAlignerAnalyticsCountsData',
  async (params: {doctor_id: number}, {rejectWithValue}) => {
    try {
      const response = await apiHelper(URL_ALIGNER_PATIENT_ANALYTICS_COUNT, HttpMethod.POST, params)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.error_code)
    }
  }
)

// Initial State
const initialState = {
  loadingCounts: false,
  dataCounts: {
    patient_compliance: {
      needs_attention: 0,
      at_risk: 0,
      on_track: 0,
      on_track_percentage: 0,
    },
    aligner_changes_till_date: {
      on_time: 0,
      delay_less_than7_days: 0,
      delay_more_than7_days: 0,
      on_time_percentage: 0,
    },
    aligner_check_in_till_date: {
      perfect_fit: 0,
      some_issue: 0,
      perfect_fit_percentage: 0,
    },
    issues_reported_till_date: {
      missing_aligner: 0,
      broken_aligner: 0,
      irritation_to_gums: 0,
      sharp_edges: 0,
      total_issue_reported_percentage: 0,
    },
  } as CountsDataResponse,

  loadingList: false,
  lastFetchedList: null as number | null,
  dataList: {} as ResponseList,

  loadingAllList: false,
  dataAllList: [] as optionType[],
  openRemindDrawer: false,
  patientsList: [] as AllPatients[],
  isRemindAll: false,
  selectedFilter: null as keyof typeof filterAlignerPatientAnalyticsConstants | null,
  isAlignerUpdates: false,
}

// Slice
const AlignerPatientAnalyticsSlice = createSlice({
  name: 'AlignerPatientAnalyticsSlice',
  initialState,
  reducers: {
    setIsAlignerUpdates: (state, action) => {
      state.isAlignerUpdates = action.payload
    },
    setSelectedFilter: (state, action) => {
      state.selectedFilter = action.payload
    },
    setRemindAll: (state, action) => {
      state.isRemindAll = action.payload
    },
    setOpenRemindDrawer: (state, action) => {
      state.openRemindDrawer = action.payload
    },
    setPatientsList: (state, action) => {
      state.patientsList = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      // List
      .addCase(getAlignerPatientAnalyticsList.pending, (state) => {
        state.loadingList = true
      })
      .addCase(getAlignerPatientAnalyticsList.fulfilled, (state, action) => {
        state.dataList = action.payload
        state.loadingList = false
        state.lastFetchedList = Date.now()
      })
      .addCase(getAlignerPatientAnalyticsList.rejected, (state) => {
        state.loadingList = false
      })

      // All Patients List
      .addCase(getPatientListAll.pending, (state) => {
        state.loadingAllList = true
      })
      .addCase(getPatientListAll.fulfilled, (state, action) => {
        state.dataAllList = action.payload
        state.loadingAllList = false
      })
      .addCase(getPatientListAll.rejected, (state) => {
        state.loadingAllList = false
      })

      // Counts
      .addCase(getAlignerAnalyticsCountsData.pending, (state) => {
        state.loadingCounts = true
      })
      .addCase(getAlignerAnalyticsCountsData.fulfilled, (state, action) => {
        state.dataCounts = action.payload
        state.loadingCounts = false
      })
      .addCase(getAlignerAnalyticsCountsData.rejected, (state) => {
        state.loadingCounts = false
      })
  },
})

// Exports
export const {
  setRemindAll,
  setOpenRemindDrawer,
  setPatientsList,
  setSelectedFilter,
  setIsAlignerUpdates,
} = AlignerPatientAnalyticsSlice.actions

export default AlignerPatientAnalyticsSlice.reducer
