import {
  capitalizeFirstLetter,
  convertDateToRegular,
  convertYYYYMMDDTOddddDDMMMMYY,
} from './DateConversion'

describe('DateConversion utils', () => {
  it('converts date to readable weekday format', () => {
    const result = convertYYYYMMDDTOddddDDMMMMYY('2024-06-15')

    expect(result).toBe("Saturday, 15 June '24")
  })

  it('capitalizes and replaces underscores', () => {
    const result = capitalizeFirstLetter('pending_APPROVAL')

    expect(result).toBe('Pending approval')
  })

  it('converts date to regular format without weekday', () => {
    const result = convertDateToRegular('2024-06-15')

    expect(result).toBe(" 15 June '24")
  })
})
