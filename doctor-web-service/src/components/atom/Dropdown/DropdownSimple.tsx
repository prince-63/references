import {FC} from 'react'
import addressService from '../../../services/addressCityStateCountry/address.service'
import {useSelector} from 'react-redux'
import {RootState} from '../../../redux/store'
import hasValue from '../../../utils/hasValue'
import {ConfigProvider, Select, SelectProps} from 'antd'
import cn from '@utils/cn'
import getColorPalette from 'utils/getColorPalette'
import clsx from 'clsx'

interface props extends SelectProps {
  classNameLabel?: string
  label?: string
  className?: string
  name: string
  formik?: any
  required?: boolean
  placeholder?: string
  value?: any
  dispatch: any
  disabled?: boolean
}

const DropdownSimple: FC<props> = ({
  classNameLabel,
  className,
  label,
  name,
  formik,
  required,
  placeholder,
  value,
  dispatch,
  disabled,
}) => {
  const {data: dataState, loading: loadingStates} = useSelector(
    (state: RootState) => state.apiState
  )
  const {data: dataCity, loading: loadingCities} = useSelector((state: RootState) => state.apiCity)
  const {data: dataCountry, loading: loadingCountries} = useSelector(
    (state: RootState) => state.apiCountry
  )
  const stateList: any = dataState
  const cityList: any = dataCity
  const countryList: any = dataCountry
  const normalizedName = name.startsWith('billing_') ? name.replace('billing_', '') : name

  const getDependentFieldName = (field: 'country' | 'state' | 'city') =>
    name.startsWith('billing_') ? `billing_${field}` : field

  const getOptions = () => {
    switch (normalizedName) {
      case 'country':
        return countryList ? countryList : []
      case 'state':
        return stateList ? stateList : []
      case 'city':
        return cityList ? cityList : []
      default:
        return []
    }
  }

  const callSetOption = async (selectedOption: any) => {
    formik.setFieldValue(name, selectedOption)

    if (normalizedName === 'country') {
      await addressService.getStateList(dispatch, selectedOption)
      formik.setFieldValue(getDependentFieldName('state'), '', false)
      formik.setFieldValue(getDependentFieldName('city'), '', false)
    } else if (normalizedName === 'state') {
      await addressService.getCityList(
        dispatch,
        formik.getFieldProps(getDependentFieldName('country')).value,
        selectedOption
      )
      formik.setFieldValue(getDependentFieldName('city'), '', false)
    }
  }
  const isLoading = loadingStates || loadingCities || loadingCountries

  return (
    <ConfigProvider
      theme={{
        token: {
          fontFamily: 'figtree',
          colorPrimary: getColorPalette().primaryColor,
          colorBorderSecondary: getColorPalette().mediumGray,
        },
      }}
    >
      {label && (
        <label
          htmlFor={name}
          className={clsx('text-base font-medium text-textColor mb-1', classNameLabel)}
        >
          {label}
          {required && <span className='text-red ml-1'>*</span>}
        </label>
      )}
      <Select
        id={name}
        className={cn('w-full h-12 rounded-md', className)}
        options={getOptions()}
        onChange={(selectedOption) => callSetOption(selectedOption)}
        onBlur={formik.handleBlur}
        value={getOptions()?.find((option: any) => option === value) ?? value}
        placeholder={placeholder}
        loading={isLoading}
        showSearch
        disabled={
          isLoading ||
          disabled ||
          (normalizedName === 'state'
            ? !hasValue(formik.getFieldProps(getDependentFieldName('country')).value)
            : normalizedName === 'city'
              ? !hasValue(formik.getFieldProps(getDependentFieldName('state')).value)
              : false)
        }
        allowClear
      />
      <div className='text-xs text-red '>
        {formik.touched[name] && formik.errors[name] && (
          <div className='text-red'>{formik.errors[name]}</div>
        )}
      </div>
    </ConfigProvider>
  )
}

export default DropdownSimple
