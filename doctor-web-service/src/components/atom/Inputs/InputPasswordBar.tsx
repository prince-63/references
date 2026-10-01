import {FC, useState, useEffect} from 'react'
import {SVG_EYE_CLOSE, SVG_EYE_OPEN} from '../../../utils/SvgConstants'
import CommonSVG from '../SVG/CommonSVG'

interface props {
  classNameLabel?: string
  label?: string
  className?: string
  name: string
  formik?: any
  required?: boolean
  placeHolder?: string
  isDisplaySubtext: boolean
}
const InputPasswordBar: FC<props> = ({
  className,
  classNameLabel,
  label,
  required,
  name,
  formik,
  isDisplaySubtext,
  placeHolder,
}) => {
  const [showPassword, setShowPassword] = useState(true)
  const [passwordScore, setPasswordScore] = useState(0) // You need to set the actual password score

  const style = `w-full px-2 h-12 border rounded border-0.50-#D9D9D9 font-family: Figtree ${className}`
  const labelStyle = `w-full text-bold ${classNameLabel}`

  const togglePasswordVisibility = () => {
    setShowPassword((prevState) => !prevState)
  }

  useEffect(() => {
    const value = formik.values[name] != undefined ? formik.values[name] : ''
    const score = calculatePasswordScore(value)
    setPasswordScore(score)
  }, [formik.values[name]])

  const calculatePasswordScore = (password: string) => {
    let score = 0
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) {
      score += 1
    }
    if (/\d/.test(password)) {
      score += 1
    }
    if (/[^\w\s]/.test(password)) {
      score += 1
    }
    return score
  }

  return (
    <>
      <div className='relative'>
        <div className=''>
          <label className={labelStyle} style={{color: '#666666'}}>
            {label}
            {required ? <span className='text-red ml-1'>*</span> : ''}
          </label>
        </div>
        <input
          type={showPassword ? 'password' : 'text'}
          id={name}
          name={name}
          className={style}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values[name]}
          placeholder={placeHolder}
        />
        <button
          className='absolute right-3 top-[54px] transform -translate-y-1/2 focus:outline-none'
          type='button'
          onClick={togglePasswordVisibility}
        >
          <CommonSVG svg={showPassword ? SVG_EYE_CLOSE : SVG_EYE_OPEN} width='24px' height='24px' />
        </button>
      </div>
      {isDisplaySubtext ? (
        <div className='flex -mx-1 mt-2'>
          {[...Array(3)].map((_, i) => (
            <div className='w-1/3 px-1' key={i}>
              <div
                className={`rounded-xl transition-colors h-1 ${
                  i < passwordScore ? 'bg-primaryColor' : 'bg-mediumGray'
                }`}
              ></div>
            </div>
          ))}
        </div>
      ) : null}
      {formik.touched[name] && formik.errors[name] && (
        <div className='text-xs text-red mt-1'>
          <div className='text-red'>{formik.errors[name]}</div>
        </div>
      )}

      {isDisplaySubtext ? (
        <div className='mt-2 text-textColor text-[13px] font-normal leading-none'>
          Please use a minimum of 8 characters, including at least one capital letter and one
          special character. Spaces are not allowed.
        </div>
      ) : null}
    </>
  )
}

export default InputPasswordBar
