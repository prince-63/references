import React, {useState, useEffect, useRef} from 'react'
import Button from '../../atom/Buttons/Button'
import {ERROR_TERMS_AND_CONDITIONS} from '../../../utils/MessageConstant'
import TermsAndConditions from 'components/auth/components/TermsAndConditions'

interface props {
  name: string
  formik?: any
  setShowAppleTerms?: any
  checked?: boolean
}

const AppleSignupAcceptsTerms: React.FC<props> = (props) => {
  const {formik, setShowAppleTerms, checked} = props
  const [errorMessage, setErrorMessage] = useState('')
  const formRef: any = useRef(null)

  const callSignup = () => {
    if (checked) {
      setShowAppleTerms(false)
    } else {
      setErrorMessage(ERROR_TERMS_AND_CONDITIONS)
    }
  }

  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (formRef.current && !formRef.current.contains(event.target)) {
        // Clicked outside the form, close the terms popup
        setShowAppleTerms(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [setShowAppleTerms])

  useEffect(() => {
    if (checked) {
      setErrorMessage('')
    }
  }, [checked])

  return (
    <div className='fixed left-0 top-0 z-[1055] h-full w-full flex justify-center items-center bg-black bg-opacity-40 min-[876px]'>
      <form ref={formRef} className=' bg-white w-96 rounded-lg p-6 shadow-lg min-w-[30%]'>
        <div className='text-center text-black text-2xl font-bold mb-2 block'>
          Accept Terms of use & Privacy Policy : Apple
        </div>
        <div className='mt-8 flex gap-2 font-family: Figtree text-sm'>
          <input
            type='checkbox'
            id={'acceptTerms'}
            name={'acceptTerms'}
            checked={formik.values.acceptTerms}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className='min-w-[21px] min-h-[21px] mr-[7px] cursor-pointer green-checkbox'
          />
          <TermsAndConditions />
        </div>

        <div className='text-xs text-red mt-1'>
          <div className='text-red'>{errorMessage}</div>
        </div>
        {checked ? (
          <Button text='Continue to Sign up' className='mt-7' onClick={() => callSignup()} />
        ) : (
          <button
            disabled
            className='w-full h-12 px-2.5 py-4 mt-7 bg-mediumGray rounded-lg justify-center items-center gap-2.5 inline-flex'
          >
            Continue to Sign up
          </button>
        )}
      </form>
    </div>
  )
}

export default AppleSignupAcceptsTerms
