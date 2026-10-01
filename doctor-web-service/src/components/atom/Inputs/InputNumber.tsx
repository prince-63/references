import When from 'components/when/When'
import {FC} from 'react'
import hasValue from 'utils/hasValue'
interface props {
  classNameLabel?: string
  label?: string
  className?: string
  name: string
  formik?: any
  required?: boolean
  maxlength?: number
  unit?: string
  isDisabled?: boolean
  placeholder?: string
}

const InputNumber: FC<props> = ({
  className,
  classNameLabel,
  label,
  name,
  formik,
  required,
  maxlength,
  isDisabled,
  unit,
  placeholder,
}) => {
  const style = ` w-full px-2 h-12 border focus:outline-none rounded border-0.50-#D9D9D9 font-family: Figtree ${className} `
  const labelStyle = `w-full text-bold ${classNameLabel}`

  const handleMobileNumberChange = (e: any) => {
    formik.setFieldValue(name, e.target.value)
    const inputValue = e.target.value
    const sanitizedValue = inputValue.replace(/[^0-9()+-]/g, '') // Restrict characters to numbers, parentheses, plus sign, and hyphen
    formik.setFieldValue(name, sanitizedValue)
  }

  return (
    <div>
      <div className=''>
        <label className={labelStyle} style={{color: '#666666'}}>
          {label}
          {required ? <span className='text-red ml-1'>*</span> : ''}
        </label>
      </div>{' '}
      <div className='relative w-full'>
        <input
          min={0}
          type='text'
          id={name}
          name={name}
          className={style}
          onChange={handleMobileNumberChange}
          onBlur={formik.handleBlur}
          value={formik.values[name]}
          maxLength={maxlength}
          disabled={isDisabled}
          placeholder={placeholder}
        />
        <When isTrue={hasValue(unit)}>
          <label className='absolute right-2 top-1/2 translate-y-[-50%] pointer-events-none text-textColor font-normal text-sm'>
            {unit}
          </label>
        </When>
      </div>
      <div className='text-xs text-red mt-1'>
        {formik.touched[name] && formik.errors[name] && (
          <div className='text-red'>{formik.errors[name]}</div>
        )}
      </div>
    </div>
  )
}

export default InputNumber
