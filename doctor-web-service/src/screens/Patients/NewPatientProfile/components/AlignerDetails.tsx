import CardHeading from './CardHeading'
import When from 'components/when/When'
import compilanceType from '@constants/compilanceType'
import {TrackingType} from 'screens/Patients/LeadsProfile/main/treatment/Tracking/types/tracking.types'
import trackingTypes from '@constants/trackingTypes'
import hasValue from 'utils/hasValue'
import clsx from 'clsx'
import Tag from 'components/tags/Tag'
import TreatmentEmptyState from './EmptyState'
import productTypes from '@constants/productTypes'
import BackGroundSVG from 'components/atom/SVG/BackGroundSVG'
import {SVG_CALENDER, SVG_TEETHS_GRAY, SVG_TIMER_GRAY} from 'utils/SvgConstants'
import treatmentPlanStatusConstants from '@constants/treatmentPlanStatus.constants'

interface AlignerDetailsInterface {
  productType: string
  compliance: keyof typeof compilanceType
  currentAligner: string
  wearDays: string
  averageWearTime: string
  recommendedTime: string
  trackingType: TrackingType
  status?: keyof typeof treatmentPlanStatusConstants | 'COMPLETED'
}

const complianceMap = {
  [compilanceType.AVERAGE]: 'Average',
  [compilanceType.GOOD]: 'Good',
  [compilanceType.POOR]: 'Poor',
}

const AlignerDetailsItem = ({
  iconSVG,
  label,
  value,
}: {
  iconSVG: any
  label: string
  value: string
}) => {
  return (
    <div className='w-full items-center flex gap-2 text-textColor'>
      <BackGroundSVG
        svg={iconSVG}
        height='20'
        width='20'
        className='rounded-lg !bg-lightGray p-2'
      />
      <div className='w-full flex justify-between md:hidden'>
        <span className='text-sm font-medium'>{label}</span>
        <span className='text-sm font-semibold'>{hasValue(value) ? value : '--'}</span>
      </div>

      <div className='md:block md:order-1 hidden '>
        <div className='text-xs font-medium'>{label}</div>
        <div className='text-sm font-semibold'>{hasValue(value) ? value : '--'}</div>
      </div>
    </div>
  )
}

const AlignerDetails = ({
  compliance,
  currentAligner,
  wearDays,
  averageWearTime,
  recommendedTime,
  productType,
  trackingType,
  status,
}: AlignerDetailsInterface) => {
  return (
    <div className='w-full p-4 rounded-lg border border-lightGray'>
      <div className='flex items-center justify-between w-full'>
        <CardHeading text={'Aligner details'} />
        <When
          isTrue={
            trackingType === trackingTypes.PATIENTAPP &&
            status != 'DEACTIVATED' &&
            hasValue(compliance)
          }
        >
          <Tag
            value={compliance != undefined ? 'Compliance: ' + complianceMap[compliance] : ''}
            className={clsx(
              'text-xs font-semibold',
              compliance === compilanceType.GOOD && '!bg-tertiarySupport !text-tertiaryColor',
              compliance === compilanceType.POOR && '!bg-redSupport !text-red',
              compliance === compilanceType.AVERAGE && '!bg-secondarySupport !text-secondaryColor'
            )}
          />
        </When>
      </div>
      <When isTrue={productType === productTypes.BRACES}>
        <TreatmentEmptyState text='Not available for braces treatment' />
      </When>
      <When isTrue={productType === productTypes.ALIGNERS}>
        <div className='grid md:grid-cols-2 grid-row-4 md:gap-8 gap-2 mt-4'>
          <AlignerDetailsItem
            iconSVG={SVG_TEETHS_GRAY}
            label='Current aligner'
            value={status !== 'DEACTIVATED' && currentAligner ? currentAligner : '--'}
          />
          <AlignerDetailsItem
            iconSVG={SVG_CALENDER}
            label='Wear days'
            value={status !== 'DEACTIVATED' && wearDays ? wearDays : '--'}
          />
          <When isTrue={trackingType === trackingTypes.PATIENTAPP}>
            <AlignerDetailsItem
              iconSVG={SVG_TIMER_GRAY}
              label='Average wear time'
              value={status !== 'DEACTIVATED' ? averageWearTime : '--'}
            />
          </When>

          <AlignerDetailsItem
            iconSVG={SVG_TIMER_GRAY}
            label='Recommended time'
            value={status != 'DEACTIVATED' && recommendedTime ? recommendedTime : '--'}
          />
        </div>
      </When>
    </div>
  )
}

export default AlignerDetails
