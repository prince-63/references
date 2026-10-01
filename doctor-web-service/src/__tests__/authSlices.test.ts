import HttpMethod from '@constants/httpMethods.constants'
import apiHelper from '@utils/apiHelper'
import getBrandConfig from 'utils/getBrandConfig'
import reducerEmailOtp, {
  clearDataEmailOtpSentSlice,
  postApiDataEmailOTPSlice,
  sendOtpForExistingUsers,
} from '../redux/Slices/AuthSlice/emailOtpSentSlice'
import reducerSignup, {
  authUpdateDetails,
  postAddProfile,
  postApiDataSignupLogin,
  setReactNativeSignupResponse,
  signUpOrLoginForConnectedOrgUser,
} from '../redux/Slices/AuthSlice/signupLoginSlice'
import reducerLogin, {
  getSsoLoginDetails,
  postApiDataLogin,
  setCaptchaChecked,
  setLoadingLoginStage,
  setShowLockAccountModal,
  setShowLoginSessionModal,
  setShowRecaptcha,
} from '../redux/Slices/AuthSlice/loginSlice'
import {
  URL_ADD_PROFILE,
  URL_AUTH_UPDATE_DETAILS,
  URL_EMAIL_OTP_SEND,
  URL_EMAIL_OTP_SEND_FOR_EXISTING_USERS,
  URL_LOGIN,
  URL_SIGNUP_LOGIN,
  URL_SIGNUP_OR_LOGIN_FOR_CONNECTED_ORG_USER,
  URL_SSO_LOGIN,
} from '../redux/Endpoints/apiEndpoints'

jest.mock('@utils/apiHelper', () => jest.fn())
jest.mock('utils/getBrandConfig', () => jest.fn(() => ({brand: 'brandX'})))

const mockedApiHelper = apiHelper as jest.MockedFunction<typeof apiHelper>
const mockedGetBrandConfig = getBrandConfig as jest.Mock
const baseThunkArgs = {dispatch: jest.fn(), getState: jest.fn(), extra: undefined as undefined}

beforeEach(() => {
  mockedApiHelper.mockReset()
  mockedGetBrandConfig.mockReturnValue({brand: 'brandX'})
  baseThunkArgs.dispatch.mockReset()
  baseThunkArgs.getState.mockReset()
})

describe('emailOtpSentSlice', () => {
  it('handles reducer state transitions', () => {
    const pending = reducerEmailOtp(
      undefined,
      postApiDataEmailOTPSlice.pending('req', {data: {}} as any)
    )
    expect(pending.loading).toBe(true)

    const fulfilled = reducerEmailOtp(
      pending,
      postApiDataEmailOTPSlice.fulfilled({ok: true} as any, 'req', {data: {}} as any)
    )
    expect(fulfilled.loading).toBe(false)
    expect(fulfilled.data).toEqual({ok: true})

    const rejected = reducerEmailOtp(
      pending,
      postApiDataEmailOTPSlice.rejected('err' as any, 'req', {data: {}} as any, 'FAILED')
    )
    expect(rejected.error).toBe('FAILED')

    const cleared = reducerEmailOtp(fulfilled, clearDataEmailOtpSentSlice())
    expect(cleared).toMatchObject({data: null, error: null, loading: false})
  })

  it('sends OTP thunks with brand in payload', async () => {
    mockedApiHelper.mockResolvedValueOnce({data: {otp: true}})
    const result = await postApiDataEmailOTPSlice({data: {email: 'user@example.com'}})(
      baseThunkArgs.dispatch,
      baseThunkArgs.getState,
      baseThunkArgs.extra
    )
    expect(mockedApiHelper).toHaveBeenCalledWith(URL_EMAIL_OTP_SEND, HttpMethod.POST, {
      email: 'user@example.com',
      org_name: 'brandX',
    })
    expect(result.payload).toEqual({otp: true})

    mockedApiHelper.mockResolvedValueOnce({data: {existing: true}})
    const existing = await sendOtpForExistingUsers({data: {email: 'e'}})(
      baseThunkArgs.dispatch,
      baseThunkArgs.getState,
      baseThunkArgs.extra
    )
    expect(mockedApiHelper).toHaveBeenCalledWith(
      URL_EMAIL_OTP_SEND_FOR_EXISTING_USERS,
      HttpMethod.POST,
      {email: 'e'}
    )
    expect(existing.payload).toEqual({existing: true})
  })
})

