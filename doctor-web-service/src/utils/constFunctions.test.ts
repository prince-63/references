import {
  convertDateToDDMMMYYYY,
  convertDateToDDMMYYYY,
  ConvertYYYYMMDDToDDMMMYYYY,
  getDifferenceInDays,
  addDaysToDate,
  minusDaysToDate,
  formatDatesForTreatmentPlanTable,
  fileFormatDateTime,
  fileFormatDateTimeForTimeline,
} from './DateFunctions'
import {
  safeParseInt,
  isObjectEmpty,
  getValueOrEmptyString,
  secToHour,
  capitalizeFirstLetter,
  generateRandomAlphanumeric,
  getFirstLetterCapitalOfWord,
  checkValueOrEmptyString,
  checkButtonStates,
  validateList,
  isFileSizeValid,
  formatDateTime,
  properDateTime,
  formatTime,
  diffInDays,
  isValidEmail,
  getOperatingSystemName,
  getComplianceStyle,
  getProfilePictureUrl,
  isAllowedFileExtension,
  formatPluralizedString,
  formatPluralizedStringOnly,
  formatDate,
  findAlignerObject,
  formattedInviteCode,
  formattedInviteCodeWithoutSpace,
  extractSrNoAndJawType,
  createJawTypesArray,
  formatDateForFewMonths,
  sliceArray,
  formatToTwoDecimalPlaces,
  DateFormat,
  areObjectValuesEmpty,
  getTotalToothValue,
  arrayOfAligners,
  generateAlignerOptions,
  arrangedAlignerString,
  getActiveTreatmentPlan,
  getRole,
  extractSubModulesWithPermissions,
  getDefaultColor,
  formatResult,
  getSalutations,
  getWorkFlowName,
  getImageUrl,
  openDriveUrls,
} from './ConstFunctions'

const setNavigator = (userAgent: string, platform: string) => {
  Object.defineProperty(window.navigator, 'userAgent', {value: userAgent, configurable: true})
  Object.defineProperty(window.navigator, 'platform', {value: platform, configurable: true})
}

describe('DateFunctions', () => {
  it('formats dates to DD MMM YYYY and DD/MM/YYYY', () => {
    expect(convertDateToDDMMMYYYY('2023-01-05')).toBe('Jan 5, 2023')
    expect(convertDateToDDMMYYYY('2023-02-01')).toBe('01/02/2023')
  })

  it('converts YYYY-MM-DD to readable string', () => {
    expect(ConvertYYYYMMDDToDDMMMYYYY('2023-12-31')).toBe('31 Dec 2023')
  })

  it('calculates day differences and adjusts days', () => {
    expect(getDifferenceInDays('2023-01-01', '2023-01-10')).toBe(9)
    expect(addDaysToDate('2023-01-01', 3)).toBe('2023-01-03')
    expect(minusDaysToDate('2023-01-10', 3)).toBe('2023-01-13')
  })

  it('formats date ranges for display and sorting', () => {
    expect(formatDatesForTreatmentPlanTable('2023-01-02', '2023-01-05')).toBe("02 Jan - 05 Jan '23")
    expect(formatDatesForTreatmentPlanTable('2023-01-02', '2023-01-05', true)).toBe(
      '2023-01-02 - 2023-01-05'
    )
  })

  it('formats file timestamps consistently', () => {
    expect(fileFormatDateTime('2023-03-15T12:34:00')).toBe('15-Mar-2023, 12:34 PM')
    expect(fileFormatDateTimeForTimeline('2023-03-15T12:34:00')).toBe('15-Mar-2023 12:34 PM')
  })
})

describe('ConstFunctions primitives', () => {
  it('parses and validates basic inputs', () => {
    expect(safeParseInt('10')).toBe(10)
    expect(safeParseInt('abc')).toBe(0)
    expect(isObjectEmpty({})).toBe(true)
    expect(isObjectEmpty({a: 1})).toBe(false)
    expect(getValueOrEmptyString(null)).toBe('-')
    expect(getValueOrEmptyString('value')).toBe('value')
    expect(secToHour('7200')).toBe(2)
  })

  it('capitalizes strings with fallbacks', () => {
    expect(capitalizeFirstLetter('hello')).toBe('Hello')
    expect(capitalizeFirstLetter('', false)).toBe('')
    expect(getFirstLetterCapitalOfWord('world')).toBe('World')
    expect(getFirstLetterCapitalOfWord(undefined as unknown as string)).toBe('')
  })

  it('handles value checks and lists', () => {
    expect(checkValueOrEmptyString(null)).toBeNull()
    expect(checkValueOrEmptyString('abc')).toBe('abc')
    expect(checkButtonStates('Loading...')).toBe(true)
    expect(checkButtonStates('Done')).toBe(false)
    expect(validateList([])).toBe(false)
    expect(validateList([1, 2])).toBe(true)
  })

  it('validates file sizes with optional storage caps', () => {
    const smallFile = {size: 2 * 1024 * 1024}
    expect(isFileSizeValid(smallFile, 5)).toBe(true)

    const largeFile = {size: 20 * 1024 * 1024}
    expect(isFileSizeValid(largeFile, 50, 1, 1024)).toBe(false)
  })

  it('generates deterministic alphanumeric strings when Math.random is mocked', () => {
    const spy = jest.spyOn(Math, 'random').mockReturnValue(0.1)
    expect(generateRandomAlphanumeric(4)).toBe('1111')
    spy.mockRestore()
  })
})

