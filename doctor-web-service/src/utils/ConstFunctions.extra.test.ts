import moment from 'moment'
import {
  formatPluralizedString,
  formatPluralizedStringOnly,
  formatDate,
  formattedInviteCode,
  formattedInviteCodeWithoutSpace,
  extractSrNoAndJawType,
  createJawTypesArray,
  formatDateForFewMonths,
  sliceArray,
  formatToTwoDecimalPlaces,
  DateFormat,
  getRole,
  getDefaultColor,
  getSalutations,
  getWorkFlowName,
  getImageUrl,
  removeUnderscore,
  formatResult,
  isAlignersPlanningAndManufacturing,
  openDriveUrls,
  getProperStatusChange,
  findAlignerObject,
  checkEmailIsValid,
  cropPracticeLocationName,
  disabledTime,
  areObjectValuesEmpty,
  doesRoleExistForCustomer,
  getTotalToothValue,
  arrayOfAligners,
  generateAlignerOptions,
  arrangedAlignerString,
  getActiveTreatmentPlan,
  extractSubModulesWithPermissions,
  isAllowedFileExtension,
} from './ConstFunctions'
import manufacturingConstants from '@constants/manufacturing.constants'
import orderStatusConstants from '@constants/orderStatus.constants'
import rolesConstants from '@constants/roles.constants'
import {AllTreatmentPlanListItem} from 'screens/Patients/LeadsProfile/main/treatment/types/treatmentPlan.types'
import {IOrder} from 'screens/Orders/orders.types'

jest.mock('@staticData/alignerStatusOptions', () => [
  {value: 'ACTIVE', label: 'Active'},
  {value: 'QUEUED', label: 'Queued'},
])

// Ensure a base env for image URL computation
process.env.REACT_APP_BASE_APP_PATIENT_URL = 'https://example.com'

describe('formatPluralizedString', () => {
  test.each([
    [1, 'item', '1 item'],
    [2, 'item', '2 items'],
    [0, 'thing', '0 things'],
    [null as any, 'count', 'count'],
  ])('formats %s %s', (count, label, expected) => {
    expect(formatPluralizedString(count as number, label)).toBe(expected)
  })
})

describe('formatPluralizedStringOnly', () => {
  test.each([
    [1, 'apple', 'apple'],
    [5, 'apple', 'apples'],
    [null, 'banana', 'banana'],
  ])('formats %s %s', (count, label, expected) => {
    expect(formatPluralizedStringOnly(count as number, label)).toBe(expected)
  })
})

describe('formattedInviteCode', () => {
  test.each([
    ['abcd1234', 'abcd - 1234'],
    ['abcd 1234 ef', 'abcd - 1234 - ef'],
    ['', ''],
  ])('formats %s', (code, expected) => {
    expect(formattedInviteCode(code)).toBe(expected)
  })
})

describe('formattedInviteCodeWithoutSpace', () => {
  test.each([
    ['abcd1234', 'abcd-1234'],
    ['wxyz', 'wxyz-'],
    ['', '-'],
  ])('formats %s', (code, expected) => {
    expect(formattedInviteCodeWithoutSpace(code)).toBe(expected)
  })
})

describe('aligner jaw utilities', () => {
  it('extracts sr_no and jaw_type', () => {
    const data = [{sr_no: 1, jaw_type: 'UPPER', extra: true}]
    expect(extractSrNoAndJawType(data)).toEqual([{sr_no: 1, jaw_type: 'UPPER'}])
  })

  it('creates ranges for upper and lower jaws', () => {
    const input = [
      {sr_no: 1, jaw_type: 'UPPER'},
      {sr_no: 2, jaw_type: 'UPPER'},
      {sr_no: 3, jaw_type: 'LOWER'},
      {sr_no: 4, jaw_type: 'BOTH'},
      {sr_no: 5, jaw_type: 'LOWER'},
    ]
    expect(createJawTypesArray(input as any)).toEqual({upper: ['1-2', '4'], lower: ['3-5']})
  })
})

