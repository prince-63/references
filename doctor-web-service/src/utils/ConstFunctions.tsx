import moment from 'moment'
import ErrorToast from '../components/modal/Alert/ErrorToast'
import {IMAGE_DEFAULT_PATIENT} from './ImageConst'
import compilanceType from '../@constants/compilanceType'
import eventTypeOptions from '../@staticData/eventTypeOptions'
import eventType from '../@constants/eventType'
import {TEXT_CHAT_PHOTO_VALIDATION} from './MessageConstant'
import hasValue from './hasValue'
import alignerStatusOptions from '../@staticData/alignerStatusOptions'
import {ClientJS} from 'clientjs'
export interface AlignerData {
  sr_no: number
  jaw_type: string
}
export interface ApiGetData {
  data: object // Define your POST request data type here
}

export function findObjectByPropertyValue(array: any, property: string, value: string) {
  // Loop through the array
  for (let i = 0; i < array.length; i++) {
    // Check if the current object's property value matches the input value
    if (array[i][property] === value) {
      // Return the matching object
      return array[i]
    }
  }
}

export function safeParseInt(value: any) {
  const intValue = parseInt(value, 10)
  return isNaN(intValue) ? 0 : intValue
}

// Empty Object Check
export function isObjectEmpty(obj: any) {
  return Object.keys(obj).length === 0
}

export function getValueOrEmptyString(value: any) {
  return value === null ||
    value === undefined ||
    value === 'null' ||
    value === '' ||
    value === 'NaN'
    ? '-'
    : value
}

export const secToHour = (seconds: any) => {
  const convertedToHours = parseInt(seconds) / 3600
  const flooredHourValue = Math.floor(convertedToHours)
  return flooredHourValue
}

// initCapitalFunction
export function capitalizeFirstLetter(inputString: string, showHyphen: boolean = true) {
  if (inputString !== null && inputString !== undefined && inputString != '') {
    return inputString.charAt(0).toUpperCase() + inputString.slice(1).toLowerCase()
  } else if (showHyphen) {
    return '-'
  } else {
    return ''
  }
}

export const generateRandomAlphanumeric = (length: any) => {
  const alphanumericCharacters = '0123456789'
  let result = ''

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * alphanumericCharacters.length)
    result += alphanumericCharacters.charAt(randomIndex)
  }
  return result
}

export const getFirstLetterCapitalOfWord = (props: string) => {
  if (props != undefined && props != null) {
    return props.charAt(0).toUpperCase() + props.slice(1).toLowerCase()
  } else {
    return ''
  }
}

export function checkValueOrEmptyString(value: any) {
  return value === null || value === undefined || value === 'null' || value === '' ? null : value
}

export function checkButtonStates(value: any) {
  return value === 'Loading...' ? true : false
}

export function validateList(list: any) {
  return list !== null && list !== undefined && list.length > 0
}

// Max File Size
export function isFileSizeValid(
  file: any,
  maxSizeInMB: number,
  availableStorage?: number,
  usedStorage?: number
) {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024 // Convert MB to bytes
  if (availableStorage && usedStorage) {
    const availableStorageInBytes = availableStorage * 1024 * 1024 * 1024 // Convert GB to bytes
    const usedStorageInBytes = usedStorage * 1024 * 1024 // Convert MB to bytes
    return file.size <= maxSizeInBytes && file.size + usedStorageInBytes <= availableStorageInBytes
  }
  return file.size <= maxSizeInBytes
}

// Dat format Function
export function formatDateTime(dateTimeString: any) {
  const now = moment()
  const date = moment(dateTimeString)

  const diffInMinutes = now.diff(date, 'minutes')
  const diffInHours = now.diff(date, 'hours')
  const diffInDays = now.diff(date, 'days')

  if (diffInMinutes < 1) {
    return 'Just now'
  }
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`
  }
  if (diffInHours < 24 && now.date() === date.date()) {
    return 'Today'
  }
  if (diffInHours < 48 && now.date() - date.date() === 1) {
    return 'Yesterday'
  }
  if (diffInDays < 4) {
    return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`
  }
  return date.format('DD-MMM')
}

