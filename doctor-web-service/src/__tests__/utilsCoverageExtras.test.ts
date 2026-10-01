import axios from 'axios'
import brandNamesConstants from '@constants/brandNames.constants'
import HttpMethod from '@constants/httpMethods.constants'
import {getPlanStatus} from '@utils/getPlanStatus'
import {getPortalUrlByOrganization, navigateToPortal} from '@utils/getPortalUrlByOrganization'
import getPatientProfileTrackingUrl from '@utils/getPatientProfileTrackingUrl'
import * as MessageConstant from 'utils/MessageConstant'
import {supabase} from 'services/supabase'
import ErrorToast from 'components/modal/Alert/ErrorToast'
import useAllUserPlan from '@hooks/useAllUserPlan'

jest.mock('axios', () => {
  const mockAxios = jest.fn()
  ;(mockAxios as any).isCancel = jest.fn(() => false)
  return mockAxios
})
jest.mock('services/supabase', () => ({supabase: {auth: {signOut: jest.fn()}}}))
jest.mock('components/modal/Alert/ErrorToast', () => ({__esModule: true, default: jest.fn()}))
jest.mock('@hooks/useAllUserPlan', () => jest.fn())

let mockedAxios: jest.MockedFunction<typeof axios> & {isCancel: jest.Mock}
const mockedSignOut = supabase.auth.signOut as jest.Mock
const mockedErrorToast = ErrorToast as jest.Mock
const mockedUseAllUserPlan = useAllUserPlan as jest.Mock
const originalEnv = {...process.env}
let apiHelper: typeof import('@utils/apiHelper').default

const setupStorage = () => {
  window.localStorage.setItem('userId', '5')
  window.localStorage.setItem('userToken', 'token123')
  window.localStorage.setItem('organizationId', '9')
  window.localStorage.setItem('profileId', '7')
}

describe('apiHelper', () => {
  beforeEach(() => {
    process.env = {
      ...originalEnv,
      REACT_APP_BRAND_NAME: brandNamesConstants.DENTALSTACK,
      REACT_APP_ORG_NAME_DENTALSTACK: 'DENTAL_ORG',
      REACT_APP_ORG_TOKEN_DENTALSTACK: 'DENTAL_TOKEN',
    }
    mockedSignOut.mockReset()
    mockedErrorToast.mockReset()
    mockedSignOut.mockResolvedValue(undefined)
    const store: Record<string, string> = {}
    const storage = {
      getItem: jest.fn((key: string) => (key in store ? store[key] : null)),
      setItem: jest.fn((key: string, value: string) => {
        store[key] = value
      }),
      clear: jest.fn(() => {
        Object.keys(store).forEach((key) => delete store[key])
      }),
      removeItem: jest.fn((key: string) => {
        delete store[key]
      }),
    }
    Object.defineProperty(window, 'localStorage', {value: storage, writable: true})
    setupStorage()
    jest.isolateModules(() => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      mockedAxios = require('axios') as jest.MockedFunction<typeof axios> & {isCancel: jest.Mock}
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      apiHelper = require('@utils/apiHelper').default
    })
    mockedAxios.mockClear()
    if (mockedAxios.isCancel) {
      mockedAxios.isCancel.mockReturnValue(false)
    }
    // JSDOM location is readonly by default; replace to assert redirects
    delete (window as any).location
    ;(window as any).location = {href: '', pathname: '/dashboard'}
  })

  it('injects ids and authorization headers for json payloads', async () => {
    mockedAxios.mockResolvedValue({data: {ok: true}} as any)

    const result = await apiHelper('/api/test', HttpMethod.POST, {foo: 'bar'})

    expect(mockedAxios).toHaveBeenCalledWith(
      expect.objectContaining({
        method: HttpMethod.POST,
        url: '/api/test',
        data: {foo: 'bar', organization_id: 9, profile_id: 7, doctor_id: 5},
        headers: expect.objectContaining({
          Authorization: 'Bearer token123',
          'User-Id': 5,
          'X-Organization-Name': 'DENTAL_ORG',
          'X-Organization-Token': 'DENTAL_TOKEN',
        }),
      })
    )
    expect(result).toEqual({data: {ok: true}})
  })

  it('respects addProfileAndOrgId=false and merges overrides', async () => {
    mockedAxios.mockResolvedValue({status: 204} as any)

    await apiHelper('/override', HttpMethod.POST, {organization_id: 99}, false, {timeout: 10})

    expect(mockedAxios).toHaveBeenCalledWith(
      expect.objectContaining({
        url: '/override',
        data: {organization_id: 99},
        timeout: 10,
      })
    )
  })

  it('keeps FormData payloads untouched', async () => {
    const formData = new FormData()
    formData.append('file', new Blob(['abc']), 'a.txt')
    mockedAxios.mockResolvedValue({status: 200} as any)

    await apiHelper('/upload', HttpMethod.PUT, formData)

    expect((mockedAxios.mock.calls[0][0] as any).data).toBe(formData)
  })

  it('returns early on cancelled requests', async () => {
    const cancelError = new Error('cancel') as any
    cancelError.__CANCEL__ = true
    mockedAxios.isCancel.mockReturnValue(true)
    mockedAxios.mockRejectedValue(cancelError)

    const result = await apiHelper('/cancel', HttpMethod.GET)

    expect(result).toBeUndefined()
    expect(mockedSignOut).not.toHaveBeenCalled()
  })

  it('clears storage and redirects on auth errors', async () => {
    const error: any = new Error('unauthorized')
    error.response = {status: 401}
    const clearSpy = jest.spyOn(window.localStorage, 'clear')
    mockedAxios.mockRejectedValue(error)

    await expect(apiHelper('/auth', HttpMethod.GET)).rejects.toThrow('unauthorized')

    expect(clearSpy).toHaveBeenCalled()
    expect(mockedSignOut).toHaveBeenCalled()
    expect((window as any).location.href).toBe('/login')
  })

  it('shows toast and redirects to root on server errors', async () => {
    const error: any = new Error('server')
    error.response = {status: 500}
    mockedAxios.mockRejectedValue(error)

    await expect(apiHelper('/server', HttpMethod.GET)).rejects.toThrow('server')

    expect(mockedErrorToast).toHaveBeenCalled()
    expect((window as any).location.href).toBe('/')
  })

  it('shows toast without redirecting when server error redirect is skipped', async () => {
    const error: any = new Error('server')
    error.response = {status: 500}
    mockedAxios.mockRejectedValue(error)

    await expect(
      apiHelper('/upload', HttpMethod.POST, new FormData(), true, {
        skipServerErrorRedirect: true,
      })
    ).rejects.toThrow('server')

    expect(mockedErrorToast).toHaveBeenCalled()
    expect((window as any).location.href).toBe('')
  })
})