describe('formatDateForFewMonths', () => {
  const fixedNow = new Date('2023-08-10T12:00:00Z')
  beforeAll(() => {
    jest.useFakeTimers()
    jest.setSystemTime(fixedNow)
  })
  afterAll(() => {
    jest.useRealTimers()
  })

  test.each([
    ['2023-08-10', 'Today'],
    ['2023-08-09', 'Yesterday'],
    ['2023-08-08', 'Two days ago'],
    ['2023-08-07', 'Within the past week'],
    ['2023-07-20', 'Within the past month'],
    ['2023-06-10', 'June 10, 2023'],
  ])('formats %s', (input, expected) => {
    expect(formatDateForFewMonths(input)).toBe(expected)
  })
})

describe('sliceArray', () => {
  test.each([
    [[1, 2, 3], 2, [1]],
    [[1, 2, 3], 1, []],
    [[], 3, []],
    [null, 2, []],
  ])('slices %j to %s', (arr, n, expected) => {
    expect(sliceArray(arr as any, n as number)).toEqual(expected)
  })
})

describe('formatToTwoDecimalPlaces', () => {
  test.each([
    [1.2345, 1.23],
    ['2.999', 3],
    [null, null],
    [5, 5],
  ])('formats %s', (value, expected) => {
    expect(formatToTwoDecimalPlaces(value as any)).toBe(expected)
  })
})

describe('DateFormat', () => {
  test.each([
    ['2023-01-01T00:00:00', '01-Jan-2023'],
    [null, '--'],
    [undefined, '--'],
  ])('formats %s', (value, expected) => {
    expect(DateFormat(value as any)).toBe(expected)
  })
})

describe('getRole', () => {
  test.each([
    ['SUPER_ADMIN', 'Super Admin'],
    ['ADMIN', 'Admin'],
    ['PLANNING_QC', 'Planning QC'],
    ['PLANNING_TECHNICIAN', 'Planning Technician'],
    ['LAB_STAFF', 'Lab staff'],
    ['PRACTICE', 'Practice'],
    ['CUSTOMER', 'Customer'],
    ['UNKNOWN', 'UNKNOWN'],
  ])('maps %s', (value, expected) => {
    expect(getRole(value)).toBe(expected)
  })
})

describe('getDefaultColor', () => {
  test.each([
    ['IN_PROGRESS', '#3b82f6'],
    ['DONE', '#10b981'],
    ['CANCELLED', '#ef4444'],
    ['OTHER', '#6b7280'],
  ])('color for %s', (system, expected) => {
    expect(getDefaultColor(system)).toBe(expected)
  })
})

describe('getSalutations', () => {
  test.each([
    ['Dr', 'Dr. '],
    ['Mr', 'Mr. '],
    ['', ' '],
  ])('formats %s', (value, expected) => {
    expect(getSalutations(value)).toBe(expected)
  })
})

describe('getWorkFlowName', () => {
  test.each([
    ['new-case', 'New Case'],
    ['planning-in-house', 'Planning In House'],
    ['production-in-house', 'Production In House'],
    ['planning-outsource', 'Plan Outsourced'],
    ['planning-order', 'Planning Order'],
    ['production-outsource', 'Production Outsource'],
    ['random', 'New Case'],
  ])('maps %s', (value, expected) => {
    expect(getWorkFlowName(value)).toBe(expected)
  })
})

describe('getImageUrl', () => {
  it('returns drive URL when flagged', () => {
    const result = getImageUrl({is_gdrive_platform: true, drive_file_id: 'abc'})
    expect(result).toBe('https://example.com/patient/drive/image/abc')
  })

  it('returns direct url when not drive', () => {
    expect(getImageUrl({url: 'http://file'})).toBe('http://file')
  })
})

describe('removeUnderscore', () => {
  test.each([
    [orderStatusConstants.RE_PLAN, 'RE-PLAN'],
    [manufacturingConstants.DELIVERED, 'COMPLETED'],
    ['IN_PROGRESS', 'IN PROGRESS'],
    [undefined, ''],
  ])('formats %s', (status, expected) => {
    expect(removeUnderscore(status)).toBe(expected)
  })
})

describe('formatResult', () => {
  test.each([
    ['HELLO_WORLD', 'Hello World'],
    ['single', 'Single'],
  ])('formats %s', (input, expected) => {
    expect(formatResult(input)).toBe(expected)
  })
})