// Dat format Function
export function properDateTime(dateTimeString: any) {
  const now = moment()
  const date = moment(dateTimeString)

  const diffInMinutes = now.diff(date, 'minutes')
  const diffInHours = now.diff(date, 'hours')
  const diffInDays = now.diff(date, 'days')

  if (diffInMinutes < 1) {
    return 'Just now'
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes}m`
  } else if (diffInHours < 24 && now.date() === date.date()) {
    return `${diffInHours}h`
  } else if (diffInHours < 48 && now.date() - date.date() === 1) {
    return 'Yesterday'
  } else if (diffInDays < 4) {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''}`
  } else {
    return date.format('DD-MMM')
  }
}

// Chat time format Function
export const formatTime = (dateTimeString: any) => {
  const formattedTime = moment(dateTimeString).format('hh:mm A')
  return formattedTime
}

// Diff between days
export const diffInDays = (startDate: any, endDate: any) => {
  const date1 = moment(startDate)
  const date2 = moment(endDate)

  const date = date2.diff(date1, 'days')
  return date
}

// Email validations
export const isValidEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Const Style for Tooltip
export const toolTipStyle = {
  width: '350px',
  background: '#fff',
  color: '#666666',
  borderColor: '#D9D9D9',
  borderRadius: '8px',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)', // Add boxShadow for a subtle shadow effect
  border: '1px solid black', // Add border
  opacity: '90%',
}

// get OS Name
export const getOperatingSystemName = () => {
  const userAgent = window.navigator.userAgent
  const platform = window.navigator.platform

  let os = 'Unknown OS'
  if (userAgent.includes('Windows')) {
    os = 'Windows'
  } else if (userAgent.includes('Mac')) {
    os = 'MacOS'
  } else if (userAgent.includes('Linux')) {
    os = 'Linux'
  } else if (
    platform.includes('iPhone') ||
    platform.includes('iPad') ||
    platform.includes('iPod')
  ) {
    os = 'iOS'
  } else if (platform.includes('Android')) {
    os = 'Android'
  }
  return os
}

// Remove the Sign before the Number or string
export function removeSign(value: number | null) {
  // Convert to string and remove leading sign
  const stringValue = String(value)
  const result = stringValue.replace(/^[-+]/, '')

  return result
}
// Open New window with link
export const getGoogleDrivePreviewUrl = (url: string) => {
  try {
    const parsedUrl = new URL(url)
    if (parsedUrl.hostname === 'drive.google.com' && parsedUrl.pathname.includes('/file/d/')) {
      const fileIdMatch = parsedUrl.pathname.match(/\/file\/d\/([^/]+)/)
      if (fileIdMatch) {
        return `https://drive.google.com/file/d/${fileIdMatch[1]}/preview`
      }
    }
    return url
  } catch {
    return url
  }
}

export const APP_PDF_VIEWER_EVENT = 'app-pdf-viewer:open'

export const isPdfUrl = (url: string) => {
  const normalizedUrl = String(url || '').toLowerCase()
  return (
    normalizedUrl.includes('.pdf') ||
    normalizedUrl.includes('application/pdf') ||
    normalizedUrl.startsWith('blob:')
  )
}

// Open New window with link
export const openDocument = (url: string, fileName?: string) => {
  const reactNativeWebView = (window as any).ReactNativeWebView

  if (reactNativeWebView && isPdfUrl(url)) {
    reactNativeWebView.postMessage(
      JSON.stringify({
        type: 'OPEN_PDF_PREVIEW',
        url,
        file_name: fileName,
      })
    )
    return
  }

  if (isPdfUrl(url)) {
    window.dispatchEvent(
      new CustomEvent(APP_PDF_VIEWER_EVENT, {
        detail: {url, fileName},
      })
    )
    return
  }

  window.open(url, '_blank')
}

// Convert Heic
export const createPhotoFile = (imageName: string, photo: any) => {
  const fileName = imageName.toLocaleLowerCase()
  if (
    fileName.slice(-3) == 'png' ||
    fileName.slice(-3) == 'jpg' ||
    fileName.slice(-4) == 'jpeg' ||
    fileName.slice(-3) == 'pdf'
  ) {
    const url = URL.createObjectURL(photo)
    return {file: photo, url: url}
  } else {
    ErrorToast(TEXT_CHAT_PHOTO_VALIDATION)
  }
}

