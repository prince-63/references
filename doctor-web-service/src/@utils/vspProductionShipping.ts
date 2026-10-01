import HttpMethod from '@constants/httpMethods.constants'
import apiHelper from '@utils/apiHelper'
import {URL_VSP_PRODUCTION_SHIPPING} from 'redux/Endpoints/apiEndpoints'

export type VspProductionShippingPayload = {
  production_id: string | number
  tracking_number: string
  tentative_date: string
  tracking_link: string
  shipping_date: string | null
}

export const postVspProductionShipping = async (payload: VspProductionShippingPayload) => {
  return apiHelper(URL_VSP_PRODUCTION_SHIPPING, HttpMethod.POST, payload, true)
}
