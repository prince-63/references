import RenewalIcon from 'assets/icons/RenewalIcon'
import Tag from 'components/tags/Tag'
import When from 'components/when/When'
import SubscriptionProgressMarker from './SubscriptionProgressMarker'
import PatientsUsedIcon from 'assets/icons/PatientsUsedIcon'
import StorageUsedIcon from 'assets/icons/StorageUsedIcon'
import clsx from 'clsx'
import useSubscriptionDetails from '@hooks/useSubscriptionDetails'
import getSubscriptionAlerts from '@utils/getSubscriptionAlerts'
import moment from 'moment'
import {SubscriptionModule} from './subscription.types'
import hasValue from 'utils/hasValue'
import {capitalizeFirstLetter} from 'utils/ConstFunctions'
import AlertIconThin from 'assets/icons/AlertIconThin'
import {formatStorageSize} from '@utils/formatStorageSize'
import OrdersIcon from 'assets/icons/ThreeDotIcons'
import useAllUserPlan from '@hooks/useAllUserPlan'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'

const SubscriptionDetailsTile = () => {
  const {subscriptionData} = useSubscriptionDetails()
  const subscriptionAlerts = getSubscriptionAlerts({subscriptionData})
  const {serviceConfig} = useSelector((state: RootState) => state.serviceConfiguration)

  const getProgressColor = (type: SubscriptionModule) => {
    if (subscriptionAlerts[type].warning) {
      return '#EF9E24'
    } else if (subscriptionAlerts[type].error) {
      return '#F45045'
    }
    return '#0095FF'
  }
  const {isStarterPlanUser} = useAllUserPlan()

  return (
    <div>
      {hasValue(subscriptionData) && (
        <div
          className={clsx('rounded-lg flex-1  border border-mediumGray flex flex-col gap-3 p-4')}
        >
          <div className='flex flex-col'>
            {subscriptionData?.plan_metadata.trial_plan && (
              <Tag
                value={'TRIAL'}
                className='bg-lightGray text-textColor w-fit text-xs px-2 font-medium mb-2'
              />
            )}
            <p className={clsx('text-neutralBlack  font-semibold ')}>
              {capitalizeFirstLetter(
                subscriptionData?.plan_metadata.plan_name === 'DESIGN_LAB'
                  ? 'Design Lab'
                  : subscriptionData?.plan_metadata.plan_name
              )}
            </p>

            <div className='text-sm text-textColor font-medium flex gap-1'>
              <RenewalIcon />
              Next renewal on{' '}
              {moment(subscriptionData?.plan_metadata.next_billing_at).format('DD-MMM-YYYY')}
            </div>
          </div>
          <div className='w-full border border-mediumGray'></div>

          <When isTrue={subscriptionAlerts.aggregated.show}>
            <div
              className={clsx(
                'flex items-start gap-2 text-sm',
                subscriptionAlerts.aggregated.warning && 'text-orange',
                subscriptionAlerts.aggregated.error && 'text-red'
              )}
            >
              <div className='shrink-0'>
                <AlertIconThin color={subscriptionAlerts.aggregated.warning ? '#BE8901' : 'red'} />
              </div>
              <p>
                {subscriptionAlerts.aggregated.warning
                  ? 'Your plan usage is reaching its limit. Consider upgrading.'
                  : 'Your plan usage has reached its limit. Upgrade to continue using the features.'}
              </p>
            </div>
          </When>

          <When isTrue={serviceConfig?.PLANNING || serviceConfig.VSP_PLANNING}>
            <SubscriptionProgressMarker
              {...{
                label: {
                  icon: <OrdersIcon color='#666666' />,
                  title: 'Orders',
                },
                value: `${subscriptionData?.used_orders} of ${subscriptionData?.total_orders}  ongoing`,
                color: getProgressColor('order'),
                percentage: subscriptionAlerts?.order?.percentage,
              }}
            />
          </When>
          <When isTrue={serviceConfig?.MANUFACTURING}>
            <SubscriptionProgressMarker
              {...{
                label: {
                  icon: <OrdersIcon color='#666666' />,
                  title: 'Manufacturing Order',
                },
                value: `${subscriptionData?.used_manufacturings} of ${subscriptionData?.total_orders}  ongoing`,
                color: getProgressColor('order'),
                percentage: subscriptionAlerts?.order?.percentage,
              }}
            />
          </When>
          <When isTrue={serviceConfig?.ALIGNER_PLANNING_MANUFACTURING || isStarterPlanUser}>
            <SubscriptionProgressMarker
              {...{
                label: {
                  icon: <PatientsUsedIcon />,
                  title: 'Patients',
                },
                value: `${subscriptionData?.total_used_patients} of ${subscriptionData?.total_patients} active`,
                color: getProgressColor('patients'),
                percentage: subscriptionAlerts?.patients?.percentage,
              }}
            />
          </When>
          <When isTrue={!subscriptionData?.is_gdrive_platform_enabled}>
            <SubscriptionProgressMarker
              {...{
                label: {
                  icon: <StorageUsedIcon />,
                  title: 'Storage',
                },
                value: `${formatStorageSize(
                  subscriptionData?.used_storage_gb
                )} of ${subscriptionData?.total_storage_gb} GB used`,
                color: getProgressColor('storage'),
                percentage: subscriptionAlerts.storage.percentage,
              }}
            />
          </When>
          {/* <div className='mt-auto'>
            <When isTrue={!subscriptionAlerts.aggregated.error}>
              <button
                type='button'
                className={clsx(
                  'rounded-[4px] px-3 py-2  flex justify-between items-center gap-2 font-semibold',
                  !subscriptionAlerts.aggregated.show && 'text-secondaryColor bg-secondarySupport',
                  subscriptionAlerts.aggregated.warning && 'text-orange bg-orangeSupport',
                  subscriptionAlerts.aggregated.error && 'text-red bg-redSupport'
                )}
                onClick={() => {
                  dispatch(setIsMobileSidebarOpen(false))
                  navigate('/doctor-profile/subscription')
                }}
              >
                <When isTrue={!isDashBoard}>
                  <SparklesIcon
                    color={clsx(
                      !subscriptionAlerts.aggregated.show && ' #0095FF',
                      subscriptionAlerts.aggregated.warning && '#BE8901',
                      subscriptionAlerts.aggregated.error && '#F45045'
                    )}
                  />
                </When>
                {subscriptionAlerts.aggregated.error ? 'Upgrade now' : 'Add more'}
                <When isTrue={isDashBoard}>
                  <RightArrowIcon
                    color={clsx(
                      !subscriptionAlerts.aggregated.show && ' #0095FF',
                      subscriptionAlerts.aggregated.warning && ' #BE8901',
                      subscriptionAlerts.aggregated.error && ' #F45045'
                    )}
                  />
                </When>
              </button>
            </When>
          </div> */}
        </div>
      )}
    </div>
  )
}

export default SubscriptionDetailsTile
