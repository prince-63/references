jest.mock('../../redux/Slices/AppSlice/Location/CountrySlice', () => ({
  postApiDataCountrySlice: jest.fn(() => 'COUNTRY_ACTION'),
}))
jest.mock('../../redux/Slices/AppSlice/Location/StateSlice', () => ({
  postApiDataStateSlice: jest.fn((payload) => ({type: 'STATE', payload})),
}))
jest.mock('../../redux/Slices/AppSlice/Location/CitySlice', () => ({
  postApiDataCitySlice: jest.fn((payload) => ({type: 'CITY', payload})),
}))
jest.mock('../../redux/Slices/AuthSlice/countryCodesSlice', () => ({
  postApiDataCountryCodes: jest.fn(() => 'CODES_ACTION'),
}))

import service from './address.service'
import {postApiDataCountrySlice} from '../../redux/Slices/AppSlice/Location/CountrySlice'
import {postApiDataStateSlice} from '../../redux/Slices/AppSlice/Location/StateSlice'
import {postApiDataCitySlice} from '../../redux/Slices/AppSlice/Location/CitySlice'
import {postApiDataCountryCodes} from '../../redux/Slices/AuthSlice/countryCodesSlice'

describe('address.service helpers', () => {
  const makeDispatch = (result: any) => {
    const unwrap = jest.fn().mockResolvedValue(result)
    return Object.assign(jest.fn().mockReturnValue({unwrap}), {unwrap})
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('maps country list into label/value pairs', async () => {
    const dispatch = makeDispatch(['US', 'CA'])

    const list = await service.getCountryList(dispatch)

    expect(postApiDataCountrySlice).toHaveBeenCalled()
    expect(dispatch).toHaveBeenCalledWith(postApiDataCountrySlice())
    expect(list).toEqual([
      {label: 'US', value: 'US'},
      {label: 'CA', value: 'CA'},
    ])
  })

  it('maps state list with provided country', async () => {
    const dispatch = makeDispatch(['TX', 'WA'])

    const list = await service.getStateList(dispatch, 'US')

    expect(postApiDataStateSlice).toHaveBeenCalledWith({data: {country: 'US'}})
    expect(list).toEqual([
      {label: 'TX', value: 'TX'},
      {label: 'WA', value: 'WA'},
    ])
  })

  it('maps city list with provided country and state', async () => {
    const dispatch = makeDispatch(['Austin', 'Seattle'])

    const list = await service.getCityList(dispatch, 'US', 'TX')

    expect(postApiDataCitySlice).toHaveBeenCalledWith({data: {country: 'US', state: 'TX'}})
    expect(list).toEqual([
      {label: 'Austin', value: 'Austin'},
      {label: 'Seattle', value: 'Seattle'},
    ])
  })

  it('maps country codes to label/value phone codes', async () => {
    const dispatch = makeDispatch([{phone_code: '+1'}, {phone_code: '+91'}])

    const list = await service.getCountryCodeList(dispatch)

    expect(postApiDataCountryCodes).toHaveBeenCalled()
    expect(list).toEqual([
      {label: '+1', value: '+1'},
      {label: '+91', value: '+91'},
    ])
  })

  it('logs errors when dispatch unwrap rejects', async () => {
    const dispatch = jest
      .fn()
      .mockReturnValue({unwrap: jest.fn().mockRejectedValue(new Error('boom'))})
    const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

    await service.getCountryList(dispatch)

    expect(errSpy).toHaveBeenCalled()
    errSpy.mockRestore()
  })
})