describe('ConstFunctions date formatting with controlled time', () => {
  const fixedNow = new Date('2023-01-02T12:00:00')

  beforeAll(() => {
    jest.useFakeTimers()
    jest.setSystemTime(fixedNow)
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  it('describes relative times for formatDateTime', () => {
    expect(formatDateTime('2023-01-02T11:59:30')).toBe('Just now')
    expect(formatDateTime('2023-01-02T11:55:00')).toBe('5 minutes ago')
    expect(formatDateTime('2023-01-02T09:00:00')).toBe('Today')
    expect(formatDateTime('2023-01-01T12:00:00')).toBe('Yesterday')
    expect(formatDateTime('2022-12-30T12:00:00')).toBe('3 days ago')
    expect(formatDateTime('2022-12-20T12:00:00')).toBe('20-Dec')
  })

  it('describes relative times for properDateTime', () => {
    expect(properDateTime('2023-01-02T11:59:30')).toBe('Just now')
    expect(properDateTime('2023-01-02T11:55:00')).toBe('5m')
    expect(properDateTime('2023-01-02T09:00:00')).toBe('3h')
    expect(properDateTime('2023-01-01T12:00:00')).toBe('Yesterday')
    expect(properDateTime('2022-12-31T12:00:00')).toBe('2 days')
    expect(properDateTime('2022-12-20T12:00:00')).toBe('20-Dec')
  })

  it('formats times and day differences', () => {
    expect(formatTime('2023-01-02T14:45:00')).toBe('02:45 PM')
    expect(diffInDays('2023-01-01', '2023-01-04')).toBe(3)
  })
})

describe('ConstFunctions validation helpers', () => {
  it('validates email addresses', () => {
    expect(isValidEmail('user@example.com')).toBe(true)
    expect(isValidEmail('bad-email')).toBe(false)
  })

  it('detects operating systems via user agent and platform', () => {
    setNavigator('Mozilla/5.0 (Windows NT 10.0)', 'Win32')
    expect(getOperatingSystemName()).toBe('Windows')

    setNavigator('Mozilla/5.0 (Macintosh; Intel Mac OS X)', 'MacIntel')
    expect(getOperatingSystemName()).toBe('MacOS')

    setNavigator('Linux', 'Linux x86_64')
    expect(getOperatingSystemName()).toBe('Linux')

    setNavigator('Custom UA', 'iPhone')
    expect(getOperatingSystemName()).toBe('iOS')

    setNavigator('Custom UA', 'Android')
    expect(getOperatingSystemName()).toBe('Android')
  })
})

describe('ConstFunctions additional helpers', () => {
  it('computes compliance, profile pictures, and extensions', () => {
    expect(getComplianceStyle('POOR')).toBe('text-red bg-redSupport')
    expect(getComplianceStyle('AVERAGE')).toBe('text-secondaryColor bg-secondarySupport')
    expect(getComplianceStyle('GOOD')).toBe('text-tertiaryColor bg-tertiarySupport')
    expect(getComplianceStyle('UNKNOWN')).toBeNull()

    expect(getProfilePictureUrl(true, 'https://example.com')).toBeDefined()
    expect(getProfilePictureUrl(false, '')).toBeDefined()

    expect(isAllowedFileExtension('file.pdf', ['pdf'])).toBe(true)
    expect(isAllowedFileExtension('file.doc', ['pdf'])).toBe(false)
  })

  it('pluralizes, formats dates, and finds aligners', () => {
    expect(formatPluralizedString(1, 'item')).toBe('1 item')
    expect(formatPluralizedString(3, 'item')).toBe('3 items')
    expect(formatPluralizedStringOnly(1, 'item')).toBe('item')
    expect(formatPluralizedStringOnly(0, 'item')).toBe('items')

    expect(formatDate('2023-03-01')).toBe('01-Mar-2023')
    expect(findAlignerObject([{sr_no: 2, avg_time_in_secs: 50}], 2)).toBe(50)
    expect(findAlignerObject([], 1)).toBe(0)
  })

  it('formats invite codes and jaw data', () => {
    expect(formattedInviteCode('ABCDEFGH')).toBe('ABCD - EFGH')
    expect(formattedInviteCodeWithoutSpace('ABCDEFGH')).toBe('ABCD-EFGH')

    const srJaw = extractSrNoAndJawType([
      {sr_no: 1, jaw_type: 'UPPER'},
      {sr_no: 2, jaw_type: 'LOWER'},
    ])
    expect(srJaw).toEqual([
      {sr_no: 1, jaw_type: 'UPPER'},
      {sr_no: 2, jaw_type: 'LOWER'},
    ])

    const ranges = createJawTypesArray([
      {sr_no: 1, jaw_type: 'UPPER'},
      {sr_no: 2, jaw_type: 'UPPER'},
      {sr_no: 3, jaw_type: 'LOWER'},
      {sr_no: 4, jaw_type: 'LOWER'},
    ])
    expect(ranges.upper).toContain('1-2')
    expect(ranges.lower).toContain('3-4')
  })

  it('formats dates for few months with fixed time', () => {
    const fixed = new Date('2023-05-10T12:00:00Z')
    jest.useFakeTimers()
    jest.setSystemTime(fixed)

    expect(formatDateForFewMonths('2023-05-10')).toBe('Today')
    expect(formatDateForFewMonths('2023-05-09')).toBe('Yesterday')
    expect(formatDateForFewMonths('2023-05-08')).toBe('Two days ago')
    expect(formatDateForFewMonths('2023-05-07')).toBe('Within the past week')
    expect(formatDateForFewMonths('2023-04-20')).toBe('Within the past month')
    expect(formatDateForFewMonths('2023-03-10')).toBe('March 10, 2023')

    jest.useRealTimers()
  })

  it('handles numeric and array helpers', () => {
    expect(sliceArray([1, 2, 3, 4], 3)).toEqual([1, 2])
    expect(sliceArray(null, 2)).toEqual([])

    expect(formatToTwoDecimalPlaces('3.456')).toBe(3.46)
    expect(formatToTwoDecimalPlaces(null)).toBeNull()

    expect(DateFormat('2023-07-01T00:00:00')).toBe('01-Jul-2023')
    expect(areObjectValuesEmpty({a: null, b: null})).toBe(false)
    expect(areObjectValuesEmpty({a: null, b: 1})).toBe(true)
  })

  it('handles aligner options and arranged strings', () => {
    expect(
      getTotalToothValue({upper_jaw: {range: [1, 5]}, lower_jaw: {range: [3, 4]}} as any)
    ).toBe(5)

    expect(
      arrayOfAligners({
        upper_jaw: {range: [1, 2], starts_with: 1, ends_with: 2},
        lower_jaw: {range: [2, 3], starts_with: 2, ends_with: 3},
      })
    ).toEqual([
      {label: '1 (Upper)', value: 1},
      {label: '2 (Upper & Lower)', value: 2},
      {label: '3 (Lower)', value: 3},
    ])

    expect(generateAlignerOptions(1, 2, 2, 3)).toEqual([
      {label: '1 Lower', value: 1},
      {label: '2 Upper & Lower', value: 2},
      {label: '3 Upper', value: 3},
    ])

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

  it('handles plans, roles, permissions and colors', () => {
    const order = {
      treatment_plan_responses: [{treatment_status: 'DRAFT'}, {treatment_status: 'ACTIVE', id: 1}],
    } as any
    expect(getActiveTreatmentPlan(order)).toEqual({treatment_status: 'ACTIVE', id: 1})
    expect(getActiveTreatmentPlan(null)).toBeNull()

    expect(getRole('PLANNING_QC')).toBe('Planning QC')
    expect(getRole('UNKNOWN')).toBe('UNKNOWN')

    const roleObj = {
      modules: [
        {
          sub_modules: [
            {name: 'A', permissions: ['read', 'edit']},
            {name: 'B', permissions: ['read']},
          ],
        },
      ],
    } as any
    expect(extractSubModulesWithPermissions(roleObj, false)).toEqual([
      {name: 'A', permissions: []},
      {name: 'B', permissions: []},
    ])
    expect(extractSubModulesWithPermissions(roleObj, true)).toEqual([
      {name: 'A', permissions: ['read', 'edit']},
      {name: 'B', permissions: ['read']},
    ])

    expect(getDefaultColor('IN_PROGRESS')).toBe('#3b82f6')
    expect(getDefaultColor('DONE')).toBe('#10b981')
    expect(getDefaultColor('CANCELLED')).toBe('#ef4444')
    expect(getDefaultColor('OTHER')).toBe('#6b7280')

    expect(formatResult('ONE_TWO')).toBe('One Two')
    expect(getSalutations('Dr')).toBe('Dr. ')
    expect(getWorkFlowName('planning-order')).toBe('Planning Order')
  })

  it('resolves image urls and drive links', () => {
    expect(getImageUrl({is_gdrive_platform: true, drive_file_id: 'abc', url: 'local'})).toContain(
      'patient/drive/image/abc'
    )
    expect(getImageUrl({is_gdrive_platform: false, url: 'local'})).toBe('local')

    const openSpy = jest.spyOn(window, 'open').mockImplementation(() => null as any)
    openDriveUrls('https://drive.google.com/file/d/123')
    expect(openSpy).toHaveBeenCalled()
    openSpy.mockRestore()
  })
})
