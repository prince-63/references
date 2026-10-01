import {postApiDataCitySlice} from '../../redux/Slices/AppSlice/Location/CitySlice'
import {postApiDataCountrySlice} from '../../redux/Slices/AppSlice/Location/CountrySlice'
import {postApiDataStateSlice} from '../../redux/Slices/AppSlice/Location/StateSlice'
import {postApiDataCountryCodes} from '../../redux/Slices/AuthSlice/countryCodesSlice'
import {ApiGetData} from '../../utils/ConstFunctions'
interface countryCode {
  name: 'string'
  iso2: 'string'
  phone_code: 'string'
}
const getCountryList = async (dispatch: any) => {
  return dispatch(postApiDataCountrySlice() as any)
    .unwrap()
    .then((res: []) => {
      const list: any = []
      res &&
        res?.forEach((element) => {
          list.push({label: element, value: element})
        })
      return list
    })
    .catch((error: any) => {
      console.error('Error : ', error)
    })
}

const getStateList = async (dispatch: any, country: string) => {
  const postData: ApiGetData = {
    data: {
      country: country,
    },
  }
  return dispatch(postApiDataStateSlice(postData) as any)
    .unwrap()
    .then((res: []) => {
      const list: any = []
      res.forEach((element) => {
        list.push({label: element, value: element})
      })
      return list
    })
    .catch((error: any) => {
      console.error('Error : ', error)
    })
}

const getCityList = async (dispatch: any, country: string, state: string) => {
  const postData: ApiGetData = {
    data: {
      country: country,
      state: state,
    },
  }
  return dispatch(postApiDataCitySlice(postData) as any)
    .unwrap()
    .then((res: []) => {
      const list: any = []
      res.forEach((element) => {
        list.push({label: element, value: element})
      })
      return list
    })
    .catch((error: any) => {
      console.error('Error : ', error)
    })
}

const getCountryCodeList = async (dispatch: any) => {
  return dispatch(postApiDataCountryCodes() as any)
    .unwrap()
    .then((res: []) => {
      const list: any = []
      res.forEach((element: countryCode) => {
        list.push({label: element.phone_code, value: element.phone_code})
      })
      return list
    })
    .catch((error: any) => {
      console.error('Error : ', error)
    })
}

export default {
  getCityList,
  getCountryList,
  getStateList,
  getCountryCodeList,
}
