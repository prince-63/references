import cn from '@utils/cn'
import When from 'components/when/When'
import React, {FC} from 'react'
import hasValue from 'utils/hasValue'

interface Props {
  ref?: any
  type?: string
  classNameLabel?: string
  label?: string
  className?: string
  name: string
  formik: any
  required?: boolean
  placeholder?: string
  maxLength?: number
  unit?: string
  prefix?: string
  suffix?: string // Add the suffix prop
  disabled?: boolean
  onChange?: (e: any) => void
  labelColor?: string
  disablePrefix?: boolean
  classNamePrefix?: string
  subLabel?: string
}

const InputText: FC<Props> = ({
  ref,
  type,
  className,
  classNameLabel,
  label,
  name,
  formik,
  required,
  placeholder,
  maxLength,
  unit,
  prefix,
  suffix, // Destructure the suffix prop
  disabled = false,
  onChange = formik.handleChange,
  labelColor = '#666666',
  disablePrefix,
  classNamePrefix,
  subLabel,
}) => {
  const style = `w-full px-2 h-12 border rounded focus:outline-none ${className} ${
    disabled ? ' bg-transparent cursor-not-allowed' : ''
  }`
  const labelStyle = `w-full text-bold ${classNameLabel}`

  return (
    <div>
      <div className=''>
        <label className={labelStyle} style={{color: labelColor}}>
          {label}
          {required ? <span className='text-red ml-1'>*</span> : ''}
        </label>
        {subLabel && (
          <p>
            <label className={cn('text-textColor text-sm font-medium')}>{subLabel}</label>
          </p>
        )}
      </div>
      <div
        className={`flex items-center rounded overflow-hidden ${
          disabled ? 'cursor-not-allowed' : ''
        } ${hasValue(prefix) ? 'border border-mediumGray' : ''}`}
      >
        {prefix && (
          <span
            className={`flex px-2 items-center justify-center whitespace-nowrap ${classNamePrefix} ${
              disablePrefix ? 'text-grayDisabled' : 'text-black'
            }`}
          >
            {prefix}
          </span>
        )}
        <div className='relative w-full'>
          <input
            ref={ref}
            type={type === 'number' ? 'number' : 'text'}
            id={name}
            name={name}
            className={style}
            onChange={onChange}
            onBlur={formik.handleBlur}
            onWheel={() => {
              if (document.activeElement instanceof HTMLElement) {
                document.activeElement.blur()
              }
            }}
            value={formik.values[name]}
            placeholder={placeholder}
            maxLength={maxLength}
            disabled={disabled}
          />
          <When isTrue={hasValue(unit)}>
            <label className='absolute right-2 top-1/2 translate-y-[-50%] pointer-events-none text-textColor font-normal text-sm'>
              {unit}
            </label>
          </When>
          {suffix && (
            <span
              className={`absolute right-8 top-1/2 translate-y-[-50%] pointer-events-none ${
                disabled ? 'text-grayDisabled' : 'text-black'
              }`}
            >
              {suffix}
            </span>
          )}
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

export default InputText
