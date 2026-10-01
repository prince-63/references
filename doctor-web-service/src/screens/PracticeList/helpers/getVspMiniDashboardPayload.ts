import type {
  VspMiniDashboardRequest,
  VspMiniDashboardResponse,
} from 'redux/Slices/AppSlice/Profile/Profile.slice'

type GetVspMiniDashboardPayloadArgs = {
  profileId: number
  customerProfileId: number
  currentData?: VspMiniDashboardResponse | null
  patientPageNo?: number
  patientPageSize?: number
  orderPageNo?: number
  orderPageSize?: number
}

export const getVspMiniDashboardPayload = ({
  profileId,
  customerProfileId,
  currentData,
  patientPageNo,
  patientPageSize,
  orderPageNo,
  orderPageSize,
}: GetVspMiniDashboardPayloadArgs): VspMiniDashboardRequest => ({
  profile_id: profileId,
  customer_profile_id: customerProfileId,
  order_sort_by: 'ORDER_ID',
  patient_sort_by: 'PATIENT_NAME',
  order_by: 'ASC',
  pagination: {
    order_pagination: {
      page_size:
        orderPageSize ?? currentData?.vsp_order_details?.pagination_details?.page_size ?? 10,
      page_no: orderPageNo ?? currentData?.vsp_order_details?.pagination_details?.page_number ?? 0,
    },
    patient_pagination: {
      page_size:
        patientPageSize ?? currentData?.vsp_patient_details?.pagination_details?.page_size ?? 10,
      page_no:
        patientPageNo ?? currentData?.vsp_patient_details?.pagination_details?.page_number ?? 0,
    },
  },
})

export default getVspMiniDashboardPayload
