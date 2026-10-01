import useSubscriptionDetails from '@hooks/useSubscriptionDetails'
import InfoIcon from 'assets/icons/InfoIcon'
import RenewalIcon from 'assets/icons/RenewalIcon'
import Tag from 'components/tags/Tag'
import moment from 'moment'
import {capitalizeFirstLetter} from 'utils/ConstFunctions'
import getColorPalette from 'utils/getColorPalette'

const SubscriptionCard = () => {
  const {subscriptionData} = useSubscriptionDetails()

  return (
    <div className='p-5 border border-mediumGray rounded-lg flex flex-col gap-3 mb-4'>
      <Tag value={'CURRENT PLAN'} className='bg-lightGray text-textColor w-fit text-xs px-2' />
      <div className='flex flex-col'>
        <p className='text-neutralBlack text-2xl font-semibold'>
          {capitalizeFirstLetter(subscriptionData?.plan_metadata?.plan_name)}
        </p>
        <div className='text-sm text-textColor font-medium flex gap-1'>
          <RenewalIcon />
          Next renewal on{' '}
          {moment(subscriptionData?.plan_metadata?.next_billing_at).format('DD-MMM-YYYY')}
        </div>
      </div>
      <div className='flex flex-col text-base font-medium gap-2'>
        Your plan currently includes:
        <div className='flex flex-col gap-2'>
          {/* {getFeaturesList().map((item, index) => (
            <ListItemWithIcon key={index} {...item} />
          ))} */}
        </div>
        <div className='flex flex-row gap-1 text-secondaryColor justify-center items-start mt-1 font-medium text-base md:hidden'>
          <InfoIcon color={getColorPalette().secondaryColor} height='24px' width='24px' />
          {'Subscription management is accessible exclusively through the web portal'}
        </div>
      </div>

      {/* <AntdButton
        text={
          subscriptionData?.current_plan_details?.plan_type === 'TRIAL'
            ? 'Upgrade plan'
            : 'Manage subscription'
        }
        loading={gettingAccessUrl}
        disabled={
          gettingAccessUrl || subscriptionData?.current_plan_details?.plan_type === 'ENTERPRISE'
        }
        onClick={async () => {
          if (subscriptionData?.current_plan_details?.plan_type === 'TRIAL') {
            navigate('/upgrade-plan', {
              state: {doctorData},
            })
          } else {
            setGettingAccessUrl(true)
            const response = await apiHelper(
              `${URL_MANAGE_SUBSCRIPTION}?email=${doctorData?.email}`,
              HttpMethod.POST
            )
            setGettingAccessUrl(false)
            window.open(response.data.accessUrl, '_blank')
          }
        }}
        className={clsx(
          'h-10 text-base border font-semibold rounded-lg md:bg-primarySupport md:border-primaryColor md:text-primaryColor hover:!bg-primarySupport hover:!text-primaryColor',
          'border-black bg-lightGray text-grayDisabled pointer-events-none opacity-50 md:pointer-events-auto md:opacity-100'
        )}
      /> */}
    </div>
  )
}

export default SubscriptionCard
