import CardHeading from './CardHeading'
import Tag from 'components/tags/Tag'
import clsx from 'clsx'
import treatmentPlanStatusConstants from '@constants/treatmentPlanStatus.constants'
import productTypes from '@constants/productTypes'
import When from 'components/when/When'
import TreatmentEmptyState from './EmptyState'
import {Progress} from 'antd'
import getColorPalette from 'utils/getColorPalette'

interface TreatmentProgressInterface {
  productType: string
  status: keyof typeof treatmentPlanStatusConstants | null
  currentAligner: number
  totalAligners: number
}

const statusMap = {
  [treatmentPlanStatusConstants.ACTIVE]: 'Active',
  [treatmentPlanStatusConstants.DEACTIVATED]: 'Deactivated',
  [treatmentPlanStatusConstants.PAUSED]: 'Paused',
  [treatmentPlanStatusConstants.DRAFT]: 'Draft',
  [treatmentPlanStatusConstants.SENT_TO_PATIENT]: 'Send to patient',
  [treatmentPlanStatusConstants.COMPLETE]: 'COMPLETED',
  [treatmentPlanStatusConstants.SENT_FOR_APPROVAL]: 'Sent for approval',
  [treatmentPlanStatusConstants.PENDING_APPROVAL]: 'Pending approval',
  [treatmentPlanStatusConstants.APPROVED]: 'Approved',
  [treatmentPlanStatusConstants.ARCHIVED]: 'Archived',
  [treatmentPlanStatusConstants.RE_PLAN]: 'Re-plan',
  [treatmentPlanStatusConstants.PATIENT_APPROVED]: 'Patient approved',
  [treatmentPlanStatusConstants.IN_PROGRESS]: 'In progress',
}

const TreatmentProgress = ({
  productType,
  status,
  currentAligner,
  totalAligners,
}: TreatmentProgressInterface) => {
  return (
    <div className='p-4 rounded-lg border  border-mediumGray '>
      {/* Row One */}
      <div className='flex items-center justify-between w-full'>
        <CardHeading text={'Treatment progress'} />
        <When
          isTrue={
            productType === productTypes.ALIGNERS &&
            status != treatmentPlanStatusConstants.DRAFT &&
            status != null
          }
        >
          <Tag
            value={status ? statusMap[status] : ''}
            className={clsx(
              'text-xs font-semibold',
              status === treatmentPlanStatusConstants.ACTIVE &&
                '!bg-tertiarySupport !text-tertiaryColor',
              status === treatmentPlanStatusConstants.COMPLETE &&
                '!bg-tertiarySupport !text-tertiaryColor',
              status === treatmentPlanStatusConstants.DEACTIVATED && '!bg-redSupport !text-red',
              status === treatmentPlanStatusConstants.PAUSED && '!bg-orangeSupport !text-orange'
            )}
          />
        </When>
      </div>
      {/* Row One End*/}
      <When isTrue={productType === productTypes.BRACES}>
        <TreatmentEmptyState
          text='You can view treatment progress in mobile app.
At present, our web application is exclusively for tracking aligner patients'
        />
      </When>
      <When isTrue={productType === productTypes.ALIGNERS}>
        <div className='font-medium text-color'>
          <span className='text-sm font-semibold text-textColor flex gap-1 items-baseline'>
            <span className='text-black text-xl'>{currentAligner}</span>/{totalAligners} Aligners
          </span>
        </div>
        <div>
          <Progress
            percent={totalAligners === 0 ? 0 : (currentAligner / totalAligners) * 100}
            showInfo={false}
            trailColor='#EFEFEF'
            strokeColor={
              status === 'DEACTIVATED' || status === 'COMPLETE'
                ? '#B0B0B0'
                : getColorPalette().primaryColor
            }
            strokeWidth={10}
            className='h-[1rem]'
          />
        </div>
      </When>
    </div>
  )
}

export default TreatmentProgress
