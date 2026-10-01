import React from 'react'
import './InputStyle.css'
import dayjs from 'dayjs'
import {ConfigProvider, DatePicker, DatePickerProps} from 'antd'
import clsx from 'clsx'
interface FormikDatePickerProps extends DatePickerProps {
  name: string
  label?: string
  required?: boolean
  className?: string
  formik?: any
  dateValue?: string
  classNameLabel?: string
  onChange?: (date: dayjs.Dayjs, dateString: string | string[]) => void
  subLabel?: string
}

const InputDateFormik: React.FC<FormikDatePickerProps> = ({
  className,
  label,
  required,
  formik,
  dateValue,
  onChange,
  classNameLabel,
  subLabel,
  ...props
}) => {
  return (
    <ConfigProvider theme={{token: {fontFamily: 'figtree'}}}>
      <div className='w-full'>
        {label && (
          <label className={clsx('text-textColor ', classNameLabel)}>
            {label}
            {required && <span className='text-red ml-1'>*</span>}
          </label>
        )}
        {subLabel && (
          <p>
            <label className={clsx('text-textColor text-sm font-medium')}>{subLabel}</label>
          </p>
        )}
        <DatePicker
          {...props}
          id={props.name}
          getPopupContainer={(trigger) => trigger.parentElement as HTMLElement}
          className={clsx(
            'w-full  border rounded-md',
            className,
            props.disabled && 'text-grayDisabled'
          )}
          disabled={props.disabled}
          inputReadOnly
          onChange={onChange}
          value={dateValue ? dayjs(dateValue) : null}
        />
        <div className='text-xs text-red mt-1'>
          {formik?.touched[props.name] && formik?.errors[props.name] && (
            <div className='text-red'>{formik?.errors[props.name]}</div>
          )}
        </div>
        {/* <ErrorMessage name={props.name} component='div' className='text-xs text-red mt-1' /> */}
      </div>
    </ConfigProvider>
  )
}

export default InputDateFormik
