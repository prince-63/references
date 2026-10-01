import React from 'react'
import {Link} from 'react-router-dom'
import getBrandConfig from 'utils/getBrandConfig'

const TermsAndConditions = () => {
  return (
    <div className=''>
      <span className='text-textColor text-sm font-normal'>By continuing you</span>
      <span className='text-textColor text-sm font-normal leading-none'> agree to our </span>
      <Link
        to={getBrandConfig().termsAndConditions}
        target='_blank'
        className='text-textColor text-sm font-semibold underline leading-none'
      >
        Terms of use,{' '}
      </Link>
      <Link
        to={getBrandConfig().privacyPolicy}
        target='_blank'
        className='text-textColor text-sm font-semibold underline leading-none'
      >
        Privacy Policy.
      </Link>
    </div>
  )
}

export default TermsAndConditions
