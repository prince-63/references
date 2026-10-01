import HttpMethod from '@constants/httpMethods.constants'
import apiHelper from '@utils/apiHelper'
import {URL_VSP_PATIENT_DETAILS, URL_VSP_PRODUCTION_STATUS} from 'redux/Endpoints/apiEndpoints'
import {safeParseInt} from 'utils/ConstFunctions'

type GetVspProductionIdParams = {
  orderId?: string | number | null
  patientId?: string | number | null
  doctorId?: string | number | null
}

export const getVspProductionId = async ({
  orderId,
  patientId,
  doctorId,
}: GetVspProductionIdParams) => {
  if (!patientId || !doctorId) return null

  const patientResponse = await apiHelper(URL_VSP_PATIENT_DETAILS, HttpMethod.POST, {
    patient_id: safeParseInt(patientId),
    doctor_id: safeParseInt(doctorId),
    ...(orderId ? {order_id: String(orderId)} : {}),
  })

  const data = patientResponse?.data

  return (
    data?.production_id ??
    data?.production?.production_id ??
    data?.production_details?.production_id ??
    data?.latest_production?.production_id ??
    null
  )
}

export const updateVspProductionStatus = async (
  productionId: string | number,
  status: 'PACKAGED' | 'SHIPPED' | 'DELIVERED'
) => {
  return apiHelper(
    URL_VSP_PRODUCTION_STATUS,
    HttpMethod.PATCH,
    {production_id: productionId, status},
    true
  )
}
