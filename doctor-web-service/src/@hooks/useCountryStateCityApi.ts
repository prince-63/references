import {useEffect} from 'react'
import addressService from '../services/addressCityStateCountry/address.service'

export default ({
  clinicData,
  formik,
  dispatch,
  isNew,
}: {
  clinicData?: any
  formik: any
  dispatch: any
  isNew: boolean
}) => {
  useEffect(() => {
    if (!isNew) {
      const formDataToFill: any = {
        practiceLocationName: clinicData.practice_location_name,
        mobileNumber: clinicData.mobile_number,
        emailId: clinicData.email_id ?? '',
        pincode: clinicData.pin_code,
        country: clinicData.country,
        state: clinicData.state,
        city: clinicData.city,
        websiteUrl: clinicData.website_url ?? '',
        address: clinicData.address,
      }
      formik.resetForm({
        values: {...formDataToFill},
      })
      const fetchCountryStateCityData = async () => {
        await Promise.all([
          addressService.getCountryList(dispatch),
          addressService.getStateList(dispatch, clinicData.country),
          addressService.getCityList(dispatch, clinicData.country, clinicData.state),
        ])
      }

      fetchCountryStateCityData()
    } else {
      const callCountryListService = async () => {
        await addressService.getCountryList(dispatch)
      }
      callCountryListService()
    }
  }, [isNew])
}
