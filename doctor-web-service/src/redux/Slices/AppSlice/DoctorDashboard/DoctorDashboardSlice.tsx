import HttpMethod from '@constants/httpMethods.constants'
import trackingTypes from '@constants/trackingTypes'
import {createAsyncThunk, createSlice} from '@reduxjs/toolkit'
import apiHelper from '@utils/apiHelper'
import {
  URL_DASHBOARD_COUNTS_LIST,
  URL_DASHBOARD_DATA,
  URL_DASHBOARD_DISMISS_EVENT,
  URL_DASHBOARD_NEW_DATA,
  URL_DASHBOARD_ORDER_COUNTS_LIST,
  URL_DASHBOARD_PENDING_PATIENTS,
  URL_DASHBOARD_THINGS_TO_DO_PATIENTS,
  URL_DASHBOARD_UPCOMING_ALIGNER,
  URL_PRACTICE_DASHBOARD_DATA,
} from 'redux/Endpoints/apiEndpoints'
import {IVendorDashboardCounts} from './vendorDashboardCounts.types'
import {IDashboardDetails, IDashboardNewDetails} from './dashboardCounts.types'
import {IEnterpriseLabStaffCountsData} from 'screens/Dashboard/enterpriseLabStaffDashboard/types/practicesDashboard.types'
import {getStorageType} from 'utils/storage'

export interface PatientCount {
  total_patient: number
  lead: number
  clear_aligner: number
  braces: number
}

export interface TreatmentCount {
  active: number
  paused: number
  deactivated: number
  completed: number
}

export interface ITreatmentCounts {
  all_treatments: {
    total: number
    starting_soon: number
    ongoing: number
    paused: number
    refinement: number
  }
  aligner_treatments: {
    total: number
    starting_soon: number
    ongoing: number
    paused: number
    refinement: number
  }
  braces_treatments: {
    total: number
    starting_soon: number
    ongoing: number
    paused: number
    refinement: number
  }
  patient_count: {
    total: number
    active: number
    lead: number
  }
  lead_count: {
    total: number
    in_assessment: number
    in_planning: number
    tracking_pending: number
  }
  unread_chat_count: number
  unread_notification_count: number
}

export interface PendingPatient {
  patient_id: number
  patient_name: string
  patient_profile: string | null
  email: string | null
}

export interface PendingPatientResponse {
  action_counts: PendingPatientCountList
  categorized_patients: PendingPatientDataList
}
export interface x {
  prof_plan: {
    home: any
    workspace: any
    lab: any
    customer: any
  }
}
export interface PendingPatientCountList {
  ADD_TREATMENT: number
  SET_UP_TREATMENT_PLAN: number
  ADD_TRACKING: number
  CONNECT_WITH_PATIENT: number
}
export interface PendingPatientDataList {
  ADD_TREATMENT: ThingsToPatient[]
  SET_UP_TREATMENT_PLAN: ThingsToPatient[]
  ADD_TRACKING: ThingsToPatient[]
  CONNECT_WITH_PATIENT: ThingsToPatient[]
}

export interface ThingsToPatient {
  performed_at: string // ISO 8601 date string
  patient_name: string
  patient_profile: string
  category: string
  patient_id: number
  action_type: string
  action_id: number
  active: boolean
  aligner_journey_id: number
}

export interface ThingsToDoCountsList {
  ALL: number
  CHECK_IN: number
  ALIGNER_CHANGE: number
  FORCE_ALIGNER_CHANGE: number
  ISSUE_REPORT: number
  MOVE_TO_PREVIOUS_ALIGNER: number
}
export interface ThingsToDoDataList {
  ALL: ThingsToPatient[]
  CHECK_IN: ThingsToPatient[]
  ALIGNER_CHANGE: ThingsToPatient[]
  FORCE_ALIGNER_CHANGE: ThingsToPatient[]
  ISSUE_REPORT: ThingsToPatient[]
  MOVE_TO_PREVIOUS_ALIGNER: ThingsToPatient[]
}

export interface ThingsToPatientResponse {
  action_counts: ThingsToDoCountsList
  categorized_actions: ThingsToDoDataList
}

export interface OrderCounts {
  total: number
  ordered: number
  inreview: number
  onhold: number
  replan: number
  approved: number
  completed: number
  cancelled: number
  draft: number
}