export const createPhotoFileOnly = (imageName: string, photo: any) => {
  const fileName = imageName.toLocaleLowerCase()
  if (
    fileName.slice(-3) == 'png' ||
    fileName.slice(-3) == 'jpg' ||
    fileName.slice(-4) == 'jpeg' ||
    fileName.slice(-3) == 'pdf'
  ) {
    const url = URL.createObjectURL(photo)

    return {file: photo, url}
  } else {
    ErrorToast(TEXT_CHAT_PHOTO_VALIDATION)
  }
}

export const calculateCurrentAligner = (stepperData: any) => {
  if (stepperData?.selectedTreatment === 'NEW') {
    return 1
  } else if (stepperData.askCurrentAligner) {
    return null
  } else if (!stepperData.askCurrentAligner) {
    return stepperData?.currentAlignerSet
  }
}

export function getFormattedWearTime(
  selectedAlignerOption: any,
  allAlignerWearStats: any,
  alignerWiseWearStats: any
) {
  const wearTime =
    selectedAlignerOption.value === 'AllAligner'
      ? allAlignerWearStats?.avg_wear_time_in_secs
      : alignerWiseWearStats.aligner_avg_wear_time

  const formattedWearTime =
    getValueOrEmptyString(wearTime) === '-' ? '-' : secToHour(wearTime) + ' Hours'

  return formattedWearTime
}

export function getComplianceStyle(compliance: string) {
  const {GOOD, POOR, AVERAGE} = compilanceType

  if (compliance === POOR) {
    return 'text-red bg-redSupport'
  } else if (compliance === AVERAGE) {
    return 'text-secondaryColor bg-secondarySupport'
  } else if (compliance === GOOD) {
    return 'text-tertiaryColor bg-tertiarySupport'
  } else {
    return null
  }
}

// Convert Image URL's
export function getProfilePictureUrl(demoModeStatus: boolean, profilePictureUrl: string) {
  if (demoModeStatus) {
    return IMAGE_DEFAULT_PATIENT
  } else if (getValueOrEmptyString(profilePictureUrl) === '-') {
    return IMAGE_DEFAULT_PATIENT
  } else {
    return profilePictureUrl
  }
}

export const getProperFilteredEvents = (data: NotificationFilterOptionsRecord[]) => {
  if (!hasValue(data)) {
    return []
  }

  const today = moment().format('YYYY-MM-DD')
  const tomorrow = moment().add(1, 'day').format('YYYY-MM-DD')

  return data
    .filter((element: any) =>
      eventTypeOptions.some((option) => option.value === element.event_type)
    )
    .filter((element: any) => {
      if (element.event_type === eventType.TREATMENT_STARTING) {
        const date = element?.aligner_journey_details?.first_aligner_start_date
        return date === today || date === tomorrow
      } else if (element.event_type === eventType.ALIGNER_CHANGE) {
        return !element.validated
      }
      return true
    })
}

export const isAllowedFileExtension = (fileName: string, allowedExtensions: any) => {
  const parts = fileName.split('.')
  if (parts.length > 1) {
    const fileExtension = parts[parts.length - 1].toLowerCase()
    return allowedExtensions.includes(fileExtension)
  }
  return false
}

export const formatPluralizedString = (number: number, inputString: string) => {
  if (hasValue(number)) {
    return number === 1 ? number + ' ' + inputString : number + ' ' + inputString + 's'
  } else {
    return inputString
  }
}

export const formatPluralizedStringOnly = (number: number | null, inputString: string) => {
  if (hasValue(number)) {
    return number === 1 ? inputString : inputString + 's'
  } else {
    return inputString
  }
}

export const formatDate = (dateString: string): string => {
  const messageDate = moment(dateString)
  const today = moment()
  const yesterday = moment().subtract(1, 'day')

  if (messageDate.isSame(today, 'day')) {
    return 'Today'
  } else if (messageDate.isSame(yesterday, 'day')) {
    return 'Yesterday'
  } else {
    return messageDate.format('DD-MMM-YYYY')
  }
}

export const getProperStatusChange = (status: string) => {
  const option = alignerStatusOptions.find((option) => option.value === status)
  return option ? option.label : ''
}

export const findAlignerObject = (alignerObjects: any, alignerNo: number) => {
  if (alignerObjects.length > 0) {
    const objectOfCurrentAligner = alignerObjects.find((obj: any) => obj.sr_no === alignerNo)
    return objectOfCurrentAligner?.avg_time_in_secs
  } else {
    return 0
  }
}

