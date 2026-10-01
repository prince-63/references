import TickIcon from 'assets/icons/TickIcon'
import Tag from 'components/tags/Tag'
import Button from 'components/atom/Buttons/Button'
import ArrowRight from 'assets/icons/ArrowRight'
import trackingMethodTagTypes from '@constants/trackingMethodTagTypes'
import When from 'components/when/When'
import trackingTypes from '@constants/trackingTypes'
import trackingMethodFeatures from '@staticData/trackingMethodFeatures'
import {useNavigate, useParams} from 'react-router-dom'
import {TrackingDetailsType} from '../types/tracking.types'
import getColorPalette from 'utils/getColorPalette'

const TickBulletedText = ({text}: {text: string}) => {
  return (
    <div className='flex gap-[10px] text-textColor items-center font-medium text-[14px] w-full'>
      <TickIcon color='#666666' width='11' height='8' />
      <span> {text}</span>
    </div>
  )
}

interface TrackingMethodProps {
  isSelectedMethod: boolean
  trackingDetails: TrackingDetailsType
}

const TrackingMethodCard = ({isSelectedMethod, trackingDetails}: TrackingMethodProps) => {
  const notSelectedTrackingType =
    trackingDetails?.tracking_type === trackingTypes.MANUAL
      ? trackingTypes.PATIENTAPP
      : trackingTypes.MANUAL
  const data =
    trackingMethodFeatures[
      isSelectedMethod ? trackingDetails?.tracking_type : notSelectedTrackingType
    ]
  const navigate = useNavigate()
  const {patientId} = useParams()

  const handleCompleteSetupClick = () => {
    if (trackingDetails?.patient_data_fill_status === 'PATIENT_FILLED_DATA') {
      const queryParams = new URLSearchParams({
        isPatientFilledData: 'true',
      }).toString()
      navigate(`/leads-profile/${patientId}/treatment/review-tracking-details?${queryParams}`)
    } else if (trackingDetails?.patient_data_fill_status === 'ASK_PATIENT_TO_FILL') {
      const queryParams = new URLSearchParams({
        isPatientFillingData: 'true',
      }).toString()
      navigate(`/leads-profile/${patientId}/treatment/review-tracking-details?${queryParams}`)
    } else {
      const queryParams = new URLSearchParams({
        isDraft: 'true',
      }).toString()
      navigate(`/leads-profile/${patientId}/treatment/review-tracking-details?${queryParams}`)
    }
  }

  const handleViewDetailsClick = () => {
    const queryParams = new URLSearchParams({
      view: 'true',
    }).toString()
    navigate(`/leads-profile/${patientId}/treatment/review-tracking-details?${queryParams}`)
  }

  return (
    <div className='md:w-[340px] w-full border border-mediumGray rounded-lg p-4'>
      <div className='flex items-center justify-between w-full mt-2'>
        <span className='text-lg font-semibold'>{data?.title}</span>
        <When
          isTrue={isSelectedMethod && trackingDetails?.status === trackingMethodTagTypes.ACTIVE}
        >
          <Tag
            value={trackingMethodTagTypes.ACTIVE}
            className='text-[12px] !p-[6px] !px-4 !rounded-[18px] text-tertiaryColor !bg-tertiarySupport'
          />
        </When>
        <When
          isTrue={
            isSelectedMethod &&
            trackingDetails?.status === trackingMethodTagTypes.DRAFT &&
            trackingDetails?.send_to_patient &&
            trackingDetails?.patient_data_fill_status !== 'UNASSIGNED'
          }
        >
          <Tag
            value={'PENDING'}
            className='text-[12px] !p-[6px] !px-4 !rounded-[18px] !text-orange !bg-orangeSupport'
          />
        </When>
        <When
          isTrue={
            isSelectedMethod &&
            trackingDetails?.status === trackingMethodTagTypes.DRAFT &&
            trackingDetails?.patient_data_fill_status === 'UNASSIGNED'
          }
        >
          <Tag
            value={'DRAFT'}
            className='text-[12px] !p-[6px] !px-4 !rounded-[18px] text-secondaryColor bg-secondarySupport '
          />
        </When>

        <When isTrue={!isSelectedMethod && notSelectedTrackingType === trackingTypes.MANUAL}>
          <Tag
            value={'UNAVAILABLE'}
            className='text-[12px] !p-[6px] !px-4 !rounded-[18px] !text-textColor !bg-mediumGray'
          />
        </When>
      </div>
      <p className=' font-medium text-[16px] text-textColor mt[14px]'>Includes</p>
      <div className='mt-[11px] flex flex-col gap-2'>
        {data?.features.map((feature: any) => (
          <TickBulletedText text={feature} key={feature} />
        ))}
      </div>
      <When isTrue={isSelectedMethod && trackingDetails?.status === trackingMethodTagTypes.DRAFT}>
        <Button
          text='Complete Setup'
          className='bg-primaryColor !w-fit h-[34px] px-[19px] mt-[19px] py-[10px]'
          SvgRight={<ArrowRight color='#ffffff' height='9' width='13' />}
          textStyle='!text-[14px] !font-semibold'
          onClick={handleCompleteSetupClick}
        />
      </When>
      <When isTrue={isSelectedMethod && trackingDetails?.status === trackingMethodTagTypes.ACTIVE}>
        <Button
          text='View Details'
          className='bg-primarySupport !w-fit h-[34px] px-[19px] py-[10px] mt-[19px] '
          textStyle='!text-primaryColor !text-[14px] !font-semibold'
          SvgRight={<ArrowRight color={getColorPalette().primaryColor} height='9' width='13' />}
          onClick={handleViewDetailsClick}
        />
      </When>
    </div>
  )
}

export default TrackingMethodCard