describe('isAlignersPlanningAndManufacturing', () => {
  it('detects combined category name', () => {
    expect(
      isAlignersPlanningAndManufacturing({
        category_name: 'Aligners (Planning + Manufacturing)',
      } as any)
    ).toBe(true)
  })

  it('returns false for other categories', () => {
    expect(isAlignersPlanningAndManufacturing({category_name: 'Other'} as any)).toBe(false)
  })
})

describe('openDriveUrls', () => {
  it('opens drive links in new tab', () => {
    const open = jest.spyOn(window, 'open').mockImplementation(() => null)
    openDriveUrls('https://drive.google.com/file/abc')
    expect(open).toHaveBeenCalledWith(
      'https://drive.google.com/file/abc',
      '_blank',
      'noopener,noreferrer'
    )
    open.mockRestore()
  })

  it('ignores non-drive links', () => {
    const open = jest.spyOn(window, 'open').mockImplementation(() => null)
    openDriveUrls('https://example.com')
    expect(open).not.toHaveBeenCalled()
    open.mockRestore()
  })
})

describe('formatDate and status helpers', () => {
  it('formats today/yesterday/other dates', () => {
    const today = moment().format('YYYY-MM-DD')
    const yesterday = moment().subtract(1, 'day').format('YYYY-MM-DD')
    expect(formatDate(today)).toBe('Today')
    expect(formatDate(yesterday)).toBe('Yesterday')
    expect(formatDate('2020-01-01')).toBe('01-Jan-2020')
  })

  test.each([
    ['ACTIVE', 'Active'],
    ['QUEUED', 'Queued'],
    ['UNKNOWN', ''],
  ])('maps aligner status %s', (value, expected) => {
    expect(getProperStatusChange(value)).toBe(expected)
  })

  it('finds aligner object by sr_no', () => {
    const aligners = [{sr_no: 2, avg_time_in_secs: 15}]
    expect(findAlignerObject(aligners, 2)).toBe(15)
    expect(findAlignerObject(aligners, 3)).toBeUndefined()
  })
})

describe('email and file utilities', () => {
  test.each([
    ['user@example.com', true],
    ['bad@email', false],
    ['no-at.com', false],
    ['.lead@domain.com', false],
  ])('validates %s', (email, expected) => {
    expect(checkEmailIsValid(email)).toBe(expected)
  })

  test.each([
    ['file.pdf', ['pdf', 'jpg'], true],
    ['image.JPG', ['pdf', 'jpg'], true],
    ['noext', ['pdf'], false],
    ['file', ['png'], false],
  ])('checks extensions for %s', (name, allowed, expected) => {
    expect(isAllowedFileExtension(name, allowed)).toBe(expected)
  })
})

describe('cropPracticeLocationName', () => {
  it('truncates long names and keeps short ones', () => {
    expect(cropPracticeLocationName('Short')).toBe('Short')
    expect(cropPracticeLocationName('A'.repeat(35))).toBe('A'.repeat(30) + '...')
  })
  it('returns input when empty', () => {
    expect(cropPracticeLocationName('')).toBe('')
  })
})

describe('disabledTime', () => {
  const fixed = new Date('2023-01-01T10:30:00')
  beforeAll(() => {
    jest.useFakeTimers()
    jest.setSystemTime(fixed)
  })
  afterAll(() => {
    jest.useRealTimers()
  })

  it('disables past hours and minutes for current hour', () => {
    const {disabledHours, disabledMinutes} = disabledTime()
    expect(disabledHours()).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
    expect(disabledMinutes(10)).toEqual([...Array(30).keys()])
    expect(disabledMinutes(9)).toEqual([])
  })
})

describe('object and role helpers', () => {
  it('detects non-empty object values', () => {
    expect(areObjectValuesEmpty({a: null, b: null})).toBe(false)
    expect(areObjectValuesEmpty({a: null, b: 1})).toBe(true)
    expect(areObjectValuesEmpty({a: '', b: null})).toBe(true)
  })

  it('returns unified customer roles regardless of vendor presence', () => {
    const expected = [
      rolesConstants.COMMERCIAL_ALIGNER_LAB,
      rolesConstants.CLINIC_OWNER,
      rolesConstants.IN_OFFICE_MANUFACTURER,
      rolesConstants.CUSTOMER,
      rolesConstants.VENDOR,
      rolesConstants.ALIGNER_COMPANY_OR_LAB,
    ]
    expect(doesRoleExistForCustomer([{name: rolesConstants.VENDOR} as any])).toEqual(expected)
    expect(doesRoleExistForCustomer([{name: rolesConstants.CUSTOMER} as any])).toEqual(expected)
  })
})