export const emailRegex = /^[a-zA-Z0-9][a-zA-Z0-9._-]*@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)+$/

export const checkEmailIsValid = (email: string) => {
  return emailRegex.test(email)
}

export const getDeviceDetails = () => {
  const client = new ClientJS()

  return {
    fingerprint: client.getFingerprint(),
    brand: client.getOS(),
    device_type: client.getOSVersion(),
    model_name: client.getCPU(),
    ip: '',
    mac: '',
  }
}

// Format Invite Code
export const formattedInviteCode = (code: string) => {
  const sanitized = code?.replace(/\s+/g, '') ?? ''
  const groups = sanitized.match(/.{1,4}/g)
  return groups ? groups.join(' - ') : ''
}

// Format Invite Code
export const formattedInviteCodeWithoutSpace = (code: string) => {
  const formatted = `${code?.slice(0, 4)}-${code?.slice(4)}`
  return formatted
}

// Check
export function getProductionLabIdUsingName(
  label: string,
  productionLabList: {label: string; value: string}[]
) {
  for (const productionLab of productionLabList) {
    if (productionLab.label === label) {
      return productionLab
    }
  }
  return {value: '', label: ''}
}

// Extract jaw-types and sr no
export const extractSrNoAndJawType = (data: any[]): AlignerData[] => {
  return data.map((item) => ({
    sr_no: item.sr_no,
    jaw_type: item.jaw_type,
  }))
}

// Create Jaw Ranges
export const createJawTypesArray = (data: AlignerData[]) => {
  const upperRanges: string[] = []
  const lowerRanges: string[] = []
  let currentRangeStart = null

  for (let i = 0; i < data.length; i++) {
    const item = data[i]

    if (item.jaw_type === 'UPPER' || item.jaw_type === 'BOTH') {
      if (currentRangeStart === null) {
        currentRangeStart = item.sr_no
      }
    } else {
      if (currentRangeStart !== null) {
        upperRanges.push(
          `${
            currentRangeStart === item.sr_no - 1
              ? currentRangeStart
              : currentRangeStart + '-' + (item.sr_no - 1)
          }`
        )
        currentRangeStart = null
      }
    }
  }

  if (currentRangeStart !== null) {
    upperRanges.push(
      `${
        currentRangeStart === data[data.length - 1].sr_no
          ? currentRangeStart
          : currentRangeStart + '-' + data[data.length - 1].sr_no
      }`
    )
  }
  currentRangeStart = null
  for (let i = 0; i < data.length; i++) {
    const item = data[i]
    if (item.jaw_type === 'LOWER' || item.jaw_type === 'BOTH') {
      if (currentRangeStart === null) {
        currentRangeStart = item.sr_no
      }
    } else {
      if (currentRangeStart !== null) {
        lowerRanges.push(
          `${
            currentRangeStart === item.sr_no - 1
              ? currentRangeStart
              : currentRangeStart + '-' + (item.sr_no - 1)
          }`
        )
        currentRangeStart = null
      }
    }
  }

  if (currentRangeStart !== null) {
    lowerRanges.push(
      `${
        currentRangeStart === data[data.length - 1].sr_no
          ? currentRangeStart
          : currentRangeStart + '-' + data[data.length - 1].sr_no
      }`
    )
  }

  return {
    upper: upperRanges,
    lower: lowerRanges,
  }
}

// Practice Location Name Crop
export const cropPracticeLocationName = (item: string) => {
  if (hasValue(item) && item.length > 30) {
    return item.substring(0, 30) + '...'
  }
  return item
}
import dayjs from 'dayjs'
import orderStatusConstants from '@constants/orderStatus.constants'
import {IProfileRole} from 'redux/Slices/AppSlice/DoctorProfile/DoctorProfileGetSlice'
import rolesConstants from '@constants/roles.constants'
import {
  AlignerDetailsMetaData,
  AllTreatmentPlanListItem,
} from 'screens/Patients/LeadsProfile/main/treatment/types/treatmentPlan.types'
import manufacturingConstants from '@constants/manufacturing.constants'
import {IOrder} from 'screens/Orders/orders.types'
import {Sub_Role_Data} from 'screens/AccessControl/AccessControlList/types/accessControlList.types'
import {AuthContext} from 'context/AuthContext'
import {useContext} from 'react'
import {Product} from 'screens/Kanban/screens/ProductionSetup/SelectTaskManufacturingType'
import {CaseRecordFile} from 'redux/Slices/AppSlice/CaseRecords/CaseRecord.type'
import {NotificationFilterOptionsRecord} from 'components/Dashboard/types/notificationList.types'
export const DRIVE_IMAGE_PREFIX = 'https://drive.google.com/file'

