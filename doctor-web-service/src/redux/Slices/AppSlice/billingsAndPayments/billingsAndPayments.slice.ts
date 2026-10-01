import HttpMethod from '@constants/httpMethods.constants'
import {createAsyncThunk, createSlice} from '@reduxjs/toolkit'
import apiHelper from '@utils/apiHelper'
import {GET_BILLINGS_AND_PAYMENTS_DATA} from 'redux/Endpoints/apiEndpoints'
import {
  BillingAndPayments,
  FilterDrawerFormikContextType,
} from 'screens/billingsAndPayments/billingsAndPayments.types'

interface GetBillingsAndPaymentsFilteredPayload extends FilterDrawerFormikContextType {
  doctor_id: number
  page_number: number
  updateLoadingState?: boolean
}
type GetBillingsAndPaymentsPayload = GetBillingsAndPaymentsFilteredPayload
export const getBillingsAndPaymentsList = createAsyncThunk(
  'api/getBillingsAndPaymentsList',
  async (params: GetBillingsAndPaymentsPayload, {rejectWithValue}) => {
    try {
      const {updateLoadingState = true, ...rest} = params
      const payloadToSend = rest

      const response = await apiHelper(GET_BILLINGS_AND_PAYMENTS_DATA, HttpMethod.POST, {
        ...payloadToSend,
        page_size: 10,
      })
      const responseToStoreInRedux = {
        ...response.data?.billing_and_payments,
        total_patients: response.data?.pagination?.total_patients,
        total_pages: response.data?.pagination?.total_pages,
        has_next: response.data?.pagination?.has_next,
        has_previous: response.data?.pagination?.has_previous,
      }
      return {data: responseToStoreInRedux, updateLoadingState}
    } catch (error: any) {
      return rejectWithValue(error.response.data)
    }
  }
)

const initialState = {
  loadingBillingAndPaymentsData: false,
  billingAndPaymentsData: {} as BillingAndPayments,
}

const BillingsAndPayments = createSlice({
  name: 'billingsAndPayments',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getBillingsAndPaymentsList.pending, (state, action) => {
      if (action.meta.arg.updateLoadingState !== false) {
        state.loadingBillingAndPaymentsData = true
      }
    })
    builder.addCase(getBillingsAndPaymentsList.fulfilled, (state, action) => {
      if (action.payload.updateLoadingState !== false) {
        state.loadingBillingAndPaymentsData = false
      }
      state.billingAndPaymentsData = action.payload.data
    })
    builder.addCase(getBillingsAndPaymentsList.rejected, (state, action) => {
      if (action.meta.arg.updateLoadingState !== false) {
        state.loadingBillingAndPaymentsData = false
      }
      state.billingAndPaymentsData = {} as BillingAndPayments
    })
  },
})

export default BillingsAndPayments.reducer
