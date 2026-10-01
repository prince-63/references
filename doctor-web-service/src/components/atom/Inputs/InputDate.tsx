import React, {FC} from 'react'
import './InputStyle.css'
import CommonSVG from '../SVG/CommonSVG'
import {SVG_CALENDER} from '../../../utils/SvgConstants'
interface props {
  classNameLabel?: string
  label?: string
  className?: string
  name: string
  formik?: any
  required?: boolean
  defaultValue?: string
  setData?: any
  minDate?: any
  maxDate?: any
  disable?: boolean
}

const InputDate: FC<props> = ({
  className,
  classNameLabel,
  label,
  name,
  formik,
  required,
  defaultValue,
  setData,
  minDate,
  disable,
  maxDate,
}) => {
  const style = `custom-date-input w-full px-2 h-12 rounded-lg border border-mediumGray z-4 ${className}`
  const labelStyle = `w-full text-bold ${classNameLabel}`

  function openDatePicker() {
    if (disable) {
      const dateInput = document.getElementById('dateInput')
      if (dateInput) {
        dateInput.click()
      }
    }
  }

  const handleChange1 = (value: any) => {
    // formik.handleChange();
    setData(value.target.value)
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
          type='date'
          id={name}
          name={name}
          className={style}
          onChange={(value) => handleChange1(value)}
          onBlur={formik.handleBlur}
          value={formik.values[name]}
          defaultValue={defaultValue}
          min={minDate}
          max={maxDate}
          disabled={disable}
        />
        <div
          onClick={() => openDatePicker()}
          className='w-6 h-6 absolute top-1/2 right-2 transform -translate-y-1/2 cursor-pointer'
        >
          <CommonSVG svg={SVG_CALENDER} width='24' height='24' />
        </div>
      </div>
      <div className='text-xs text-red mt-1'>
        {formik.touched[name] && formik.errors[name] && (
          <div className='text-red'>{formik.errors[name]}</div>
        )}
      </div>
    </div>
  )
}

export default InputDate