export const disabledTime = () => {
  const currentHour = dayjs().hour()
  const currentMinute = dayjs().minute()
  return {
    disabledHours: () => {
      const hours = []
      for (let i = 0; i < currentHour; i++) {
        hours.push(i)
      }
      return hours
    },
    disabledMinutes: (selectedHour: any) => {
      if (selectedHour === currentHour) {
        const minutes = []
        for (let i = 0; i < currentMinute; i++) {
          minutes.push(i)
        }
        return minutes
      }
      return []
    },
  }
}

export const formatDateForFewMonths = (inputDate: string) => {
  const date = dayjs(inputDate)
  const today = dayjs()
  const yesterday = today.subtract(1, 'day')
  const twoDaysAgo = today.subtract(2, 'day')
  const oneWeekAgo = today.subtract(1, 'week')
  const oneMonthAgo = today.subtract(1, 'month')

  if (date.isSame(today, 'day')) {
    return 'Today'
  } else if (date.isSame(yesterday, 'day')) {
    return 'Yesterday'
  } else if (date.isSame(twoDaysAgo, 'day')) {
    return 'Two days ago'
  } else if (date.isAfter(oneWeekAgo, 'day')) {
    return 'Within the past week'
  } else if (date.isAfter(oneMonthAgo, 'day')) {
    return 'Within the past month'
  } else {
    return date.format('MMMM D, YYYY') // Default format if not within the past month
  }
}

export const identifyUser = async () => {
  return
}

export function sliceArray<IAlignerTrackingAligner>(
  arr: IAlignerTrackingAligner[] | null | undefined,
  n: number
): IAlignerTrackingAligner[] {
  if (!Array.isArray(arr) || arr.length === 0 || n <= 0) {
    return []
  }

  return arr.slice(0, n - 1)
}
export const formatToTwoDecimalPlaces = (value: number | string | null): number | null => {
  if (value === null || value === undefined) {
    return null
  }
  const numberValue = typeof value === 'string' ? parseFloat(value) : value
  return parseFloat(numberValue.toFixed(2))
}

export const DateFormat = (date: string | undefined | null): string => {
  if (date === null || date === undefined) {
    return '--'
  }
  return moment(date, 'YYYY-MM-DDTHH:mm:ss').format('DD-MMM-YYYY')
}

export function areObjectValuesEmpty(object: any) {
  return Object.values(object).some((value) => value !== null)
}

export const removeUnderscore = (status: string | undefined | null): string => {
  if (!status) {
    return '' // Return an empty string or a fallback value if `status` is undefined or null
  }
  if (status === orderStatusConstants.RE_PLAN) {
    return 'RE-PLAN'
  }
  if (status === manufacturingConstants.DELIVERED) {
    return 'COMPLETED'
  }
  return status.replace(/_/g, ' ')
}

export const doesRoleExistForCustomer = (roles: IProfileRole[]): string[] => {
  const role = roles.some((role) => role.name === rolesConstants.VENDOR)
  return role
    ? [
        rolesConstants.COMMERCIAL_ALIGNER_LAB,
        rolesConstants.CLINIC_OWNER,
        rolesConstants.IN_OFFICE_MANUFACTURER,
        rolesConstants.CUSTOMER,
        rolesConstants.VENDOR,
        rolesConstants.ALIGNER_COMPANY_OR_LAB,
      ]
    : [
        rolesConstants.COMMERCIAL_ALIGNER_LAB,
        rolesConstants.CLINIC_OWNER,
        rolesConstants.IN_OFFICE_MANUFACTURER,
        rolesConstants.CUSTOMER,
        rolesConstants.VENDOR,
        rolesConstants.ALIGNER_COMPANY_OR_LAB,
      ]
}

export function getTotalToothValue(data: AlignerDetailsMetaData) {
  const upperMax = Math.max(...data.upper_jaw.range)
  const lowerMax = Math.max(...data.lower_jaw.range)
  return Math.max(upperMax, lowerMax)
}

