import axios, {AxiosRequestConfig} from 'axios'
import HttpMethod from '../@constants/httpMethods.constants'
import HttpStatusCode from '@constants/httpStatusCodes.constants'
import {supabase} from 'services/supabase'
import {getStorageType} from 'utils/storage'
import brandNamesConstants from '@constants/brandNames.constants'
import ErrorToast from 'components/modal/Alert/ErrorToast'
import {
  BASE_APP_PATIENT_URL,
  URL_DASHBOARD_DATA,
  URL_DASHBOARD_NEW_DATA,
  URL_UPLOAD_FILES,
} from '../redux/Endpoints/apiEndpoints'

const brand = process.env.REACT_APP_BRAND_NAME || brandNamesConstants.DENTALSTACK
const synapse_org_name = process.env.REACT_APP_ORG_NAME_SYNAPSE
const routetosmile_org_name = process.env.REACT_APP_ORG_NAME_ROUTETOSMILE
const craftalign_org_name = process.env.REACT_APP_ORG_NAME_CRAFTALIGN
const dental_stack_org_name = process.env.REACT_APP_ORG_NAME_DENTALSTACK
const smilezy_org_name = process.env.REACT_APP_ORG_NAME_SMILEZY
const clearCastle_org_name = process.env.REACT_APP_ORG_NAME_CLEARCASTLE
const smilexcel_org_name = process.env.REACT_APP_ORG_NAME_SMILEXCEL
const aiiq_org_name = process.env.REACT_APP_ORG_NAME_AIIQ

const synapse_token = process.env.REACT_APP_ORG_TOKEN_SYNAPSE
const routetosmile_token = process.env.REACT_APP_ORG_TOKEN_ROUTETOSMILE
const craftalign_token = process.env.REACT_APP_ORG_TOKEN_CRAFTALIGN
const dental_stack_token = process.env.REACT_APP_ORG_TOKEN_DENTALSTACK
const smilezy_token = process.env.REACT_APP_ORG_TOKEN_SMILEZY
const clearCastle_token = process.env.REACT_APP_ORG_TOKEN_CLEARCASTLE
const smilexcel_token = process.env.REACT_APP_ORG_TOKEN_SMILEXCEL
const aiiq_token = process.env.REACT_APP_ORG_TOKEN_AIIQ

enum UserType {
  DOCTOR = 'DOCTOR',
  PATIENT = 'PATIENT',
}

type ServiceVersionInfo = {
  id: number
  version: string
  service_name: string
}

type ServiceVersionSnapshot = Record<string, string>
type ApiHelperConfig = AxiosRequestConfig & {
  skipServerErrorRedirect?: boolean
}

const VERSION_KEY = 'service_versions'
const RELOAD_FLAG = 'reload_done'
const URL_SERVICE_VERSIONS = `${BASE_APP_PATIENT_URL}/patient/services/info`

const shouldCheckDashboardVersion = (url: string): boolean => {
  return url.startsWith(URL_DASHBOARD_DATA) || url.startsWith(URL_DASHBOARD_NEW_DATA)
}

const isFileUploadUrl = (url: string): boolean => {
  return url.split('?')[0] === URL_UPLOAD_FILES
}

const mapVersions = (data: ServiceVersionInfo[]): ServiceVersionSnapshot => {
  return data.reduce<ServiceVersionSnapshot>((acc, item) => {
    acc[item.service_name] = item.version
    return acc
  }, {})
}

const normalizeSnapshot = (snapshot: ServiceVersionSnapshot): string => {
  const sortedKeys = Object.keys(snapshot).sort()
  return JSON.stringify(
    sortedKeys.reduce<ServiceVersionSnapshot>((acc, key) => {
      acc[key] = snapshot[key]
      return acc
    }, {})
  )
}

const checkAndReloadOnServiceVersionChange = async (headers: Record<string, any>) => {
  try {
    const response = await axios.get<ServiceVersionInfo[]>(URL_SERVICE_VERSIONS, {
      headers,
      withCredentials: true,
      params: {t: Date.now()},
    })

    const newVersions = mapVersions(response.data ?? [])
    const serializedNewVersions = normalizeSnapshot(newVersions)
    const storedVersions = window.sessionStorage.getItem(VERSION_KEY)

    if (!storedVersions) {
      window.sessionStorage.setItem(VERSION_KEY, serializedNewVersions)
      window.sessionStorage.removeItem(RELOAD_FLAG)
      return
    }

    let oldSerializedVersions = ''
    try {
      oldSerializedVersions = normalizeSnapshot(JSON.parse(storedVersions))
    } catch {
      oldSerializedVersions = ''
    }

    if (oldSerializedVersions !== serializedNewVersions) {
      if (!window.sessionStorage.getItem(RELOAD_FLAG)) {
        window.sessionStorage.setItem(RELOAD_FLAG, 'true')
        window.sessionStorage.setItem(VERSION_KEY, serializedNewVersions)
        window.location.reload()
      }
      return
    }

    window.sessionStorage.removeItem(RELOAD_FLAG)
  } catch (error) {
    console.error('Service version check failed', error)
  }
}

