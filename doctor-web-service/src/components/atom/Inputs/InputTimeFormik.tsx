import React, {FC} from 'react'
import './InputStyle.css'
import {FormikProps} from 'formik'
import ClockTime from 'assets/icons/ClockTime'
interface props {
  classNameLabel?: string
  label?: string
  className?: string
  name: string
  formik?: FormikProps<any>
  required?: boolean
  defaultValue?: string
  setData?: any
  minDate?: any
  disable?: boolean
  maxDate?: any
  onChange?: (e: any) => void
}

const InputTimeFormik: FC<props> = ({
  className = 'border-mediumGray',
  classNameLabel,
  label,
  name,
  formik,
  required,
  defaultValue,
  minDate,
  disable,
  maxDate,
  onChange = formik?.handleChange,
}) => {
  const style = `custom-date-input w-full px-2 h-12 rounded-lg border  z-4 ${className}`
  const labelStyle = `w-full text-bold ${classNameLabel}`

  function openDatePicker() {
    const dateInput = document.getElementById('dateInput')
    if (dateInput) {
      dateInput.click()
    }
  }

  return (
    <div>
      <div className=''>
        <label className={labelStyle} style={{color: '#666666'}}>
          {label}
          {required ? <span className='text-red ml-1'>*</span> : ''}
        </label>
      </div>{' '}
      <div className='input-container relative'>
        <input
          type='time'
          id={name}
          name={name}
          className={style}
          onChange={onChange}
          onBlur={formik?.handleBlur}
          value={formik?.values[name]}
          defaultValue={defaultValue}
          min={minDate}
          max={maxDate}
          disabled={disable}
        />
        {formik?.values[name] === '' && (
          <label htmlFor={name} className='absolute top-[13px] left-3 text-textColor bg-white'>
            hh:mm aa
          </label>
        )}
        <div
          onClick={() => openDatePicker()}
          className='w-6 h-6 absolute top-1/2 right-2 transform -translate-y-1/2 cursor-pointer'
        >
          <ClockTime width='24' height='24' />
        </div>
      </div>
      <div className='text-xs text-red mt-1'>
        {formik?.touched[name] && formik?.errors[name] && (
          <div className='text-red'>{String(formik?.errors[name])}</div>
        )}
      </div>
    </div>
  )
}

export default InputTimeFormik
