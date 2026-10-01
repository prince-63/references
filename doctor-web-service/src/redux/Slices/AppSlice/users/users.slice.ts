import HttpMethod from '@constants/httpMethods.constants'
import {createAsyncThunk, createSlice} from '@reduxjs/toolkit'
import apiHelper from '@utils/apiHelper'
import {URL_USERS_LIST_MAIN} from 'redux/Endpoints/apiEndpoints'
interface RequestBody {
  doctor_id: number
  page_number: number
  filter_by_role: string | null
}
import {getStorageType} from 'utils/storage'

export const getUsersList = createAsyncThunk(
  'api/getUsersList',
  async (param: RequestBody, {rejectWithValue}) => {
    const organizationId = getStorageType().getItem('organizationId')
      ? Number(getStorageType().getItem('organizationId'))
      : null
    const profileId = getStorageType().getItem('profileId')
      ? Number(getStorageType().getItem('profileId'))
      : null
    const url = param.filter_by_role
      ? `${URL_USERS_LIST_MAIN}${param.doctor_id}&organizationId=${organizationId}&profileId=${profileId}&pageNumber=${param.page_number}&pageSize=10&filterByRole=${param.filter_by_role}`
      : `${URL_USERS_LIST_MAIN}${param.doctor_id}&organizationId=${organizationId}&profileId=${profileId}&pageNumber=${param.page_number}&pageSize=10`

    try {
      const response = await apiHelper(url, HttpMethod.GET)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data)
    }
  }
)

export interface IPayloadOrderList {
  data: []
  error: null
  loading: false
}

export interface RowOrderDetails {
  user_name: string
  user_profile_id: number
  customer_action_pending_count: number
  user_action_pending_count: number
  ongoing_order_count: number
}

export interface PaginationUsers {
  page_number: number
  page_size: number
  total_patients: number
  total_pages: number
  has_next: boolean
  has_previous: boolean
}
const initialState = {
  data: {
    user_orders_count_response: [] as RowOrderDetails[],
    pagination_details: {} as PaginationUsers,
  },
  loading: false,
}
const UsersListSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getUsersList.pending, (state) => {
        state.loading = true
      })
      .addCase(getUsersList.fulfilled, (state, action) => {
        state.loading = false
        state.data = action.payload
      })
      .addCase(getUsersList.rejected, (state) => {
        state.loading = false
      })
  },
})

export default UsersListSlice.reducer
