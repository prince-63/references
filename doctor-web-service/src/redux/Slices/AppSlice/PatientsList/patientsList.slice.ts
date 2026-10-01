import filterPatientList from '@constants/filterPatientList'
import HttpMethod from '@constants/httpMethods.constants'
import rolesConstants from '@constants/roles.constants'
import {createAsyncThunk, createSlice} from '@reduxjs/toolkit'
import apiHelper from '@utils/apiHelper'
import {
  URL_PATIENTS_COUNT_LIST,
  URL_PATIENTS_LIST,
  URL_PATIENTS_LIST_FOR_ORG,
  URL_CUSTOMER_PATIENTS_LIST,
} from 'redux/Endpoints/apiEndpoints'
import {GlobalStatusType} from 'screens/Patients/PatientList/components/CountBox'
import {
  countData,
  pagination_details,
  PatientRowDetails,
} from 'screens/Patients/PatientList/types/patientsList.types'
import {optionType} from 'types/optionType'
import {getStorageType} from 'utils/storage'

interface ResponsePatientList {
  patients: PatientRowDetails[]
  patient_details: PatientRowDetails[]
  active_patient_details: PatientRowDetails[]
  pagination_details: pagination_details
  list_count: {
    all_count: number
    lead_count: number
    active_count: number
  }
  practice_list_count: {
    all_count: number
    lead_count: number
    active_count: number
  }
  customer_list_count: {
    all_count: number
    lead_count: number
    active_count: number
  }
  patient_count_response: {
    all_patients: number
    in_assessment: number
    in_planning: number
    in_manufacturing: number
    transit: number
    starting_soon: number
    ongoing: number
    completed: number
    paused: number
    refinement: number
    practice_patient_count: number
    customer_patient_count: number
  }
}

export interface RequestPatientList {
  page_number: number
  doctor_id: number
  search: string | null
  practice_location: string[]
  archive?: boolean
  filter_by_app_invite_status: keyof typeof filterPatientList | 'ALL'
  filter_by_global_status: GlobalStatusType | null
  filter_by_practice_name: '' | string | 'SHOW_UNASSIGNED'
  filter_by_treatment_type: '' | string | 'SHOW_ALIGNERS'
  filter_by_role: string | null
}

export interface RequestPatientListForOrg {
  page_number: number
  doctor_id: number
  search: string | null
  filter_by_app_invite_status: keyof typeof filterPatientList | 'ALL'
  filter_by_global_status: GlobalStatusType | null
  patient_type: PatientType
  practice_profile_ids: string[]
  practice_location_ids: number[] | null
  practice_filter: PracticeFilters
  treatment_type_filter: TreatmentType
  doctor_role: keyof typeof rolesConstants | null
  customer_or_practice_role: 'CONSULTING_ORTHODONTIST' | 'CUSTOMER' | string | null
}

export interface RequestPatientListCount {
  doctor_id: number
  role: 'CONSULTING_ORTHODONTIST' | null
}

export interface RequestCustomerPatientsList {
  profile_id: number
  customer_id: number
  search: string | null
  page_number: number
  page_size: number
}

export interface GetPatientsListParams {
  payload: RequestPatientList
  signal?: AbortSignal
}

export interface GetPatientsListParamsForOrg {
  payload: RequestPatientListForOrg
  signal?: AbortSignal
}

export const getPatientsListForOrg = createAsyncThunk(
  'api/getPatientsListForOrg',
  async ({payload, signal}: GetPatientsListParamsForOrg, {rejectWithValue}) => {
    try {
      const postData = {
        ...payload,
        page_size: 10,
        is_patient_count_request: false,
      }
      const response = await apiHelper(
        URL_PATIENTS_LIST_FOR_ORG,
        HttpMethod.POST,
        postData,
        true,
        undefined,
        undefined,
        signal
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response.data)
    }
  }
)

