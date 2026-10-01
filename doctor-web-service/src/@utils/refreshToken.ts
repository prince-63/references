import {URL_REFRESH_TOKEN} from 'redux/Endpoints/apiEndpoints'
import apiHelper from './apiHelper'
import HttpMethod from '@constants/httpMethods.constants'
import userTypes from '@constants/userTypes'
import {getStorageType} from 'utils/storage'

const normalizeStoredValue = (value: unknown): string | null => {
  if (value === null || value === undefined) return null

  const normalizedValue = String(value).trim()
  if (
    normalizedValue === '' ||
    normalizedValue === 'null' ||
    normalizedValue === 'undefined' ||
    normalizedValue === 'NaN'
  ) {
    return null
  }

  return normalizedValue
}

const getStoredUserDetail = () => {
  try {
    const userDetail = normalizeStoredValue(getStorageType().getItem('userDetail'))
    return userDetail ? JSON.parse(userDetail) : null
  } catch {
    return null
  }
}

const getRefreshTokenPayload = () => {
  const storage = getStorageType()
  const userDetail = getStoredUserDetail()
  const storedProfileId = normalizeStoredValue(storage.getItem('profileId'))
  const activeProfile = Array.isArray(userDetail?.profiles)
    ? userDetail.profiles.find(
        (profile: any) => normalizeStoredValue(profile?.profile_id) === storedProfileId
      )
    : null
  const defaultProfile = userDetail?.default_profile
  const profile = activeProfile ?? defaultProfile
  const email =
    normalizeStoredValue(storage.getItem('email')) ?? normalizeStoredValue(userDetail?.email)
  const doctorId =
    normalizeStoredValue(storage.getItem('userId')) ??
    normalizeStoredValue(profile?.doctor_id) ??
    normalizeStoredValue(userDetail?.doctor_id) ??
    normalizeStoredValue(userDetail?.user_id)
  const organizationId =
    normalizeStoredValue(storage.getItem('organizationId')) ??
    normalizeStoredValue(profile?.organization_id)
  const profileId = storedProfileId ?? normalizeStoredValue(profile?.profile_id)

  return {
    user_type: userTypes.DOCTOR,
    ...(email ? {email} : {}),
    ...(doctorId ? {doctor_id: doctorId} : {}),
    ...(organizationId ? {organization_id: organizationId} : {}),
    ...(profileId ? {profile_id: profileId} : {}),
  }
}

export default async () => {
  try {
    const payload = getRefreshTokenPayload()

    if (!payload.organization_id) {
      return
    }

    const response = await apiHelper(URL_REFRESH_TOKEN, HttpMethod.POST, payload, false)
    const {token} = response.data
    // Store the new access token
    getStorageType().setItem('userToken', token)
    // Store the current time as the last refresh time
    getStorageType().setItem('lastRefreshTime', new Date().toISOString())
  } catch (error) {
    throw error
  }
}
