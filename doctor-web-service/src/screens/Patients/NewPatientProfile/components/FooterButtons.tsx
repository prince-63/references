import {Aligner} from '../patientTimeline.types'
import AntdButton from 'components/atom/Buttons/AntdButton'
import cn from '@utils/cn'
import {useNavigate, useParams} from 'react-router-dom'
import useAllUserPlan from '@hooks/useAllUserPlan'
const FooterButtons = ({
  aligner,
  onSendReminder,
  setIsEditTreatmentModel,
  setSelectedAligner,
  onResumeTreatment,
  isDeactivated,
  isPaused,
}: {
  aligner?: Aligner | null
  onSendReminder: () => void
  isPaused: boolean
  setIsEditTreatmentModel: (isEditTreatmentModel: boolean) => void
  setSelectedAligner: (aligner: Aligner) => void
  onResumeTreatment: () => void
  isDeactivated: boolean
}) => {
  const {isPractice, isStarterPlanUser, isOrganization} = useAllUserPlan()
  const isCurrentAligner = aligner?.aligner_number === aligner?.current_aligner_number
  const showExtendWearDays =
    ((aligner?.actions?.some((i) => i.action_type === 'ALIGNER_CHANGE_SCHEDULED') &&
      aligner.over_due > -3) ||
      aligner?.actions?.some((i) => i.action_type === 'ALIGNER_CHANGE_OVERDUE_PENDING_ACTION')) &&
    (isStarterPlanUser || isPractice) &&
    isCurrentAligner &&
    !aligner?.aligner_change_approved &&
    !isDeactivated &&
    !isPaused
  const showSendReminder =
    aligner?.actions?.some((i) => i.action_type === 'ALIGNER_CHANGE_OVERDUE_PENDING_ACTION') &&
    !isDeactivated &&
    !isOrganization &&
    !isPaused

  const showSetupTreatment =
    aligner?.actions?.some((i) => i.action_type === 'CREATE_REFINEMENT_REMINDER') &&
    isCurrentAligner &&
    !isOrganization &&
    !isPaused
  const showResumeTreatment =
    (aligner?.actions?.some((i) => i?.action_type === 'AWAITING_RESUME_APPROVAL') ||
      aligner?.actions[aligner?.actions?.length - 1]?.action_type === 'TREATMENT_PAUSED') &&
    !isDeactivated &&
    isCurrentAligner &&
    !isOrganization

  const showAnyButton =
    showResumeTreatment || showExtendWearDays || showSendReminder || showSetupTreatment

  const {patientId} = useParams()

  const navigate = useNavigate()
  return (
    <div
      className={cn(
        'flex flex-col gap-3 md:flex-row md:gap-2 md:flex-wrap justify-start ',
        showAnyButton && 'border-mediumGray border-t p-4'
      )}
    >
      {!showSetupTreatment && showResumeTreatment && (
        <AntdButton
          text={
            <span>
              <div className='flex items-center gap-2'>Resume treatment</div>
            </span>
          }
          onClick={onResumeTreatment}
          className={cn(
            'h-10 text-base border font-semibold rounded-lg',
            'bg-primaryColor  text-white hover:!bg-primaryColor hover:!text-white'
          )}
        />
      )}

      {showSetupTreatment && (
        <AntdButton
          text={
            <span>
              <div className='flex items-center gap-2'>Set-up treatment</div>
            </span>
          }
          onClick={() => {
            navigate(`/leads-profile/${patientId}/treatment`)
          }}
          className={cn(
            'h-10 text-base border font-semibold rounded-lg',
            'bg-primaryColor  text-white hover:!bg-primaryColor hover:!text-white'
          )}
        />
      )}
      {!showSetupTreatment && !showResumeTreatment && showExtendWearDays && (
        <AntdButton
          text={<div className='flex items-center gap-2 justify-center'>Extend wear days</div>}
          onClick={() => {
            setIsEditTreatmentModel(true)
            setSelectedAligner(aligner as Aligner)
          }}
          className='h-10 text-base bg-primarySupport border border-primaryColor text-primaryColor hover:!bg-primarySupport hover:!text-primaryColor font-semibold rounded-lg'
        />
      )}
      {showSendReminder && (
        <button
          className='md:w-fit w-full rounded-lg h-10 px-5 text-textColor border border-mediumGray justify-start font-semibold text-base'
          type='button'
          onClick={onSendReminder}
        >
          Send reminder
        </button>
      )}
    </div>
  )
}

export default FooterButtons
