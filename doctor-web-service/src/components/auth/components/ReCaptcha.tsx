import cn from '@utils/cn'
import React from 'react'
import ReCAPTCHA from 'react-google-recaptcha'

interface props {
  setCaptchaChecked: any
  className?: string
}
export const ReCaptcha = (props: props) => {
  const {setCaptchaChecked} = props
  // const TEST_KEY: any = process.env.REACT_APP_TEST_SITE_KEY
  const RECAPTCHA_SITE_KEY = '6LdYBpUpAAAAAEELnHN_FFdIPD2d25cUjSF8yzgg'

  const onChange = () => {
    setCaptchaChecked(true)
  }

  const handleCaptchaExpired = () => {
    setCaptchaChecked(false)
  }
  return (
    <div className={cn('my-4 w-full h-full', props.className)}>
      <ReCAPTCHA
        style={{display: 'inline-block'}}
        onChange={onChange}
        sitekey={RECAPTCHA_SITE_KEY}
        onExpired={handleCaptchaExpired}
      />
    </div>
  )
}
