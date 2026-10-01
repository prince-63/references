// apiSlice.ts

import {createSlice, createAsyncThunk} from '@reduxjs/toolkit'
import {
  URL_ADD_PROFILE,
  URL_AUTH_UPDATE_DETAILS,
  URL_SIGNUP_LOGIN,
  URL_SIGNUP_OR_LOGIN_FOR_CONNECTED_ORG_USER,
} from '../../Endpoints/apiEndpoints'
import apiHelper from '../../../@utils/apiHelper'
import HttpMethod from '../../../@constants/httpMethods.constants'
import getBrandConfig from 'utils/getBrandConfig'
import rolesConstants from '@constants/roles.constants'

interface ApiResponse {
  data: any
}

interface ApiPostData {
  data: any
}

export const postApiDataSignupLogin = createAsyncThunk(
  'api/postDataSignupLogin',
  async (postDataSignupLogin: ApiPostData, {rejectWithValue}) => {
    try {
      const response = await apiHelper(URL_SIGNUP_LOGIN, HttpMethod.POST, {
        ...postDataSignupLogin.data,
        brand: getBrandConfig().brand,
      })
      return response.data
    } catch (error: any) {
      console.error(error?.response)

      return rejectWithValue(error.response?.data)
    }
  }
)

export const authUpdateDetails = createAsyncThunk(
  'api/authUpdateDetails',
  async (
    data: {
      email: string
      mobile_no: string | null
      country_code: string
      first_name: string
      last_name: string
      salutation: string
      org_name: string
      organization_id?: string | number | null
    },
    {rejectWithValue}
  ) => {
    try {
      const response = await apiHelper(URL_AUTH_UPDATE_DETAILS, HttpMethod.POST, data)
      return response.data
    } catch (error: any) {
      console.error(error?.response)

      return rejectWithValue(error.response?.data)
    }
  }
)
export const signUpOrLoginForConnectedOrgUser = createAsyncThunk(
  'api/signupOrLoginForConnectedOrgUser',
  async (data: any, {rejectWithValue}) => {
    try {
      const brand = data?.brand
      const response = await apiHelper(
        URL_SIGNUP_OR_LOGIN_FOR_CONNECTED_ORG_USER,
        HttpMethod.POST,
        {
          ...data,
          brand,
        },
        false
      )
      return response.data
    } catch (error: any) {
      console.error(error?.response)

      return rejectWithValue(error.response?.data)
    }
  }
)

export const postAddProfile = createAsyncThunk(
  'api/postDataAddProfile',
  async (
    postDataAddProfile: {
      roles: (keyof typeof rolesConstants)[]
      doctor_id: number
    },
    {rejectWithValue}
  ) => {
    try {
      const response = await apiHelper(URL_ADD_PROFILE, HttpMethod.POST, {
        ...postDataAddProfile,
        brand: getBrandConfig().brand,
      })
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error_code)
    }
  }
)

const signupLoginSlice = createSlice({
  name: 'apiSignupLogin',
  initialState: {
    data: null as ApiResponse | null,
    error: null as any | null,
    loading: false,
    dataAddProfile: null as ApiResponse | null,
    errorAddProfile: null as any | null,
    loadingAddProfile: false,
    reactNativeSignupResponse: null,
  },
  reducers: {
    setReactNativeSignupResponse: (state, action) => {
      state.reactNativeSignupResponse = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(postApiDataSignupLogin.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(postApiDataSignupLogin.fulfilled, (state, action) => {
        state.loading = false
        state.data = action.payload
      })
      .addCase(postApiDataSignupLogin.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      .addCase(postAddProfile.pending, (state) => {
        state.loadingAddProfile = true
        state.errorAddProfile = null
      })
      .addCase(postAddProfile.fulfilled, (state, action) => {
        state.loadingAddProfile = false
        state.dataAddProfile = action.payload
      })
      .addCase(postAddProfile.rejected, (state, action) => {
        state.loading = false
        state.errorAddProfile = action.payload
      })
  },
})
export const {setReactNativeSignupResponse} = signupLoginSlice.actions

export default signupLoginSlice.reducer