export interface IPatientData {
  aligner_journey_id: number
  patient_id: number
  current_aligner_no: number
  current_aligner_jaw_type: string
  current_aligner_compliance: string
  next_aligner_no: number
  next_aligner_jaw_type: string
  change_date: string // ISO 8601 date string
  recommended_hours_to_wear_aligners: number
  mobile_no: string
  patient_name: string
  patient_profile: string | null
  country_code: string
  category: string
  change_offset: number
  aligner_change_status: string
  current_aligner_avg_wear_time_in_secs: string
  patient_connected?: boolean
  tracking_type?: keyof typeof trackingTypes
}
export interface IListType {
  upcoming_aligner_changes: IPatientData[]
}

// Dashboard Counts
export const getDashboardCounts = createAsyncThunk(
  'api/getDashboardCounts',
  async (
    apiDashboardCountsPayload: {
      doctor_id: number
    },
    {rejectWithValue}
  ) => {
    const organizationId = getStorageType().getItem('organizationId')
      ? Number(getStorageType().getItem('organizationId'))
      : null
    const profileId = getStorageType().getItem('profileId')
      ? Number(getStorageType().getItem('profileId'))
      : null
    try {
      const response = await apiHelper(
        URL_DASHBOARD_COUNTS_LIST +
          apiDashboardCountsPayload.doctor_id +
          '/' +
          organizationId +
          '/' +
          profileId,
        HttpMethod.GET
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response.data)
    }
  }
)

// Dashboard Pending Patients List
export const postPendingPatientList = createAsyncThunk(
  'api/postDataPendingPatientList',
  async (
    postDataPendingPatientList: {
      doctor_id: number
    },
    {rejectWithValue}
  ) => {
    try {
      const response = await apiHelper(
        URL_DASHBOARD_PENDING_PATIENTS,
        HttpMethod.POST,
        postDataPendingPatientList
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data)
    }
  }
)
export const getVendorDashboardCounts = createAsyncThunk(
  'api/getVendorDashboardCounts',
  async (
    data: {
      doctor_id: number
    },
    {rejectWithValue}
  ) => {
    try {
      const organizationId = getStorageType().getItem('organizationId')
        ? Number(getStorageType().getItem('organizationId'))
        : null

      const profileId = getStorageType().getItem('profileId')
        ? Number(getStorageType().getItem('profileId'))
        : null
      const response = await apiHelper(
        URL_DASHBOARD_ORDER_COUNTS_LIST +
          data.doctor_id +
          '&organizationId=' +
          organizationId +
          '&profileId=' +
          profileId,
        HttpMethod.GET
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data)
    }
  }
)

// Dashboard Things to do Patients List
export const postThingsToDoPatientList = createAsyncThunk(
  'api/postDataThingsToDoPatientList',
  async (
    postDataThingsToDoPatientList: {
      doctor_id: number
      is_active: boolean
    },
    {rejectWithValue}
  ) => {
    try {
      const organizationId = getStorageType().getItem('organizationId')
        ? Number(getStorageType().getItem('organizationId'))
        : null
      const response = await apiHelper(
        URL_DASHBOARD_THINGS_TO_DO_PATIENTS +
          `?is_active=${postDataThingsToDoPatientList.is_active}&doctor_id=${postDataThingsToDoPatientList.doctor_id}&organization_id=${organizationId}`,
        HttpMethod.POST,
        postDataThingsToDoPatientList
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data)
    }
  }
)

// Dashboard Pending Patients List
export const postDismissEvent = createAsyncThunk(
  'api/postDataDismissEvent',
  async (
    postDataDismissEvent: {
      actions_ids: number[]
    },
    {rejectWithValue}
  ) => {
    try {
      const response = await apiHelper(
        URL_DASHBOARD_DISMISS_EVENT,
        HttpMethod.POST,
        postDataDismissEvent
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data)
    }
  }
)

// Upcoming aligner change
export const postUpcomingAlignersChangePatientList = createAsyncThunk(
  'api/postDataUpcomingAlignersChangePatientList',
  async (
    postDataUpcomingAlignersChangePatientList: {
      doctor_id: number
    },
    {rejectWithValue}
  ) => {
    const organizationId = getStorageType().getItem('organizationId')
      ? Number(getStorageType().getItem('organizationId'))
      : null
    try {
      const response = await apiHelper(
        URL_DASHBOARD_UPCOMING_ALIGNER +
          postDataUpcomingAlignersChangePatientList.doctor_id +
          '/' +
          organizationId,
        HttpMethod.GET,
        postDataUpcomingAlignersChangePatientList
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data)
    }
  }
)