export const getOrgName = (): string => {
  switch (brand) {
    case brandNamesConstants.DENTALSTACK:
      return dental_stack_org_name ?? ''

    case brandNamesConstants.AIIQALIGNER:
      return aiiq_org_name ?? ''

    case brandNamesConstants.CRAFTALIGN:
      return craftalign_org_name ?? ''

    case brandNamesConstants.ROUTETOSMILE:
      return routetosmile_org_name ?? ''

    case brandNamesConstants.SMILEZY:
      return smilezy_org_name ?? ''

    case brandNamesConstants.SYNAPSE:
      return synapse_org_name ?? ''

    case brandNamesConstants.CLEARCASTLE:
      return clearCastle_org_name ?? ''

    case brandNamesConstants.SMILEXCEL:
      return smilexcel_org_name ?? ''

    case brandNamesConstants.AIIQALIGNER:
      return aiiq_org_name ?? ''

    default:
      return dental_stack_org_name ?? ''
  }
}

export const getToken = (): string => {
  switch (brand) {
    case brandNamesConstants.DENTALSTACK:
      return dental_stack_token ?? ''

    case brandNamesConstants.AIIQALIGNER:
      return aiiq_token ?? ''

    case brandNamesConstants.CRAFTALIGN:
      return craftalign_token ?? ''

    case brandNamesConstants.ROUTETOSMILE:
      return routetosmile_token ?? ''

    case brandNamesConstants.SMILEZY:
      return smilezy_token ?? ''

    case brandNamesConstants.SYNAPSE:
      return synapse_token ?? ''

    case brandNamesConstants.CLEARCASTLE:
      return clearCastle_token ?? ''

    case brandNamesConstants.SMILEXCEL:
      return smilexcel_token ?? ''

    case brandNamesConstants.AIIQALIGNER:
      return aiiq_token ?? ''

    default:
      return dental_stack_token ?? ''
  }
}
export default async (
  url: string,
  method: HttpMethod,
  payload?: any,
  addProfileAndOrgId: boolean = true,
  configOverrides?: ApiHelperConfig,
  responseType?: any,
  signal?: AbortSignal
): Promise<any> => {
  const userId = getStorageType().getItem('userId')
    ? Number(getStorageType().getItem('userId'))
    : null
  const token = getStorageType().getItem('userToken')
  const organizationId = getStorageType().getItem('organizationId')
    ? Number(getStorageType().getItem('organizationId'))
    : null
  const profileId = getStorageType().getItem('profileId')
    ? Number(getStorageType().getItem('profileId'))
    : null
  const isFormData = payload instanceof FormData

  if (!isFormData && payload && addProfileAndOrgId) {
    if (payload.organization_id === undefined || payload.organization_id === null) {
      payload.organization_id = organizationId
    }
    if (payload.profile_id === undefined || payload.profile_id === null) {
      payload.profile_id = profileId
    }
    if (payload.doctor_id === undefined || payload.doctor_id === null) {
      payload.doctor_id = userId
    }
  }
  const headers = {
    Authorization: getStorageType().getItem('userToken') ? `Bearer ${token}` : null,
    'User-Id': userId,
    'User-Type': UserType.DOCTOR,
    organization_id: organizationId,
    profile_id: profileId,
    'X-Organization-Name': getOrgName(),
    'X-Organization-Token': getToken(),
  }

  const {skipServerErrorRedirect = false, ...axiosConfigOverrides} = configOverrides ?? {}

  const config: AxiosRequestConfig = {
    method,
    url,
    headers,
    // Required for cross-origin sticky-session cookies (SockJS reports cookie_needed=true).
    withCredentials: true,
    responseType,
    signal,
    ...(method === HttpMethod.POST ||
    method === HttpMethod.PUT ||
    method === HttpMethod.DELETE ||
    method === HttpMethod.PATCH
      ? {data: isFormData ? payload : {...payload}}
      : {}),
    ...axiosConfigOverrides,
  }

  try {
    if (shouldCheckDashboardVersion(url)) {
      await checkAndReloadOnServiceVersionChange(headers)
    }

    const response = await axios(config)
    return response
  } catch (error: any) {
    if (axios.isCancel(error)) {
      return
    }

    if (
      error.response?.status === HttpStatusCode.UNAUTHORIZED ||
      error.response?.status === HttpStatusCode.FORBIDDEN
    ) {
      getStorageType().clear()
      await supabase.auth.signOut()
      window.location.href = '/login'
    }

    if (error.response?.status === HttpStatusCode.INTERNAL_SERVER_ERROR) {
      if (isFileUploadUrl(url)) {
        ErrorToast('File upload failed. Please try again.')
        throw error
      }

      ErrorToast('Server error, looks like we are facing some issues from our side')

      if (!skipServerErrorRedirect && window.location.pathname !== '/') {
        window.location.href = '/'
      }
    }
    throw error
  }
}
