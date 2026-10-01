import {FC, useState} from 'react'
import {SVG_EYE_CLOSE, SVG_EYE_OPEN} from '../../../utils/SvgConstants'
import CommonSVG from '../SVG/CommonSVG'

interface props {
  classNameLabel?: string
  label?: string
  className?: string
  name: string
  formik?: any
  required?: boolean
}

const InputPassword: FC<props> = ({classNameLabel, label, className, formik, name, required}) => {
  const [showPassword, setShowPassword] = useState(true)
  const style = `w-full px-2 h-12 border rounded-lg border border-mediumGray font-family: Figtree ${className}`
  const labelStyle = `w-full font-medium text-textColor ${classNameLabel}`

  const togglePasswordVisibility = () => {
    setShowPassword((prevState) => !prevState)
  }

  return (
    <>
      <div className='relative'>
        <div className=''>
          <label className={labelStyle}>
            {label}
            {required ? <span className='text-red ml-1'>*</span> : ''}
          </label>
        </div>{' '}
        <input
          type={!showPassword ? 'text' : 'password'}
          id={name}
          name={name}
          className={style}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values[name]}
        />
        <button
          className='absolute right-3 top-[53px] transform -translate-y-1/2 focus:outline-none'
          type='button'
          onClick={togglePasswordVisibility}
        >
          <CommonSVG svg={showPassword ? SVG_EYE_CLOSE : SVG_EYE_OPEN} width='24px' height='24px' />
          {/* <img src={showPassword ? eyeClose:eyeOpen} alt={''} className='w-6 h-5' /> */}
        </button>
        <div className='text-xs text-red mt-1'>
          {formik.touched[name] && formik.errors[name] && (
            <div className='text-red'>{formik.errors[name]}</div>
          )}
        </div>
      </div>
    </>
  )
}

export default InputPassword
