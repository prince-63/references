import React, {FC} from 'react'
interface props {
  classNameLabel?: string
  label?: string
  className?: string
  name: string
  formik?: any
  required?: boolean
  isDisabled?: boolean
  placeHolder?: string
  maxLength?: number
}
const InputEmail: FC<props> = ({
  className,
  classNameLabel,
  label,
  name,
  formik,
  required,
  isDisabled,
  placeHolder,
  maxLength,
}) => {
  const style = `w-full px-2 h-12 border rounded ${className}`
  // const labelStyle = `w-full text-bold ${classNameLabel}`

  const labelStyle = `w-full font-base text-textColor ${classNameLabel}`

  return (
    <div>
      <div className=''>
        <label className={labelStyle}>
          {label}
          {required ? <span className='text-red ml-1'>*</span> : ''}
        </label>
      </div>
      <input
        type='email'
        id={name}
        name={name}
        className={style}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        value={formik.values[name]?.toLowerCase()}
        disabled={isDisabled}
        placeholder={placeHolder}
        maxLength={maxLength}
      />
      <div className='text-xs text-red mt-1'>
        {formik.touched[name] && formik.errors[name] && (
          <div className='text-red'>{formik.errors[name]}</div>
        )}
      </div>
    </div>
  )
}

export default InputEmail
