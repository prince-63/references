import HttpMethod from '@constants/httpMethods.constants'
import {createAsyncThunk, createSlice} from '@reduxjs/toolkit'
import apiHelper from '@utils/apiHelper'
import {URL_GET_INVITE_DETAILS} from 'redux/Endpoints/apiEndpoints'
import {InviteDetails} from 'screens/auth/inviteDetails.types'
export const getInviteDetails = createAsyncThunk(
  'api/getInviteDetails',
  async (
    params: {
      id: string
    },
    {rejectWithValue}
  ) => {
    try {
      const response = await apiHelper(`${URL_GET_INVITE_DETAILS}/${params.id}`, HttpMethod.GET)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data)
    }
  }
)
const inviteDetailsSlice = createSlice({
  name: 'inviteDetailsSlice',
  initialState: {
    data: {} as InviteDetails,
    loading: false,
    error: null as any,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getInviteDetails.pending, (state) => {
        state.loading = true
      })
      .addCase(getInviteDetails.fulfilled, (state, action) => {
        state.loading = false
        state.data = action.payload
      })
      .addCase(getInviteDetails.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})
export default inviteDetailsSlice.reducer
