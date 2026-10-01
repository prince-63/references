import {Country} from 'country-state-city'
import {Dispatch} from '@reduxjs/toolkit'
import FormikInput from 'components/atom/Inputs/FormikInput'
import InputGoogleSearch from 'components/atom/Inputs/InputGoogleSearch'
import DropdownSimple from 'components/atom/Dropdown/DropdownSimple'
import LabelTitle from 'components/atom/Labels/LabelTitle'
import {URL_GET_GOOGLE_MAPS_DATA} from 'redux/Endpoints/apiEndpoints'

type ShippingAddressFieldsProps = {
  formik: {
    setFieldValue: (field: string, value: any) => void
    getFieldProps: (field: string) => {value: any}
  }
  dispatch: Dispatch
}

const ShippingAddressFields = ({formik, dispatch}: ShippingAddressFieldsProps) => {
  const getDetails = async (value: any) => {
    const placeId = value?.value?.place_id
    if (!placeId) return

    try {
      const response = await fetch(URL_GET_GOOGLE_MAPS_DATA(placeId))
      if (!response.ok) throw new Error('Failed to fetch Google Maps data')

      const data = await response.json()
      const placeDetails = data.result
      const addressList = placeDetails?.address_components || []

      formik.setFieldValue('address_line', placeDetails?.formatted_address || '')
      formik.setFieldValue('name', placeDetails?.name || '')

      addressList.forEach((address: any) => {
        const addressTypes: string[] = address.types

        if (addressTypes.includes('country')) {
          const countryName = Country.getAllCountries().find(
            (country) => country.name.toLowerCase() === address.long_name.toLowerCase()
          )?.name

          if (countryName) formik.setFieldValue('country', countryName)
        }

        if (addressTypes.includes('administrative_area_level_1')) {
          formik.setFieldValue('state', address.long_name)
        }

        if (addressTypes.includes('locality')) {
          formik.setFieldValue('city', address.long_name)
        }

        if (addressTypes.includes('postal_code')) {
          formik.setFieldValue('pincode', address.long_name)
        }
      })
    } catch (error) {
      console.error('Google Maps API error:', error)
    }
  }

  return (
    <div className='flex flex-col gap-4'>
      <FormikInput name={'addressed_to'} label={'Addressed to'} />

      <div className='flex flex-col gap-3'>
        <div>
          <LabelTitle
            title='Address'
            required={false}
            className='text-base text-textColor font-medium'
          />
        </div>
        <InputGoogleSearch handleInputChange={getDetails} />
      </div>

      <FormikInput
        name={'name'}
        label={'Name'}
        maxLength={2000}
        value={formik.getFieldProps('name').value}
      />

      <div className='flex gap-3'>
        <div className='flex-1'>
          <FormikInput name={'address_line'} label={'Address'} maxLength={2000} />
        </div>
        <div className='flex-1'>
          <FormikInput
            name='mobile_number'
            label='Mobile Number'
            maxLength={15}
            placeholder=''
            value={formik.getFieldProps('mobile_number').value}
          />
        </div>
      </div>

      <div className='flex gap-2'>
        <div className='w-full mt-2'>
          <DropdownSimple
            name='country'
            className=''
            label='Country'
            classNameLabel='text-sm text-textColor font-medium'
            formik={formik}
            required={false}
            placeholder='Select a Country'
            value={formik.getFieldProps('country').value}
            dispatch={dispatch}
            allowClear={true}
          />
        </div>

        <div className='w-full mt-2'>
          <DropdownSimple
            name='state'
            className=''
            label='State'
            classNameLabel='text-sm text-textColor font-medium'
            formik={formik}
            required={false}
            placeholder='Select a State'
            value={formik.getFieldProps('state').value}
            dispatch={dispatch}
          />
        </div>
      </div>

      <div className='flex gap-2'>
        <div className='w-full mt-2'>
          <DropdownSimple
            name='city'
            className=''
            label='City'
            classNameLabel='text-sm text-textColor font-medium'
            formik={formik}
            required={false}
            placeholder='Select a City'
            value={formik.getFieldProps('city').value}
            dispatch={dispatch}
          />
        </div>

        <div className='w-full mt-2'>
          <FormikInput
            name='pincode'
            label='Pincode'
            className='py-3'
            value={formik.getFieldProps('pincode').value}
          />
        </div>
      </div>
    </div>
  )
}

export default ShippingAddressFields
