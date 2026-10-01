/* cspell:ignore CoolDown */

import cn from '@utils/cn'
import {ReactNode} from 'react'
import useDispatchAction from '@hooks/useDispatchAction'
import {useFeatureAccess} from '@hooks/useFeatureAccess'
import CaretRightIcon from 'assets/icons/CaretRightIcon'
import LinkSimpleIcon from 'assets/icons/LinkSimpleIcon'
import {useSelector} from 'react-redux'
import {setIsModalConnectWithPatientOpen} from 'redux/Slices/AppSlice/InvitePatient/AddAndSendInvite'
import {RootState} from 'redux/store'
import getColorPalette from 'utils/getColorPalette'
import useAllUserPlan from '@hooks/useAllUserPlan'

type InvitePatientInfoCardProps = {
  cardClassName?: string
  icon?: ReactNode
  iconWrapperClassName?: string
  title?: string
  optionalLabel?: string | null
  description?: string
  primaryButtonLabel?: string
  primaryButtonIcon?: ReactNode | null
  primaryButtonClassName?: string
  onPrimaryAction?: () => void
  actionsWrapperClassName?: string
  enforcePermissionCheck?: boolean
}

const InvitePatientInfoCard = ({
  cardClassName,
  icon,
  iconWrapperClassName,
  title,
  optionalLabel,
  description,
  primaryButtonLabel,
  primaryButtonIcon,
  primaryButtonClassName,
  onPrimaryAction,
  actionsWrapperClassName,
  enforcePermissionCheck = true,
}: InvitePatientInfoCardProps) => {
  const {dispatchAction} = useDispatchAction()
  const {data} = useSelector((s: RootState) => s.apiGetLeadsProfileDetails)
  const {permissionChecks} = useFeatureAccess()
  const {isStarterPlanUser} = useAllUserPlan()

  const canShowActions = enforcePermissionCheck
    ? permissionChecks?.patientManagement?.patientInvitation?.isAddable || isStarterPlanUser
    : true

  const palette = getColorPalette()
  const invitationDetails = data?.invitation_details

  // --- duration logic (in days) ---
  const rawDuration = invitationDetails?.invite_sent_duration as unknown
  const inviteSentDuration =
    rawDuration === null || rawDuration === undefined
      ? null
      : (() => {
          const n = parseFloat(String(rawDuration))
          return Number.isFinite(n) ? n : null
        })()

  // --- Determine button state ---
  const isPrimaryActionDisabled = inviteSentDuration === 0
  const helperText = isPrimaryActionDisabled ? 'Resend in 24h' : null

  // --- Determine button label ---
  const resolvedPrimaryLabel =
    primaryButtonLabel ??
    (inviteSentDuration === null
      ? 'Invite patient'
      : inviteSentDuration >= 1
        ? 'Resend Invite'
        : 'Invite patient')

  const handlePrimaryAction =
    onPrimaryAction ??
    (() => {
      if (isPrimaryActionDisabled) return
      dispatchAction(setIsModalConnectWithPatientOpen(true))
    })

  // --- UI text defaults ---
  const resolvedTitle = title ?? 'Invite patient'
  const resolvedOptionalLabel = optionalLabel === undefined ? '(Optional)' : optionalLabel
  const resolvedDescription =
    description ??
    'Onboarding the patient on the first step allows them to have a complete overview of the case stage'

  // --- Icons ---
  const defaultIcon = <LinkSimpleIcon color={palette.primaryColor} width='20' height='20' />
  const resolvedIcon = icon === undefined ? defaultIcon : icon
  const showIcon = resolvedIcon !== null && resolvedIcon !== false

  const defaultPrimaryIcon = <CaretRightIcon color={palette.white} width='7' height='10' />
  const resolvedPrimaryIcon =
    primaryButtonIcon === undefined ? defaultPrimaryIcon : primaryButtonIcon
  const showPrimaryIcon = resolvedPrimaryIcon !== null && resolvedPrimaryIcon !== false

  return (
    <div
      className={cn(
        'flex flex-col md:flex-row md:items-center gap-6 border border-mediumGray bg-white rounded-lg px-4 py-4 justify-between',
        cardClassName
      )}
    >
      <div className='flex md:items-center items-start gap-4'>
        {showIcon && (
          <div className={cn('bg-primarySupport p-4 rounded-lg w-fit', iconWrapperClassName)}>
            {resolvedIcon}
          </div>
        )}
        <div className='text-base text-textColor'>
          <p className='flex gap-1 items-center text-black font-semibold'>
            <span>{resolvedTitle}</span>
            {resolvedOptionalLabel && (
              <span className='text-textColor font-normal text-sm'>{resolvedOptionalLabel}</span>
            )}
          </p>
          {resolvedDescription && (
            <p className='text-textColor font-normal text-sm'>{resolvedDescription}</p>
          )}
        </div>
      </div>

      {canShowActions && (
        <div className={cn('flex justify-center items-center gap-2', actionsWrapperClassName)}>
          {helperText && (
            <span className='text-sm font-medium text-textColor whitespace-nowrap'>
              {helperText}
            </span>
          )}

          <button
            className={cn(
              // Base styles
              'flex gap-2 items-center font-semibold py-2 rounded-lg min-w-[150px] justify-center px-4 transition-all duration-300',
              primaryButtonClassName,

              // Conditional state classes (decide color here)
              inviteSentDuration === 0
                ? 'bg-mediumGray text-white cursor-not-allowed opacity-60 hover:opacity-60' // Disabled state
                : 'bg-[#be8901] text-white hover:opacity-90' // Active (>=1 or null)
            )}
            type='button'
            onClick={(e) => {
              if (inviteSentDuration === 0) {
                e.preventDefault()
                e.stopPropagation()
                return
              }
              handlePrimaryAction()
            }}
            disabled={inviteSentDuration === 0}
          >
            {resolvedPrimaryLabel}
            {showPrimaryIcon && resolvedPrimaryIcon}
          </button>
        </div>
      )}
    </div>
  )
}

export default InvitePatientInfoCard
