// apiSlice.ts

import HttpMethod from '@constants/httpMethods.constants'
import {createSlice, createAsyncThunk} from '@reduxjs/toolkit'
import apiHelper from '@utils/apiHelper'
import {URL_GET_LEADS_PROFILE_DETAILS} from 'redux/Endpoints/apiEndpoints'
import PATIENT_TYPE from '@constants/patientType.constants'
export type PatientType = (typeof PATIENT_TYPE)[keyof typeof PATIENT_TYPE]

export interface PatientDetails {
  id: number
  first_name: string
  last_name: string | null
  profile_picture_url: string
  age: string | null
  email: string
  mobile: string | null
  status: string
  doctor_id: number
  last_login_at: string | null
  country_code: string
  practice_location: string
  chief_complaint: string | null
  product_type_names: string[]
  practice_location_id: number | null
  gender: string
  full_name: string | null
  language: string
  org_name: string | null
  country: string | null
  city: string | null
  state: string | null
  uuid: string
  connection_date: string
  next_follow_up: string | null
  is_practice_assigned: boolean
  assigned_practice?: {
    practice_doctor_id: null
    practice_profile_id: null
    practice_organization_id: null
    name: string
    is_customer_patient: boolean
  } | null
  customer_mapped_id: string
  patient_belongs_to:
    | 'OWN_PATIENT'
    | 'NOT_ASSIGNED'
    | 'ORG_PATIENT'
    | 'ASSIGNED_TO_PRACTICE'
    | 'ORTHODONTIC_PATIENT'
  patient_type: PatientType
  treatment_plan_id: number | null
  has_read_existing_patient_form: boolean
  profile_image_id: number | null
  lab_profile_id: number
  lab_org_id: number
  service_config_names: string[]
}

export interface GettingStartedDetails {
  case_info_details_filled: boolean
  pre_treatment_photos_filled: boolean
  patient_details_edited: boolean | null
  mark_all_as_read: boolean
  treatment_enable: boolean
  finalise_tracking_enable: boolean
  patient_data_fill_status: boolean | null
  ask_patient_to_fill: boolean
  treatment_status: string
  product_type: string
  aligner_journey_id: number | null
  tracking_status: string | null
  is_braces_notes_attached: boolean
  treatment_finalized_on: string | null
  scan_files_filled: boolean
  approved_by_patient_at: string
  is_approved_by_patient: boolean
  braces_treatment_plan_creation_date: string | null
  order_id: string | null
  order_status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'COMPLETED' | string
  initiator_order_treatment_plan_status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'COMPLETED' | string
  approver_order_treatment_plan_status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'COMPLETED' | string
  prescription_read: boolean | null
  case_record: boolean | null
  invite_modal: boolean | null
  prescription_count: number
  treatment_plan_id: number | null
  reminder_date: string | null
}

export interface InvitationDetails {
  invitation_id: number
  is_patient_connected: boolean
  is_patient_invited: boolean
}

export interface LeadsPatientData {
  patient_details: PatientDetails
  getting_started_details: GettingStartedDetails
  invitation_details: InvitationDetails
  aligner_treatment_plan_finalized: boolean
  is_customer_scan_file_view_enabled: boolean
  is_customer_tracking_enabled: boolean
  is_customer_print_file_view_enabled: boolean
}

interface ApiPostData {
  doctor_id: number
  patient_id: number
}

export const getLeadsProfileDetails = createAsyncThunk(
  'api/getLeadsProfileDetails',
  async (postDataToGetLeadsProfileDetails: ApiPostData, {rejectWithValue}) => {
    const {patient_id, doctor_id} = postDataToGetLeadsProfileDetails
    try {
      const response = await apiHelper(
        URL_GET_LEADS_PROFILE_DETAILS + `?doctorId=${doctor_id}&patientId=${patient_id}`,
        HttpMethod.GET
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data)
    }
  }
)

const initialState = {
  data: {} as LeadsPatientData,
  error: null as string | null,
  loading: false,
  isModalEditPatientDetailsOpen: false,
}

const LeadsProfileDetailsSlice = createSlice({
  name: 'apiLeadsProfileDetails',
  initialState,
  reducers: {
    setIsModalEditPatientDetailsOpen: (state, action) => {
      state.isModalEditPatientDetailsOpen = action.payload
    },
    resetLeadsProfileDetails: () => {
      return {...initialState}
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getLeadsProfileDetails.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getLeadsProfileDetails.fulfilled, (state, action) => {
        state.loading = false
        state.data = action.payload
      })
      .addCase(getLeadsProfileDetails.rejected, (state, action) => {
        state.loading = false
        state.error = typeof action.payload === 'string' ? action.payload : 'An error occurred'
      })
  },
})

export const {setIsModalEditPatientDetailsOpen, resetLeadsProfileDetails} =
  LeadsProfileDetailsSlice.actions
export default LeadsProfileDetailsSlice.reducer