interface JawRange {
  starts_with: number
  ends_with: number
  range: number[]
}

export function arrayOfAligners(data: {
  upper_jaw?: JawRange
  lower_jaw?: JawRange
}): {label: string; value: number}[] {
  if (data && !data?.upper_jaw && !data?.lower_jaw) return []

  const upperRange = data?.upper_jaw?.range ?? []
  const lowerRange = data?.lower_jaw?.range ?? []

  const allUniqueAligners = Array.from(new Set([...upperRange, ...lowerRange])).sort(
    (a, b) => a - b
  )

  return allUniqueAligners.map((num) => {
    const isUpper = upperRange.includes(num)
    const isLower = lowerRange.includes(num)

    let label = ''
    if (isUpper && isLower) label = 'Upper & Lower'
    else if (isUpper) label = 'Upper'
    else if (isLower) label = 'Lower'

    return {
      label: `${num} (${label})`,
      value: num,
    }
  })
}

export type AlignerOption = {
  label: string
  value: number
}

export function generateAlignerOptions(
  lowerStart: number | null,
  lowerEnd: number | null,
  upperStart: number | null,
  upperEnd: number | null
): AlignerOption[] {
  const result: AlignerOption[] = []

  const safeLowerStart = lowerStart ?? Infinity
  const safeUpperStart = upperStart ?? Infinity
  const safeLowerEnd = lowerEnd ?? -Infinity
  const safeUpperEnd = upperEnd ?? -Infinity

  // Ensure minStart is at least 1
  const minStart = Math.max(1, Math.min(safeLowerStart, safeUpperStart))
  const maxEnd = Math.max(safeLowerEnd, safeUpperEnd)

  for (let num = minStart; num <= maxEnd; num++) {
    const inLower = lowerStart !== null && lowerEnd !== null && num >= lowerStart && num <= lowerEnd
    const inUpper = upperStart !== null && upperEnd !== null && num >= upperStart && num <= upperEnd

    if (!inLower && !inUpper) continue

    let label = ''
    if (inUpper && inLower) {
      label = `${num} Upper & Lower`
    } else if (inUpper) {
      label = `${num} Upper`
    } else if (inLower) {
      label = `${num} Lower`
    }

    result.push({
      label,
      value: num,
    })
  }

  return result
}

export const arrangedAlignerString = ({
  total_aligners,
  upper_aligner_start,
  upper_aligner_end,
  lower_aligner_start,
  lower_aligner_end,
}: {
  total_aligners: number
  upper_aligner_start: number
  upper_aligner_end: number
  lower_aligner_start: number
  lower_aligner_end: number
}) => {
  const upper =
    upper_aligner_start && upper_aligner_start !== 0
      ? ` • U${upper_aligner_start} to U${upper_aligner_end}`
      : ''
  const lower =
    lower_aligner_start && lower_aligner_start !== 0
      ? ` • L${lower_aligner_start} to L${lower_aligner_end}`
      : ''

  return `${total_aligners} Aligner ${upper}  ${lower}`
}

export const getActiveTreatmentPlan = (order: IOrder | null): AllTreatmentPlanListItem | null => {
  return (
    order?.treatment_plan_responses?.find(
      (treatment: AllTreatmentPlanListItem) =>
        treatment?.treatment_status === 'ACTIVE' || treatment?.treatment_status === 'COMPLETE'
    ) || null
  )
}

export const getRole = (role: string) => {
  switch (role) {
    case 'SUPER_ADMIN':
      return 'Super Admin'
    case 'ADMIN':
      return 'Admin'
    case 'PLANNING_QC':
      return 'Planning QC'
    case 'PLANNING_TECHNICIAN':
      return 'Planning Technician'
    case 'LAB_STAFF':
      return 'Lab staff'
    case 'PRACTICE':
      return 'Practice'
    case 'CUSTOMER':
      return 'Customer'
    case 'LABS':
      return 'Labs'
    case 'GUEST':
      return 'Guest'
    default:
      return role
  }
}

export function extractSubModulesWithPermissions(roleObj: Sub_Role_Data, isEdit: boolean) {
  return roleObj.modules.flatMap((module) =>
    module.sub_modules.map((subModule) => ({
      ...subModule,
      permissions: isEdit ? subModule.permissions : [],
    }))
  )
}

