import HttpMethod from '@constants/httpMethods.constants'
import userTypes from '@constants/userTypes'
import apiHelper from './apiHelper'
import refreshToken from './refreshToken'
import {URL_REFRESH_TOKEN} from 'redux/Endpoints/apiEndpoints'

jest.mock('./apiHelper', () => ({__esModule: true, default: jest.fn()}))
jest.mock('redux/Endpoints/apiEndpoints', () => ({
  URL_REFRESH_TOKEN: 'https://auth.test/auth/token/v1/token/refresh',
}))

const mockedApiHelper = apiHelper as jest.Mock

describe('refreshToken', () => {
  beforeEach(() => {
    window.localStorage.clear()
    mockedApiHelper.mockReset()
    mockedApiHelper.mockResolvedValue({data: {token: 'new-token'}})
  })

  it('passes organization context from storage', async () => {
    window.localStorage.setItem('email', 'doctor@example.com')
    window.localStorage.setItem('userId', '2550')
    window.localStorage.setItem('organizationId', '57')
    window.localStorage.setItem('profileId', '2725')

    await refreshToken()

    expect(mockedApiHelper).toHaveBeenCalledWith(
      URL_REFRESH_TOKEN,
      HttpMethod.POST,
      {
        user_type: userTypes.DOCTOR,
        email: 'doctor@example.com',
        doctor_id: '2550',
        organization_id: '57',
        profile_id: '2725',
      },
      false
    )
    expect(window.localStorage.getItem('userToken')).toBe('new-token')
  })

  it('falls back to userDetail when direct storage keys are missing', async () => {
    window.localStorage.setItem(
      'userDetail',
      JSON.stringify({
        email: 'detail@example.com',
        user_id: 2550,
        default_profile: {
          profile_id: 2725,
          organization_id: 57,
        },
      })
    )

    await refreshToken()

    expect(mockedApiHelper).toHaveBeenCalledWith(
      URL_REFRESH_TOKEN,
      HttpMethod.POST,
      {
        user_type: userTypes.DOCTOR,
        email: 'detail@example.com',
        doctor_id: '2550',
        organization_id: '57',
        profile_id: '2725',
      },
      false
    )
  })

  it('does not call refresh API without organization_id', async () => {
    window.localStorage.setItem('email', 'doctor@example.com')

    await refreshToken()

    expect(mockedApiHelper).not.toHaveBeenCalled()
  })
})
