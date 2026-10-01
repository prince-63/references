import React, {useEffect} from 'react'
import './Styles/OnboardingCallScreen.css'
import useSubscriptionDetails from '@hooks/useSubscriptionDetails'
import {useLocation, useNavigate} from 'react-router-dom'
import hasValue from 'utils/hasValue'

const OnboardingCallScreen: React.FC = () => {
  const handleOnboardingClick = () => {
    window.open(
      'https://meetings-na2.hubspot.com/pshetty?embed=true&uuid=a5e9c094-b087-4b1a-a018-b207889efef0',
      '_blank'
    )
  }

  const {subscriptionData, loadingSubscriptionData} = useSubscriptionDetails(true)
  const navigate = useNavigate()
  const location = useLocation()
  const isFromBrandDetails = Boolean(
    (location.state as {fromBrandDetails?: boolean} | null)?.fromBrandDetails
  )

  useEffect(() => {
    if (loadingSubscriptionData || !hasValue(subscriptionData)) return
    if (isFromBrandDetails && subscriptionData?.is_has_done_practice !== true) return

    // Only bounce users away after the subscription payload is ready
    // and onboarding has actually been completed.
    if (subscriptionData?.is_has_done_practice === true) {
      navigate('/', {replace: true})
    }
  }, [isFromBrandDetails, loadingSubscriptionData, navigate, subscriptionData])

  return (
    <div className='onboarding-page'>
      <div className='onboarding-card'>
        <h2 className='onboarding-title'>
          You’re all set up! <span className='emoji'>🎉</span>
        </h2>

        <p className='onboarding-description'>
          Your account has been created successfully. Book a quick{' '}
          <strong>onboarding call with our specialist</strong> to get your account fully configured
          for your clinic or lab workflow — including case setup, product linking, and treatment
          tracking.
        </p>

        <button className='onboarding-button' onClick={handleOnboardingClick}>
          Book Onboarding Call
        </button>
      </div>
    </div>
  )
}

export default OnboardingCallScreen