export const enterpriseLabStaffCounts = createAsyncThunk(
  'api/enterpriseLabStaffCounts',
  async (
    param: {
      doctor_id: number
      role: null | 'LAB_STAFF'
    },
    {rejectWithValue}
  ) => {
    try {
      const response = await apiHelper(URL_PRACTICE_DASHBOARD_DATA, HttpMethod.POST, param)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data)
    }
  }
)

export const getDashboardNewDetails = createAsyncThunk(
  'api/getDashboardNewDetails',
  async (
    data: {
      doctor_id: number
      roles: string[]
      plan_name: string
    },
    {rejectWithValue}
  ) => {
    try {
      const response = await apiHelper(URL_DASHBOARD_NEW_DATA, HttpMethod.POST, data)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data)
    }
  }
)

export const getStarterPlanUserDashboardDetails = createAsyncThunk(
  'api/getStarterPlanUserDashboardDetails',
  async (
    data: {
      doctor_id: number
      roles: string[]
      plan_name: string
    },
    {rejectWithValue}
  ) => {
    try {
      const response = await apiHelper(URL_DASHBOARD_DATA, HttpMethod.POST, data)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data)
    }
  }
)
const DoctorDashboardSlice = createSlice({
  name: 'DashboardCounts',
  initialState: {
    loadingCounts: false,
    countsData: {
      all_treatments: {
        total: 0,
        starting_soon: 0,
        ongoing: 0,
        paused: 0,
        refinement: 0,
      },
      aligner_treatments: {
        total: 0,
        starting_soon: 0,
        ongoing: 0,
        paused: 0,
        refinement: 0,
      },
      braces_treatments: {
        total: 0,
        starting_soon: 0,
        ongoing: 0,
        paused: 0,
        refinement: 0,
      },
      patient_count: {
        total: 0,
        active: 0,
        lead: 0,
      },
      lead_count: {
        total: 0,
        in_assessment: 0,
        in_planning: 0,
        tracking_pending: 0,
      },
      unread_chat_count: 0,
      unread_notification_count: 0,
    } as ITreatmentCounts,
    loadingPendingPatients: false,
    errorFetchPendingPatients: null as string | null,
    dataPendingPatients: {
      action_counts: {
        ADD_TRACKING: 0,
        ADD_TREATMENT: 0,
        CONNECT_WITH_PATIENT: 0,
        SET_UP_TREATMENT_PLAN: 0,
      } as PendingPatientCountList,
      categorized_patients: {
        ADD_TRACKING: [],
        ADD_TREATMENT: [],
        CONNECT_WITH_PATIENT: [],
        SET_UP_TREATMENT_PLAN: [],
      },
    } as PendingPatientResponse,

    loadingThingsToDoPatients: false,
    errorFetchThingsToDPatients: null as string | null,
    dataThingsToDPatients: {
      action_counts: {
        ALL: 0,
        CHECK_IN: 0,
        ALIGNER_CHANGE: 0,
        FORCE_ALIGNER_CHANGE: 0,
        ISSUE_REPORT: 0,
        MOVE_TO_PREVIOUS_ALIGNER: 0,
      },
      categorized_actions: {
        ALIGNER_CHANGE: [],
        ALL: [],
        CHECK_IN: [],
        FORCE_ALIGNER_CHANGE: [],
        ISSUE_REPORT: [],
        MOVE_TO_PREVIOUS_ALIGNER: [],
      },
    } as ThingsToPatientResponse,

    loadingDismissEvent: false,
    errorFetchDismissEvent: null as string | null,
    dataDismissEvent: [] as ThingsToPatient[],

    loadingUpcomingAlignerChange: false,
    errorFetchUpcomingAlignerChange: null as string | null,
    dataUpcomingAlignerChange: {upcoming_aligner_changes: [] as IPatientData[]} as IListType,
    loadingVendorDashboardCounts: false,
    vendorDashboardCounts: {} as IVendorDashboardCounts,

    dashboard: {} as IDashboardDetails,
    newDashboard: {} as IDashboardNewDetails,
    loadingDashboard: false,
    loadingNewDashboard: false,
    enterpriseLabStaffCountsData: {} as IEnterpriseLabStaffCountsData,

    loadingEnterpriseLabStaffCounts: false,
  },
  reducers: {
    updateLabChatUnreadCount(state, action) {
      const incrementBy = action.payload || 0
      if (!incrementBy) return

      if (state.newDashboard?.vsp_customer?.counts?.total_unread_chat_count !== undefined) {
        state.newDashboard.vsp_customer.counts.total_unread_chat_count = Math.max(
          0,
          Number(state.newDashboard.vsp_customer.counts.total_unread_chat_count) + incrementBy
        )
      }
      if (state.newDashboard?.vsp_customer?.total_unread_chat_count !== undefined) {
        state.newDashboard.vsp_customer.total_unread_chat_count = Math.max(
          0,
          Number(state.newDashboard.vsp_customer.total_unread_chat_count) + incrementBy
        )
      }
      if (
        state.newDashboard?.practice_connected_to_org?.counts?.total_unread_chat_count !== undefined
      ) {
        state.newDashboard.practice_connected_to_org.counts.total_unread_chat_count = Math.max(
          0,
          Number(state.newDashboard.practice_connected_to_org.counts.total_unread_chat_count) +
            incrementBy
        )
      }
      if (state.newDashboard?.practice_connected_to_org?.total_unread_chat_count !== undefined) {
        state.newDashboard.practice_connected_to_org.total_unread_chat_count = Math.max(
          0,
          Number(state.newDashboard.practice_connected_to_org.total_unread_chat_count) + incrementBy
        )
      }
      if (state.newDashboard?.enterprise_plan?.total_unread_chat_count !== undefined) {
        state.newDashboard.enterprise_plan.total_unread_chat_count = Math.max(
          0,
          Number(state.newDashboard.enterprise_plan.total_unread_chat_count) + incrementBy
        )
      }
      if (state.newDashboard?.enterprise_planning_user?.total_unread_chat_count !== undefined) {
        state.newDashboard.enterprise_planning_user.total_unread_chat_count = Math.max(
          0,
          Number(state.newDashboard.enterprise_planning_user.total_unread_chat_count) + incrementBy
        )
      }
      if (state.newDashboard?.internal_user_plan?.total_unread_chat_count !== undefined) {
        state.newDashboard.internal_user_plan.total_unread_chat_count = Math.max(
          0,
          Number(state.newDashboard.internal_user_plan.total_unread_chat_count) + incrementBy
        )
      }
      if (
        state.newDashboard?.enterprise_manufacturing_user?.total_unread_chat_count !== undefined
      ) {
        state.newDashboard.enterprise_manufacturing_user.total_unread_chat_count = Math.max(
          0,
          Number(state.newDashboard.enterprise_manufacturing_user.total_unread_chat_count) +
            incrementBy
        )
      }
      if (state.newDashboard?.planning_practice?.counts?.total_unread_chat_count !== undefined) {
        state.newDashboard.planning_practice.counts.total_unread_chat_count = Math.max(
          0,
          Number(state.newDashboard.planning_practice.counts.total_unread_chat_count) + incrementBy
        )
      }
      if (state.newDashboard?.total_unread_chat_count !== undefined) {
        state.newDashboard.total_unread_chat_count = Math.max(
          0,
          Number(state.newDashboard.total_unread_chat_count) + incrementBy
        )
      }
      if (state.newDashboard?.unread_chat_count !== undefined) {
        state.newDashboard.unread_chat_count = Math.max(
          0,
          Number(state.newDashboard.unread_chat_count) + incrementBy
        )
      }
      if (state.newDashboard?.chat_unread_count !== undefined) {
        state.newDashboard.chat_unread_count = Math.max(
          0,
          Number(state.newDashboard.chat_unread_count) + incrementBy
        )
      }
    },
    // setIsModalSuccessAddTreatmentOpen(state, action) {
    //   state.isModalSuccessAddTreatmentOpen = action.payload
    // },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getDashboardCounts.pending, (state) => {
        state.loadingCounts = true
      })
      .addCase(getDashboardCounts.fulfilled, (state, action) => {
        state.loadingCounts = false
        state.countsData = action.payload
      })
      .addCase(getDashboardCounts.rejected, (state) => {
        state.loadingCounts = false
      })

      .addCase(postPendingPatientList.pending, (state) => {
        state.loadingPendingPatients = true
        state.errorFetchPendingPatients = null
      })
      .addCase(postPendingPatientList.fulfilled, (state, action) => {
        state.loadingPendingPatients = false
        state.dataPendingPatients = action.payload
      })
      .addCase(postPendingPatientList.rejected, (state, action) => {
        state.loadingPendingPatients = false
        state.errorFetchPendingPatients =
          typeof action.payload === 'string' ? action.payload : 'An error occurred'
      })

      .addCase(postThingsToDoPatientList.pending, (state) => {
        state.loadingThingsToDoPatients = true
        state.errorFetchThingsToDPatients = null
      })
      .addCase(postThingsToDoPatientList.fulfilled, (state, action) => {
        state.loadingThingsToDoPatients = false
        state.dataThingsToDPatients = action.payload
      })
      .addCase(postThingsToDoPatientList.rejected, (state, action) => {
        state.loadingThingsToDoPatients = false
        state.errorFetchThingsToDPatients =
          typeof action.payload === 'string' ? action.payload : 'An error occurred'
      })

      .addCase(postDismissEvent.pending, (state) => {
        state.loadingDismissEvent = true
        state.errorFetchDismissEvent = null
      })
      .addCase(postDismissEvent.fulfilled, (state, action) => {
        state.loadingDismissEvent = false
        state.dataDismissEvent = action.payload
      })
      .addCase(postDismissEvent.rejected, (state, action) => {
        state.loadingDismissEvent = false
        state.errorFetchDismissEvent =
          typeof action.payload === 'string' ? action.payload : 'An error occurred'
      })

      .addCase(postUpcomingAlignersChangePatientList.pending, (state) => {
        state.loadingUpcomingAlignerChange = true
        state.errorFetchUpcomingAlignerChange = null
      })
      .addCase(postUpcomingAlignersChangePatientList.fulfilled, (state, action) => {
        state.loadingUpcomingAlignerChange = false
        state.dataUpcomingAlignerChange = action.payload
      })
      .addCase(postUpcomingAlignersChangePatientList.rejected, (state, action) => {
        state.loadingUpcomingAlignerChange = false
        state.errorFetchUpcomingAlignerChange =
          typeof action.payload === 'string' ? action.payload : 'An error occurred'
      })
      .addCase(getVendorDashboardCounts.pending, (state) => {
        state.loadingVendorDashboardCounts = true
      })
      .addCase(getVendorDashboardCounts.fulfilled, (state, action) => {
        state.loadingVendorDashboardCounts = false
        state.vendorDashboardCounts = action.payload
      })
      .addCase(getStarterPlanUserDashboardDetails.pending, (state) => {
        state.loadingDashboard = true
      })
      .addCase(getStarterPlanUserDashboardDetails.fulfilled, (state, action) => {
        state.loadingDashboard = false
        state.dashboard = action.payload?.dashboard_details ?? {}
      })
      .addCase(getStarterPlanUserDashboardDetails.rejected, (state) => {
        state.loadingDashboard = false
      })

      .addCase(getDashboardNewDetails.pending, (state) => {
        state.loadingNewDashboard = true
      })
      .addCase(getDashboardNewDetails.fulfilled, (state, action) => {
        state.loadingNewDashboard = false
        state.newDashboard = action.payload?.dashboard_details ?? {}
      })
      .addCase(getDashboardNewDetails.rejected, (state) => {
        state.loadingNewDashboard = false
      })
      .addCase(enterpriseLabStaffCounts.pending, (state) => {
        state.loadingEnterpriseLabStaffCounts = true
      })
      .addCase(enterpriseLabStaffCounts.fulfilled, (state, action) => {
        state.loadingEnterpriseLabStaffCounts = false
        state.enterpriseLabStaffCountsData = action.payload
      })
      .addCase(enterpriseLabStaffCounts.rejected, (state) => {
        state.loadingEnterpriseLabStaffCounts = false
      })
  },
})
export const {updateLabChatUnreadCount} = DoctorDashboardSlice.actions
// export const {setIsModalSuccessAddTreatmentOpen, setSelectedTreatment} =
//   DoctorDashboardSlice.actions

export default DoctorDashboardSlice.reducer
