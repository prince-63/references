import React from 'react'
import {Aligner} from '../patientTimeline.types'
import dayjs from 'dayjs'
import cn from '@utils/cn'
import {capitalizeFirstLetter} from 'utils/ConstFunctions'
import ActionTag from './ActionTag'
import {getDueMessageText, getDueMessageStyle} from 'utils/getDueMessageText'
import EditButton from 'components/atom/Buttons/EditButton'
import When from 'components/when/When'
import treatmentPlanStatusConstants from '@constants/treatmentPlanStatus.constants'
interface TimelineItemHeaderProps {
  aligner?: Aligner
  alignerNumberStatus: 'current' | 'future' | 'past'
  setIsEditTreatmentModel: (isEditTreatmentModel: boolean) => void
  setSelectedAligner: (aligner: Aligner) => void
  progressStatus: keyof typeof treatmentPlanStatusConstants | null
  isManualTracking: boolean
  disable?: boolean
}

const TimelineItemHeader: React.FC<TimelineItemHeaderProps> = ({
  aligner,
  setIsEditTreatmentModel,
  setSelectedAligner,
  progressStatus,
  isManualTracking,
  alignerNumberStatus,
  disable = false,
}) => {
  if (!aligner) return null
  const isDeactivated = progressStatus === treatmentPlanStatusConstants.DEACTIVATED
  const isPaused = progressStatus === treatmentPlanStatusConstants.PAUSED

  const showButton = () => {
    return (
      (Number(aligner.aligner_number) - Number(aligner.current_aligner_number) === -1 ||
        (Number(aligner.aligner_number) - Number(aligner.current_aligner_number) >= 0 &&
          Number(aligner.aligner_number) >= Number(aligner.current_aligner_number))) &&
      !isDeactivated &&
      !isPaused
    )
  }
  return (
    <div className={cn('flex items-start justify-between w-full')}>
      <div className={cn('flex items-start gap-2 w-full')}>
        <div
          className={cn(
            'w-8 h-8 rounded-full flex items-center justify-center text-sm',
            disable
              ? 'bg-transparent text-textColor border border-mediumGray'
              : {
                  'bg-primaryColor text-white': alignerNumberStatus === 'current',
                  'bg-white text-textColor border border-mediumGray ':
                    alignerNumberStatus === 'future',
                  'bg-transparent text-textColor border border-mediumGray ':
                    alignerNumberStatus === 'past',
                }
          )}
        >
          {aligner.aligner_number}
        </div>
        <div className={cn('flex flex-col gap-1 w-full')}>
          <div className={cn('text-base font-semibold flex flex-wrap items-center gap-2 w-full')}>
            <div className='flex items-baseline gap-1'>
              <p>
                {capitalizeFirstLetter(aligner.jaw_type)} {aligner.aligner_number}
              </p>
              <p className='text-xs text-textColor'> of {aligner.total_aligner}</p>
            </div>
            <When isTrue={!disable && aligner.current_aligner_number >= aligner.aligner_number}>
              <ActionTag
                label={
                  getDueMessageText({
                    currentAligner: aligner.current_aligner_number !== aligner.aligner_number,
                    offSetDays: aligner.over_due,
                    is_aligner_changed: aligner.aligner_changed,
                    is_aligner_change_approved: aligner.aligner_change_approved,
                    skipForThreeDays: true,
                  }) ?? ''
                }
                {...getDueMessageStyle({
                  offSetDays: aligner.over_due,
                  is_aligner_changed: aligner.aligner_changed,
                  is_aligner_change_approved: aligner.aligner_change_approved,
                })}
              />
            </When>

            <When isTrue={aligner?.pending_actions_count > 0 && !isManualTracking && !disable}>
              <ActionTag
                label={`${aligner?.pending_actions_count} pending`}
                className='text-orange ml-auto hidden md:flex'
                iconClassName='bg-orange'
              />
            </When>
          </div>
          <div className={cn('text-xs text-textColor font-semibold flex  items-center gap-2')}>
            <div className={cn('flex flex-wrap items-center gap-1')}>
              <p>{dayjs(aligner.start_date).format('DD-MMM-YYYY')} to </p>
              <p>{dayjs(aligner.end_date).format('DD-MMM-YYYY')}</p>
              <div className={cn('w-1 h-1 rounded-full bg-textColor')} />
              <p>{dayjs(aligner.end_date).diff(dayjs(aligner.start_date), 'days') + 1} days</p>
              <When isTrue={showButton() && !disable}>
                <EditButton
                  onClick={() => {
                    setSelectedAligner(aligner)
                    setIsEditTreatmentModel(true)
                  }}
                  show={true}
                  className='block border-none mb-0.5 py-0 bg-transparent'
                  color='#735BF2'
                />
              </When>
            </div>
          </div>{' '}
          <When isTrue={aligner?.pending_actions_count > 0 && !isManualTracking && !disable}>
            <ActionTag
              label={`${aligner?.pending_actions_count} pending`}
              className='text-orange md:hidden'
              iconClassName='bg-orange'
            />
          </When>
        </div>
      </div>
    </div>
  )
}

export default TimelineItemHeader
