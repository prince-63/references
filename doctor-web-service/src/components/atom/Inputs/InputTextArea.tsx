import {FC} from 'react'

interface Props {
  classNameLabel?: string
  label?: string
  className?: string
  name: string
  formik: any
  required?: boolean
  placeholder?: string
  maxLength?: number
  minLength?: number
  maxWords?: number
  rows?: number
  showError?: boolean
}

const InputTextArea: FC<Props> = ({
  className = 'h-20',
  classNameLabel = 'w-full text-textColor ',
  label,
  name,
  formik,
  required,
  placeholder,
  maxLength,
  minLength,
  maxWords,
  rows,
  showError = true,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    const wordCount = value.trim().split(/\s+/).length

    if (!maxWords || wordCount <= maxWords) {
      formik.handleChange(e)
    }
  }

  const style = `w-full px-2 border rounded mt-1 focus:outline-none ${className}`
  const labelStyle = ` ${classNameLabel}`
  return (
    <div>
      <div className=''>
        <label className={labelStyle}>
          {label}
          {required ? <span className='text-red ml-1'>*</span> : ''}
        </label>
      </div>
      <textarea
        id={name}
        name={name}
        className={style}
        onChange={handleChange}
        onBlur={formik.handleBlur}
        value={formik.values[name]}
        placeholder={placeholder}
        maxLength={maxLength}
        minLength={minLength}
        rows={rows}
      />
      <div className='text-xs text-red mt-1'>
        {showError && formik.touched[name] && formik.errors[name] && (
          <div className='text-red'>{formik.errors[name]}</div>
        )}
      </div>
    </div>
  )
}

export default InputTextArea
