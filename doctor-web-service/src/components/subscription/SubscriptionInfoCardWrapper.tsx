import getSubscriptionAlerts from '@utils/getSubscriptionAlerts'
import InfoCard from 'screens/Patients/LeadsProfile/main/alignersTracking/components/InfoCard'
import {ISubscriptionDetails, SubscriptionModule} from './subscription.types'
import subscriptionModulesConstants from '@constants/subscriptionModules.constants'
import {formatStorageSize} from '@utils/formatStorageSize'
import {useNavigate} from 'react-router-dom'
import When from 'components/when/When'
import useAllUserPlan from '@hooks/useAllUserPlan'

const SubscriptionInfoCardWrapper = ({
  type,
  subscriptionData,
  loadingSubscriptionData,
}: {
  type: SubscriptionModule
  subscriptionData: ISubscriptionDetails
  loadingSubscriptionData: boolean
}) => {
  const navigate = useNavigate()
  const subscriptionAlerts = getSubscriptionAlerts({subscriptionData})
  const {isCustomer, isPractice, isAlignerCompanyOrg} = useAllUserPlan()

  const getInfoCardConfig = () => {
    const getWarningTitle = () => {
      if ((isPractice || isCustomer) && type === subscriptionModulesConstants.storage) {
        return `You're nearing your storage limit`
      }

      if ((isPractice || isCustomer) && type === subscriptionModulesConstants.patients) {
        return `You're nearing the patient limit`
      }

      if (isAlignerCompanyOrg && type === subscriptionModulesConstants.patients) {
        return `You have used up ${subscriptionData?.total_used_patients} out of ${subscriptionData?.total_patients} patient capacity`
      }

      if (isAlignerCompanyOrg && type === subscriptionModulesConstants.storage) {
        return `You have used up ${formatStorageSize(
          subscriptionData?.used_storage_gb
        )} out of ${subscriptionData?.total_storage_gb} GB of your storage`
      }
    }
    const getErrorTitle = () => {
      if ((isPractice || isCustomer) && type === subscriptionModulesConstants.storage) {
        return `Storage limit reached`
      }

      if ((isPractice || isCustomer) && type === subscriptionModulesConstants.patients) {
        return `Patient limit reached`
      }

      if (isAlignerCompanyOrg && type === subscriptionModulesConstants.patients) {
        return `You have used up ${subscriptionData?.total_used_patients} patient capacity`
      }

      if (isAlignerCompanyOrg && type === subscriptionModulesConstants.storage) {
        return `You have used up ${formatStorageSize(
          subscriptionData?.used_storage_gb
        )}  of your storage`
      }
    }

    if (subscriptionAlerts[type].warning) {
      return {
        title: getWarningTitle(),
        buttonClassName: '!text-orange !border-orange ',
        iconColor: '#BE8901',
        infoIconColor: '#BE8901',
        buttonText: `${
          type === subscriptionModulesConstants.patients ? 'Add more patients' : 'Add more storage'
        }`,
        className: 'bg-[#EF9E2426] text-orange flex items-center border border-orange',
        titleClassName: '!text-orange font-semibold',
        content: (
          <div className='w-full flex justify-between items-start'>
            <When isTrue={!isAlignerCompanyOrg && type === subscriptionModulesConstants.storage}>
              <span className='text-sm'>
                Your lab's storage is almost full. Some features may be limited soon. Please contact
                your lab admin for more storage.
              </span>
            </When>
            <When isTrue={!isAlignerCompanyOrg && type === subscriptionModulesConstants.patients}>
              <span className='text-sm'>
                Your lab is close to its maximum number of patients. Please connect with your lab
                admin if needed.
              </span>
            </When>
            <When isTrue={isAlignerCompanyOrg && type === subscriptionModulesConstants.storage}>
              <span className='text-sm'>
                You have almost reached your storage capacity limit. Upgrade for more and unlock
                premium features.
              </span>
            </When>
            <When isTrue={isAlignerCompanyOrg && type === subscriptionModulesConstants.patients}>
              <span className='text-sm'>
                You have almost reached your patient capacity limit. Upgrade for more and unlock
                premium features.
              </span>
            </When>
          </div>
        ),
      }
    }
    return {
      title: getErrorTitle(),
      buttonClassName: 'border-red text-red',
      iconColor: 'red',
      infoIconColor: 'red',
      buttonText: 'Upgrade now',
      className: 'bg-redSupport text-orange flex items-center border border-red',
      titleClassName: '!text-red font-semibold',
      content: (
        <>
          <When isTrue={!isAlignerCompanyOrg && type === subscriptionModulesConstants.storage}>
            <span className='text-sm'>
              Your lab’s storage is full. File uploads and new case activity may be paused. Contact
              your lab admin to resolve this.
            </span>
          </When>
          <When isTrue={!isAlignerCompanyOrg && type === subscriptionModulesConstants.patients}>
            <span className='text-sm'>
              Your lab has reached its patient capacity. New patient onboarding may be paused.
              Contact your lab admin to continue
            </span>
          </When>
          <When isTrue={isAlignerCompanyOrg && type === subscriptionModulesConstants.patients}>
            <span className='text-sm'>
              You have almost reached your patient capacity limit. Upgrade for more and unlock
              premium features.
            </span>
          </When>
          <When isTrue={isAlignerCompanyOrg && type === subscriptionModulesConstants.storage}>
            <span className='text-sm'>
              You have almost reached your storage capacity limit. Upgrade for more and unlock
              premium features.
            </span>
          </When>
        </>
      ),
    }
  }
  return (
    <div>
      {!loadingSubscriptionData && subscriptionAlerts[type].show && (
        <div className='mb-2'>
          <InfoCard
            title={getInfoCardConfig().title}
            className={getInfoCardConfig().className}
            titleClassName={getInfoCardConfig().titleClassName}
            iconColor={getInfoCardConfig().iconColor}
            infoIconColor={getInfoCardConfig().infoIconColor}
            showButton={!isAlignerCompanyOrg ? false : true}
            buttonText={getInfoCardConfig().buttonText}
            buttonClassName={getInfoCardConfig().buttonClassName}
            content={getInfoCardConfig().content}
            onClick={() => {
              navigate('/settings/upgrade-renew-subscription')
            }}
          />
        </div>
      )}
    </div>
  )
}

export default SubscriptionInfoCardWrapper