describe('MessageConstant', () => {
  it('exports key validation messages', () => {
    expect(MessageConstant.ERROR_FIRST_NAME).toBe('First name is required')
    expect(MessageConstant.ERROR_PASSWORD_FORMAT).toContain('Password must be at least 8')
    expect(MessageConstant.ALERT_TEXT_OTP_VERIFIED).toBe('OTP Verified Successfully')
    expect(MessageConstant.fieldErrorMessages.TEXT_USER_ID).toBe('User Id is required')
  })
})

describe('getPlanStatus', () => {
  beforeEach(() => {
    mockedUseAllUserPlan.mockReturnValue({
      isOrganization: false,
      isPractice: false,
      isCustomer: false,
    })
  })

  it('returns DRAFT for new or draft flags', () => {
    mockedUseAllUserPlan.mockReturnValue({
      isOrganization: false,
      isPractice: false,
      isCustomer: false,
    })
    expect(
      getPlanStatus({
        treatmentPlan: {
          status: 'ACTIVE',
          approver_status: 'APPROVED',
          initiator_status: 'IN_PROGRESS',
        },
        isNew: true,
      })
    ).toBe('DRAFT')
  })

  it('uses approver status for organizations when received plan is draft', () => {
    mockedUseAllUserPlan.mockReturnValue({
      isOrganization: true,
      isPractice: false,
      isCustomer: false,
    })
    const value = getPlanStatus({
      treatmentPlan: {
        status: 'DRAFT',
        approver_status: 'IN_PROGRESS',
        initiator_status: 'COMPLETE',
      },
      isReceivedPlan: true,
    })
    expect(value).toBe('DRAFT')
  })

  it('uses initiator status for doctors when draft', () => {
    mockedUseAllUserPlan.mockReturnValue({
      isOrganization: false,
      isPractice: false,
      isCustomer: false,
    })
    const value = getPlanStatus({
      treatmentPlan: {status: 'DRAFT', approver_status: 'APPROVED', initiator_status: 'COMPLETE'},
    })
    expect(value).toBe('COMPLETE')
  })

  it('uses approver status for practice or customer users', () => {
    mockedUseAllUserPlan.mockReturnValue({
      isOrganization: false,
      isPractice: true,
      isCustomer: false,
    })
    const value = getPlanStatus({
      treatmentPlan: {
        status: 'DRAFT',
        approver_status: 'APPROVED',
        initiator_status: 'IN_PROGRESS',
      },
    })
    expect(value).toBe('APPROVED')
  })
})

describe('getPortalUrlByOrganization', () => {
  beforeEach(() => {
    process.env = {...originalEnv}
  })

  it('returns production urls when no stage is set', () => {
    process.env.REACT_APP_BASE_ENVIRONMENT = ''
    expect(getPortalUrlByOrganization(brandNamesConstants.SMILEZY)).toBe('https://web.smilezy.com')
    expect(getPortalUrlByOrganization(' Dental Stack ')).toBe('https://web.dental-stack.com')
  })

  it('returns stage urls when stage is provided', () => {
    process.env.REACT_APP_BASE_ENVIRONMENT = 'stage.'
    expect(getPortalUrlByOrganization(brandNamesConstants.CRAFTALIGN)).toBe(
      'https://craftalign.stage.dental-stack.com'
    )
  })

  it('navigateToPortal delegates to getPortalUrlByOrganization', () => {
    process.env.REACT_APP_BASE_ENVIRONMENT = ''
    expect(navigateToPortal(brandNamesConstants.ROUTETOSMILE)).toBe('https://web.routetosmile.com')
  })
})

describe('getPatientProfileTrackingUrl', () => {
  it('builds base path without params when not provided', () => {
    expect(getPatientProfileTrackingUrl(10, false)).toBe('/profile/10/aligner-tracking')
  })

  it('appends query params while skipping nullish values', () => {
    const url = getPatientProfileTrackingUrl('abc', true, {
      foo: 'bar',
      skip: undefined,
      flag: false,
    })
    expect(url).toBe('/profile/abc/aligner-tracking?foo=bar&flag=false')
  })
})