export const getPatientsList = createAsyncThunk(
  'api/getPatientsList',
  async ({payload, signal}: GetPatientsListParams, {rejectWithValue}) => {
    try {
      const postData = {
        ...payload,
        page_size: 10,
        treatments: [],
      }
      const response = await apiHelper(
        URL_PATIENTS_LIST,
        HttpMethod.POST,
        {
          ...postData,
          ...(payload.filter_by_practice_name === null && {
            filter_by_practice_name: '',
          }),
          ...(payload.filter_by_treatment_type === null && {
            filter_by_treatment_type: '',
          }),
        },
        true,
        undefined,
        undefined,
        signal
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response.data)
    }
  }
)

export const getCustomerPatientsList = createAsyncThunk(
  'api/getCustomerPatientsList',
  async (payload: RequestCustomerPatientsList, {rejectWithValue}) => {
    try {
      const response = await apiHelper(URL_CUSTOMER_PATIENTS_LIST, HttpMethod.POST, payload)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response.data)
    }
  }
)

export const getPatientsCountList = createAsyncThunk(
  'api/getPatientsCountList',
  async (payload: RequestPatientListCount, {rejectWithValue}) => {
    const organizationId = getStorageType().getItem('organizationId')
      ? Number(getStorageType().getItem('organizationId'))
      : null
    const profileId = getStorageType().getItem('profileId')
      ? Number(getStorageType().getItem('profileId'))
      : null
    try {
      const response = await apiHelper(
        URL_PATIENTS_COUNT_LIST +
          `${payload.doctor_id}/${organizationId}/${profileId}/${payload.role}`,
        HttpMethod.GET,
        payload
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response.data)
    }
  }
)

export const getArchivePatientsList = createAsyncThunk(
  'api/getArchivePatientsList',
  async (payload: RequestPatientList, {rejectWithValue}) => {
    try {
      const response = await apiHelper(URL_PATIENTS_LIST, HttpMethod.POST, {
        ...payload,
        page_size: 10,
        treatments: [],
      })
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response.data)
    }
  }
)

export type PracticeFilters = 'ALL' | 'ASSIGNED' | 'UNASSIGNED' | 'BY_PROFILE_ID'
export type PatientType = 'NEW_PATIENT' | 'EXISTING_PATIENT' | 'ALL'
export type TreatmentType = 'ALL' | 'ALIGNER'

