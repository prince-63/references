import {getCurrentAligner} from './getCurrentAligner'
import {getDueMessageStyle, getDueMessageText} from './getDueMessageText'
import {getStorageType} from './storage'
import hasValue from './hasValue'

describe('hasValue', () => {
  it('returns false for nullish or empty values', () => {
    expect(hasValue(null)).toBe(false)
    expect(hasValue(undefined)).toBe(false)
    expect(hasValue('')).toBe(false)
    expect(hasValue([])).toBe(false)
    expect(hasValue({})).toBe(false)
  })

  it('returns true for non-empty values', () => {
    expect(hasValue('text')).toBe(true)
    expect(hasValue([1, 2])).toBe(true)
    expect(hasValue({a: 1})).toBe(true)
  })
})

describe('getCurrentAligner', () => {
  it('returns aligner matching the current number', () => {
    const journey = {
      current_aligner_no: 2,
      aligners: [
        {sr_no: 1, name: 'A'},
        {sr_no: 2, name: 'B'},
      ],
    } as any

    expect(getCurrentAligner(journey)).toEqual({sr_no: 2, name: 'B'})
  })

  it('returns undefined when no aligner matches', () => {
    const journey = {
      current_aligner_no: 3,
      aligners: [
        {sr_no: 1, name: 'A'},
        {sr_no: 2, name: 'B'},
      ],
    } as any

    expect(getCurrentAligner(journey)).toBeUndefined()
  })
})

describe('getDueMessageText', () => {
  const fixedDate = new Date('2023-01-10T00:00:00.000Z')

  beforeAll(() => {
    jest.useFakeTimers()
    jest.setSystemTime(fixedDate)
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  it('returns change messages when aligner is changed', () => {
    expect(
      getDueMessageText({
        currentAligner: true,
        is_aligner_changed: true,
        is_aligner_change_approved: true,
      })
    ).toBe('Completed')

    expect(
      getDueMessageText({
        currentAligner: true,
        is_aligner_changed: true,
        is_aligner_change_approved: false,
      })
    ).toBe('Changed')
  })

  it('computes due text from offset days', () => {
    expect(getDueMessageText({offSetDays: 3})).toBe('Due in 3 days')
    expect(getDueMessageText({offSetDays: 1})).toBe('Due tomorrow')
    expect(getDueMessageText({offSetDays: 0})).toBe('Due today')
    expect(getDueMessageText({offSetDays: -1})).toBe('Due yesterday')
    expect(getDueMessageText({offSetDays: -3})).toBe('Overdue by 3 days')
  })

  it('computes due text from date when offset is missing', () => {
    expect(
      getDueMessageText({
        date: '2023-01-13',
      })
    ).toBe('Due in 3 days')
  })

  it('skips message when skipForThreeDays applies', () => {
    expect(getDueMessageText({offSetDays: 4, skipForThreeDays: true})).toBeNull()
  })
})

describe('getDueMessageStyle', () => {
  it('returns aligner change styles', () => {
    expect(
      getDueMessageStyle({
        is_aligner_changed: true,
        is_aligner_change_approved: true,
      })
    ).toEqual({
      className: 'bg-tertiarySupport text-tertiaryColor',
      iconClassName: 'bg-tertiaryColor',
    })

    expect(
      getDueMessageStyle({
        is_aligner_changed: true,
        is_aligner_change_approved: false,
      })
    ).toEqual({
      className: 'bg-primarySupport text-primaryColor',
      iconClassName: 'bg-primaryColor',
    })
  })

  it('returns neutral styles when offset is missing', () => {
    expect(getDueMessageStyle({})).toEqual({className: '', iconClassName: ''})
  })

  it('returns styles for positive and negative offsets', () => {
    expect(getDueMessageStyle({offSetDays: 2})).toEqual({
      className: 'bg-orangeSupport text-orange',
      iconClassName: 'bg-orange',
    })

    expect(getDueMessageStyle({offSetDays: -1})).toEqual({
      className: 'bg-redSupport text-red',
      iconClassName: 'bg-red',
    })
  })
})

describe('getStorageType', () => {
  it('returns localStorage from window', () => {
    const storage = getStorageType()
    expect(storage).toBe(window.localStorage)
  })
})