describe('signupLoginSlice', () => {
  it('updates react native signup response', () => {
    const state = reducerSignup(undefined, setReactNativeSignupResponse({token: 'abc'}))
    expect(state.reactNativeSignupResponse).toEqual({token: 'abc'})
  })

  it('handles signup/login and profile thunks', async () => {
    mockedApiHelper.mockResolvedValueOnce({data: {login: true}})
    const loginResult = await postApiDataSignupLogin({data: {email: 'x'}})(
      baseThunkArgs.dispatch,
      baseThunkArgs.getState,
      baseThunkArgs.extra
    )
    expect(mockedApiHelper).toHaveBeenCalledWith(URL_SIGNUP_LOGIN, HttpMethod.POST, {
      email: 'x',
      brand: 'brandX',
    })
    expect(loginResult.payload).toEqual({login: true})

    mockedApiHelper.mockResolvedValueOnce({data: {updated: true}})
    const updateResult = await authUpdateDetails({
      email: 'e',
      mobile_no: null,
      country_code: '+91',
      first_name: 'A',
      last_name: 'B',
      salutation: 'Dr',
      org_name: 'Org',
    })(baseThunkArgs.dispatch, baseThunkArgs.getState, baseThunkArgs.extra)
    expect(mockedApiHelper).toHaveBeenCalledWith(URL_AUTH_UPDATE_DETAILS, HttpMethod.POST, {
      email: 'e',
      mobile_no: null,
      country_code: '+91',
      first_name: 'A',
      last_name: 'B',
      salutation: 'Dr',
      org_name: 'Org',
    })
    expect(updateResult.payload).toEqual({updated: true})

    mockedApiHelper.mockResolvedValueOnce({data: {connected: true}})
    const connected = await signUpOrLoginForConnectedOrgUser({id: 1})(
      baseThunkArgs.dispatch,
      baseThunkArgs.getState,
      baseThunkArgs.extra
    )
    expect(mockedApiHelper).toHaveBeenCalledWith(
      URL_SIGNUP_OR_LOGIN_FOR_CONNECTED_ORG_USER,
      HttpMethod.POST,
      {id: 1, brand: 'brandX'},
      false
    )
    expect(connected.payload).toEqual({connected: true})

    mockedApiHelper.mockResolvedValueOnce({data: {profile: true}})
    const profile = await postAddProfile({doctor_id: 1, roles: ['ADMIN'] as any})(
      baseThunkArgs.dispatch,
      baseThunkArgs.getState,
      baseThunkArgs.extra
    )
    expect(mockedApiHelper).toHaveBeenCalledWith(URL_ADD_PROFILE, HttpMethod.POST, {
      doctor_id: 1,
      roles: ['ADMIN'],
      brand: 'brandX',
    })
    expect(profile.payload).toEqual({profile: true})
  })
})

describe('loginSlice', () => {
  it('toggles UI flags via reducers', () => {
    const afterLockModal = reducerLogin(undefined, setShowLockAccountModal(true))
    expect(afterLockModal.showLockAccountModal).toBe(true)

    const afterCaptcha = reducerLogin(afterLockModal, setCaptchaChecked(false))
    expect(afterCaptcha.captchaChecked).toBe(false)

    const afterRecaptcha = reducerLogin(afterCaptcha, setShowRecaptcha(true))
    expect(afterRecaptcha.showRecaptcha).toBe(true)

    const afterSessionModal = reducerLogin(afterRecaptcha, setShowLoginSessionModal(true))
    expect(afterSessionModal.showLoginSessionModal).toBe(true)

    const afterLoadingStage = reducerLogin(afterSessionModal, setLoadingLoginStage(true))
    expect(afterLoadingStage.loadingLoginState).toBe(true)
  })

  it('processes login and sso thunks', async () => {
    mockedApiHelper.mockResolvedValueOnce({data: {token: 't'}})
    const login = await postApiDataLogin({data: {email: 'x'}})(
      baseThunkArgs.dispatch,
      baseThunkArgs.getState,
      baseThunkArgs.extra
    )
    expect(mockedApiHelper).toHaveBeenCalledWith(URL_LOGIN, HttpMethod.POST, {email: 'x'})
    expect(login.payload).toEqual({token: 't'})

    mockedApiHelper.mockResolvedValueOnce({data: {sso: true}})
    const sso = await getSsoLoginDetails({emailId: 'e', token: 'tok'})(
      baseThunkArgs.dispatch,
      baseThunkArgs.getState,
      baseThunkArgs.extra
    )
    expect(mockedApiHelper).toHaveBeenCalledWith(`${URL_SSO_LOGIN}/e/tok`, HttpMethod.GET)
    expect(sso.payload).toEqual({sso: true})
  })
})