const patientsListSlice = createSlice({
  name: 'patientsLists',
  initialState: {
    practiceLocation: '',
    customerOrPractice: '',
    brandName: '',
    practiceLocationForOrg: null,
    customerOrPracticeForOrg: null,
    globalFilter: 'ALL' as GlobalStatusType,
    statusFilter: 'ALL' as keyof typeof filterPatientList | 'ALL',
    patient_type: 'ALL' as PatientType,
    practice_filter: 'ALL' as PracticeFilters,
    treatment_type_filter: 'ALIGNER' as TreatmentType,
    loadingPatients: false,
    loadingPatientsCount: false,
    dataPatientListCount: {
      all_patient: 0,
      in_planning: 0,
      in_assessment: 0,
      tracking_pending: 0,
      starting_soon: 0,
      ongoing: 0,
      completed: 0,
      paused: 0,
      in_refinement: 0,
    } as countData,

    //demo

    dataPatientsList: {
      patients: [] as PatientRowDetails[],
      patient_details: [] as PatientRowDetails[],
      pagination_details: {
        has_next: false,
        has_previous: false,
        page_number: 1,
        page_size: 10,
        total_patients: 0,
        total_pages: 0,
      } as pagination_details,
      list_count: {
        active_count: 0,
        all_count: 0,
        lead_count: 0,
      },
      practice_list_count: {
        all_count: 0,
        lead_count: 0,
        active_count: 0,
      },
      customer_list_count: {
        all_count: 0,
        lead_count: 0,
        active_count: 0,
      },
      patient_count_response: {
        all_patients: 0,
        in_assessment: 0,
        in_planning: 0,
        in_manufacturing: 0,
        transit: 0,
        starting_soon: 0,
        ongoing: 0,
        completed: 0,
        paused: 0,
        refinement: 0,
        practice_patient_count: 0,
        customer_patient_count: 0,
      },
    } as ResponsePatientList,

    filterCount: 0,
    selectedBrandName: {} as optionType,
    selectedPracticeLocation: {} as optionType,
    selectedCustomers: {} as optionType,
    selectedPractice: {} as optionType,
  },
  reducers: {
    setPracticeLocation(state, action) {
      state.practiceLocation = action.payload
    },
    setCustomerOrPractice(state, action) {
      state.customerOrPractice = action.payload
    },
    setBrandName(state, action) {
      state.brandName = action.payload
    },

    setPracticeLocationForOrg(state, action) {
      state.practiceLocationForOrg = action.payload
    },
    setCustomerOrPracticeForOrg(state, action) {
      state.customerOrPracticeForOrg = action.payload
    },

    setGlobalFilter(state, action) {
      state.globalFilter = action.payload
    },
    setStatusFilter(state, action) {
      state.statusFilter = action.payload
    },
    setSelectedCustomers(state, action) {
      state.selectedCustomers = action.payload
    },
    setSelectedPractice(state, action) {
      state.selectedPractice = action.payload
    },
    setSelectedPracticeLocation(state, action) {
      state.selectedPracticeLocation = action.payload
    },
    setSelectedBrandName(state, action) {
      state.selectedBrandName = action.payload
    },

    setPatientType(state, action) {
      state.patient_type = action.payload
    },
    setPracticeFilter(state, action) {
      state.practice_filter = action.payload
    },
    setTreatmentTypeFilter(state, action) {
      state.treatment_type_filter = action.payload
    },

    setAllResetFilter(state, action) {
      state.globalFilter = action.payload
      state.statusFilter = action.payload
      state.practice_filter = action.payload
      state.treatment_type_filter = action.payload
      state.practiceLocationForOrg = null
      state.customerOrPracticeForOrg = null

      state.customerOrPractice = ''
      state.practiceLocation = ''
      state.brandName = ''
      state.patient_type = action.payload
      state.selectedCustomers = {} as optionType
      state.selectedPractice = {} as optionType
      state.selectedPracticeLocation = {} as optionType
      state.selectedBrandName = {} as optionType
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getPatientsList.pending, (state) => {
      state.loadingPatients = true
    })
    builder.addCase(getPatientsList.fulfilled, (state, action) => {
      state.loadingPatients = false
      state.dataPatientsList = action.payload
    })
    builder.addCase(getPatientsList.rejected, (state) => {
      state.loadingPatients = false
    })

    builder.addCase(getPatientsListForOrg.pending, (state) => {
      state.loadingPatients = true
    })
    builder.addCase(getPatientsListForOrg.fulfilled, (state, action) => {
      state.loadingPatients = false
      state.dataPatientsList = action.payload
    })
    builder.addCase(getPatientsListForOrg.rejected, (state) => {
      state.loadingPatients = false
    })

    builder.addCase(getCustomerPatientsList.pending, (state) => {
      state.loadingPatients = true
    })
    builder.addCase(getCustomerPatientsList.fulfilled, (state, action) => {
      state.loadingPatients = false
      state.dataPatientsList = action.payload
    })
    builder.addCase(getCustomerPatientsList.rejected, (state) => {
      state.loadingPatients = false
    })

    builder.addCase(getArchivePatientsList.pending, (state) => {
      state.loadingPatients = true
    })
    builder.addCase(getArchivePatientsList.fulfilled, (state, action) => {
      state.loadingPatients = false
      state.dataPatientsList = action.payload
    })
    builder.addCase(getArchivePatientsList.rejected, (state) => {
      state.loadingPatients = false
    })

    builder.addCase(getPatientsCountList.pending, (state) => {
      state.loadingPatientsCount = true
    })
    builder.addCase(getPatientsCountList.fulfilled, (state, action) => {
      state.loadingPatientsCount = false
      state.dataPatientListCount = action.payload
    })
  },
})

export const {
  setPracticeLocationForOrg,
  setCustomerOrPracticeForOrg,
  setPracticeLocation,
  setCustomerOrPractice,
  setBrandName,
  setAllResetFilter,
  setGlobalFilter,
  setStatusFilter,
  setSelectedCustomers,
  setSelectedPractice,
  setSelectedPracticeLocation,
  setSelectedBrandName,
  setPatientType,
  setPracticeFilter,
  setTreatmentTypeFilter,
} = patientsListSlice.actions
export default patientsListSlice.reducer