describe('aligner range utilities', () => {
  it('gets total tooth value from ranges', () => {
    const data = {upper_jaw: {range: [1, 2]}, lower_jaw: {range: [3, 4]}} as any
    expect(getTotalToothValue(data)).toBe(4)
  })

  it('builds aligner list from upper/lower ranges', () => {
    const list = arrayOfAligners({upper_jaw: {range: [1, 2]}, lower_jaw: {range: [2, 3]}} as any)
    expect(list).toEqual([
      {label: '1 (Upper)', value: 1},
      {label: '2 (Upper & Lower)', value: 2},
      {label: '3 (Lower)', value: 3},
    ])
  })
  it('returns 0 when aligner object is not found in empty array', () => {
    expect(findAlignerObject([], 1)).toBe(0)
  })

  it('returns empty when no ranges provided', () => {
    expect(arrayOfAligners({} as any)).toEqual([])
  })

  test.each([
    [
      1,
      2,
      2,
      3,
      [
        {label: '1 Lower', value: 1},
        {label: '2 Upper & Lower', value: 2},
        {label: '3 Upper', value: 3},
      ],
    ],
    [null, null, 1, 1, [{label: '1 Upper', value: 1}]],
    [1, 1, null, null, [{label: '1 Lower', value: 1}]],
    [0, 0, 0, 0, []],
  ])('generates options for lower %s-%s upper %s-%s', (ls, le, us, ue, expected) => {
    expect(generateAlignerOptions(ls as any, le as any, us as any, ue as any)).toEqual(expected)
  })

  it('formats arranged aligner string', () => {
    expect(
      arrangedAlignerString({
        total_aligners: 10,
        upper_aligner_start: 1,
        upper_aligner_end: 5,
        lower_aligner_start: 2,
        lower_aligner_end: 6,
      })
    ).toBe('10 Aligner  • U1 to U5   • L2 to L6')
  })

  it('formats arranged aligner string with missing ranges', () => {
    expect(
      arrangedAlignerString({
        total_aligners: 5,
        upper_aligner_start: 0,
        upper_aligner_end: 0,
        lower_aligner_start: 0,
        lower_aligner_end: 0,
      })
    ).toBe('5 Aligner   ')
  })
})

describe('treatment plan helpers', () => {
  it('returns active treatment plan when present', () => {
    const active = {treatment_status: 'ACTIVE'} as AllTreatmentPlanListItem
    const order = {treatment_plan_responses: [active]} as IOrder
    expect(getActiveTreatmentPlan(order)).toBe(active)
  })

  it('returns complete when no active', () => {
    const complete = {treatment_status: 'COMPLETE'} as AllTreatmentPlanListItem
    const order = {treatment_plan_responses: [complete]} as IOrder
    expect(getActiveTreatmentPlan(order)).toBe(complete)
  })

  it('returns null when no matching status', () => {
    const order = {treatment_plan_responses: [{treatment_status: 'PENDING'}]} as IOrder
    expect(getActiveTreatmentPlan(order)).toBeNull()
  })

  it('returns null when order is null', () => {
    expect(getActiveTreatmentPlan(null)).toBeNull()
  })
})

describe('extractSubModulesWithPermissions', () => {
  const baseModule = {
    modules: [
      {
        sub_modules: [
          {id: 1, permissions: ['A']},
          {id: 2, permissions: ['B']},
        ],
      },
    ],
  } as any

  it('keeps permissions when edit mode', () => {
    const result = extractSubModulesWithPermissions(baseModule, true)
    expect(result).toEqual(
      expect.arrayContaining([
        {id: 1, permissions: ['A']},
        {id: 2, permissions: ['B']},
      ])
    )
  })

  it('clears permissions when not edit mode', () => {
    const result = extractSubModulesWithPermissions(baseModule, false)
    expect(
      result.every((m: any) => Array.isArray(m.permissions) && m.permissions.length === 0)
    ).toBe(true)
  })
})