export const getDefaultColor = (system?: string) => {
  switch (system) {
    case 'IN_PROGRESS':
      return '#3b82f6' // blue
    case 'DONE':
      return '#10b981' // green
    case 'CANCELLED':
      return '#ef4444' // red
    default:
      return '#6b7280' // gray
  }
}

export const formatResult = (result: any) => {
  if (!result) return ''
  return result
    .split('_')
    .map((word: any) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

export const isPlanCreatedByMe = (doctor_id: number) => {
  const {userId} = useContext(AuthContext)
  if (safeParseInt(doctor_id) === safeParseInt(userId)) {
    return true
  } else {
    return false
  }
}

export const isAlignersPlanningAndManufacturing = (p: Product) => {
  const raw = ((p as any)?.product_category_name ?? (p as any)?.category_name ?? '')
    .toString()
    .toUpperCase()
    .replace(/\s+/g, '')
  return raw === 'ALIGNERS(PLANNING+MANUFACTURING)'
}

export const getSalutations = (salutation: string) => {
  return `${salutation === '' ? '' : salutation + '.'} `
}

export const getWorkFlowName = (selectedSubWorkflow: string) => {
  switch (selectedSubWorkflow) {
    case 'new-case':
      return 'New Case'
    case 'planning-in-house':
      return 'Planning In House'
    case 'production-in-house':
      return 'Production In House'
    case 'planning-outsource':
      return 'Plan Outsourced'
    case 'planning-order':
      return 'Planning Order'
    case 'production-outsource':
      return 'Production Outsource'
    default:
      return 'New Case'
  }
}

export const getImageUrl = (file: any) => {
  if (!file) {
    return ''
  }
  return file?.is_gdrive_platform
    ? `${process.env.REACT_APP_BASE_APP_PATIENT_URL}/patient/drive/image/${file.drive_file_id}`
    : file.url
}

export const openDriveUrls = (url: string) => {
  if (url.startsWith(DRIVE_IMAGE_PREFIX)) {
    if (typeof window !== 'undefined') {
      window.open(url, '_blank', 'noopener,noreferrer')
    }
    return
  }
}

export const getImageUrlById = (profile_picture_id: number) => {
  return `${process.env.REACT_APP_BASE_APP_PATIENT_URL}/patient/profile/v2/get/profile_picture/${profile_picture_id}`
}

export function isLocalhost() {
  const isLocalhost = () => window.location.hostname === 'localhost'
  return isLocalhost()
}
export const withKanbanParam = (path: string, kanbanName?: string | null) => {
  if (!kanbanName) return path

  const params = new URLSearchParams({
    kanban_name: kanbanName,
  })

  return `${path}?${params.toString()}`
}

export const getNavigateUrl = (role: 'INTERNAL_USER' | 'CONSULTING_ORTHODONTIST') => {
  switch (role) {
    case 'INTERNAL_USER':
      return '/access-control/users?tab=internal'
    default:
      return '/access-control/users?tab=external'
  }
}

export const getCustomerId = ({
  order,
  profileId,
  isAdmin,
}: {
  order: IOrder
  profileId: number
  isAdmin: boolean
}) => {
  return safeParseInt(order?.service_products?.profile_id) === profileId || isAdmin
    ? safeParseInt(order?.patient_details?.assigned_practice?.practice_profile_id)
    : safeParseInt(profileId)
}

export const getFileType = (file: CaseRecordFile) => {
  const fileName = file.name || ''
  const extension = fileName.split('.').pop()?.toLowerCase()

  if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension || '')) return 'image'
  if (['pdf'].includes(extension || '')) return 'pdf'
  if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'].includes(extension || '')) return 'video'
  if (['stl', 'obj', 'ply'].includes(extension || '')) return '3d'
  if (['zip', 'rar', '7z'].includes(extension || '')) return 'archive'
  return 'file'
}

export function normalizeGoogleDriveUrl(url: string) {
  try {
    const parsedUrl = new URL(url)
    if (parsedUrl.hostname === 'drive.google.com' && parsedUrl.pathname.includes('/file/d/')) {
      const fileIdMatch = parsedUrl.pathname.match(/\/file\/d\/([^/]+)/)
      if (fileIdMatch) {
        return `https://drive.google.com/uc?export=download&id=${fileIdMatch[1]}`
      }
    }
    return url
  } catch {
    return url
  }
}
