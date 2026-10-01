// apiSlice.ts

import {createSlice, createAsyncThunk} from '@reduxjs/toolkit'
import {
  URL_LOGIN,
  URL_LOGIN_PROFILE_BY_EMAIL_AND_PASSWORD,
  URL_LOGIN_PROFILES_BY_EMAIL,
  URL_SSO_LOGIN,
} from '../../Endpoints/apiEndpoints'
import apiHelper from '../../../@utils/apiHelper'
import HttpMethod from '../../../@constants/httpMethods.constants'

interface ApiResponse {
  data: any
}

interface ApiPostData {
  data: any
}

export const postApiDataLogin = createAsyncThunk(
  'api/postDataLogin',
  async (postDataLogin: ApiPostData, {rejectWithValue}) => {
    try {
      // const response = await axios.post<ApiResponse>(URL_LOGIN, postDataLogin.data, config)
      const response = await apiHelper(URL_LOGIN, HttpMethod.POST, postDataLogin.data)
      return response.data
    } catch (error: any) {
      console.error(error.response?.data?.error_code)
      return rejectWithValue(error.response?.data?.error_code)
    }
  }
)

export const getLoginProfilesByEmail = createAsyncThunk(
  'api/getLoginProfilesByEmail',
  async (email: string, {rejectWithValue}) => {
    try {
      const response = await apiHelper(
        `${URL_LOGIN_PROFILES_BY_EMAIL}${encodeURIComponent(email)}`,
        HttpMethod.GET
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.response?.data?.error_code)
    }
  }
)

export const postLoginProfilesByEmailAndPassword = createAsyncThunk(
  'api/postLoginProfilesByEmailAndPassword',
  async (postData: {email: string; password: string}, {rejectWithValue}) => {
    try {
      const response = await apiHelper(
        URL_LOGIN_PROFILE_BY_EMAIL_AND_PASSWORD,
        HttpMethod.POST,
        postData,
        false
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error_code)
    }
  }
)

export const getSsoLoginDetails = createAsyncThunk(
  'api/getSsoLoginDetails',
  async (postDataLogin: {emailId: string; token: string}, {rejectWithValue}) => {
    try {
      const response = await apiHelper(
        `${URL_SSO_LOGIN}/${postDataLogin.emailId}/${postDataLogin.token}`,
        HttpMethod.GET
      )
      return response.data
    } catch (error: any) {
      console.error(error.response?.data?.error_code)
      return rejectWithValue(error.response?.data?.error_code)
    }
  }
)

const loginSlice = createSlice({
  name: 'apiLogin',
  initialState: {
    data: null as ApiResponse | null,
    error: null as string | null,
    loading: false,
    showLockAccountModal: false,
    captchaChecked: true,
    showRecaptcha: false,
    showLoginSessionModal: false,
    loadingLoginState: false,
    loadingLoginProfiles: false,
    loginProfiles: [] as any[],
    errorLoginProfiles: null as string | null,

    loadingSsoLogin: false,
    dataSsoLogin: {},
    errorSsoLogin: null as string | null,
  },
  reducers: {
    setShowLockAccountModal: (state, action) => {
      state.showLockAccountModal = action.payload
    },
    setCaptchaChecked: (state, action) => {
      state.captchaChecked = action.payload
    },
    setShowRecaptcha: (state, action) => {
      state.showRecaptcha = action.payload
    },
    setShowLoginSessionModal: (state, action) => {
      state.showLoginSessionModal = action.payload
    },

    setLoadingLoginStage: (state, action) => {
      state.loadingLoginState = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(postApiDataLogin.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(postApiDataLogin.fulfilled, (state, action) => {
        state.loading = false
        state.data = action.payload
      })
      .addCase(postApiDataLogin.rejected, (state, action) => {
        state.loading = false
        state.error = typeof action.payload === 'string' ? action.payload : 'An error occurred'
      })
      .addCase(getLoginProfilesByEmail.pending, (state) => {
        state.loadingLoginProfiles = true
        state.errorLoginProfiles = null
      })
      .addCase(getLoginProfilesByEmail.fulfilled, (state, action) => {
        state.loadingLoginProfiles = false
        state.loginProfiles = Array.isArray(action.payload) ? action.payload : []
      })
      .addCase(getLoginProfilesByEmail.rejected, (state, action) => {
        state.loadingLoginProfiles = false
        state.errorLoginProfiles =
          typeof action.payload === 'string' ? action.payload : 'An error occurred'
      })
      .addCase(postLoginProfilesByEmailAndPassword.pending, (state) => {
        state.loadingLoginProfiles = true
        state.errorLoginProfiles = null
      })
      .addCase(postLoginProfilesByEmailAndPassword.fulfilled, (state, action) => {
        state.loadingLoginProfiles = false
        state.loginProfiles = Array.isArray(action.payload) ? action.payload : []
      })
      .addCase(postLoginProfilesByEmailAndPassword.rejected, (state, action) => {
        state.loadingLoginProfiles = false
        state.errorLoginProfiles =
          typeof action.payload === 'string' ? action.payload : 'An error occurred'
      })

      .addCase(getSsoLoginDetails.pending, (state) => {
        state.loadingSsoLogin = true
        state.errorSsoLogin = null
      })
      .addCase(getSsoLoginDetails.fulfilled, (state, action) => {
        state.loadingSsoLogin = false
        state.dataSsoLogin = action.payload
      })
      .addCase(getSsoLoginDetails.rejected, (state, action) => {
        state.loadingSsoLogin = false
        state.errorSsoLogin =
          typeof action.payload === 'string' ? action.payload : 'An error occurred'
      })
  },
})

export const {
  setShowLockAccountModal,
  setCaptchaChecked,
  setShowRecaptcha,
  setShowLoginSessionModal,
  setLoadingLoginStage,
} = loginSlice.actions

export default loginSlice.reducer
