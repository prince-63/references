import 'react-phone-input-2/lib/style.css'
import PhoneInput from 'react-phone-input-2'
import {FC, useEffect, useState} from 'react'

interface props {
  classNameLabel?: string
  label?: string
  className?: string
  name: string
  formik?: any
  isDisable?: boolean
  required?: boolean
  countryCode: any
  setCountryCode: (countryCode: string) => void
  value: string
}

const InputMobile: FC<props> = ({
  classNameLabel,
  label,
  name,
  formik,
  setCountryCode,
  isDisable,
  required,
  countryCode,
  value,
}) => {
  const style = {
    width: '100%',
    height: '48px',
    border: '1px solid #D9D9D9',
    borderRadius: '4px',
    fontFamily: 'Figtree',
    fontSize: '16px',
    background: !isDisable ? 'none' : '#F5F5F5',
    color: !isDisable ? 'black' : '#BDBDBD',
  }
  const labelStyle = `w-full text-bold ${classNameLabel}`

  const [phoneNumberValue, setPhoneNumberValue] = useState<string>(countryCode + value)
  const handleMobileNumberChange = (inputValue: string) => {
    const sanitizedValue = inputValue.replace(/[^0-9()+-]/g, '')
    formik.setFieldValue(name, sanitizedValue)
  }

  const handleChangeCountry = (value: any) => {
    setCountryCode(value)
  }

  useEffect(() => {
    setPhoneNumberValue(countryCode + value)
  }, [value, countryCode])

  return (
    <div>
      <div className=''>
        <label className={labelStyle} style={{color: '#666666'}}>
          {label}
          {required ? <span className='text-red ml-1'>*</span> : ''}
        </label>
      </div>
      <div>
        <PhoneInput
          value={phoneNumberValue}
          onChange={(phoneNumber: string, country: any) => {
            const code = '+' + country.dialCode
            const extractedPhoneNumber = phoneNumber.replace(country.dialCode, '')
            setPhoneNumberValue(phoneNumber)
            handleChangeCountry(code)
            handleMobileNumberChange(extractedPhoneNumber)
          }}
          disabled={isDisable}
          inputStyle={style}
          enableSearch={true}
          placeholder=' '
        />
      </div>
      <div className='text-xs text-red mt-1'>
        {formik.touched[name] && formik.errors[name] && (
          <div className='text-red'>{formik.errors[name]}</div>
        )}
      </div>
    </div>
  )
}

export default InputMobile
