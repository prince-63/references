import clsx from 'clsx'
import {getFirstLetterCapitalOfWord} from 'utils/ConstFunctions'
import CheckedCircleOutlineIcon from 'assets/icons/CheckedCircleOutlineIcon'
import ClockIcon from 'assets/icons/ClockIcon'
import CircledAlertIcon from 'assets/icons/CircledAlertIcon'

type Props = {
  app_invite_status: string
  onCtaClick?: () => void
  isTreatmentSetup?: boolean
  isStarterPlanUser?: boolean
}

const GetAppInviteStatusRevamp = ({
  app_invite_status,
  onCtaClick,
  isTreatmentSetup = true,
  isStarterPlanUser = false,
}: Props) => {
  const isNotConnected = app_invite_status === 'NOT_CONNECTED'
  const isPending = app_invite_status === 'PENDING'
  const isConnected = app_invite_status === 'CONNECTED'

  const statusLabel = isNotConnected
    ? 'Not Connected'
    : getFirstLetterCapitalOfWord(app_invite_status).toUpperCase()

  const ctaLabel =
    isTreatmentSetup && (isNotConnected || isPending)
      ? isNotConnected
        ? 'Send invite'
        : isStarterPlanUser
          ? ''
          : 'Resend invite'
      : ''

  const handleCtaClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    if (onCtaClick && ctaLabel) {
      onCtaClick()
    }
  }

  return (
    <div className='flex flex-col gap-1'>
      {/* Line 1: colored pill text */}
      <div className='flex items-center gap-2'>
        <span
          className={clsx(
            'flex items-center justify-center gap-1.5 text-xs uppercase font-semibold rounded-full border px-3 py-1 w-fit',
            {
              'text-[#DC2626] bg-[#FEF2F2] border-[#FECACA]': isNotConnected,
              'text-[#EA580C] bg-[#FFF7ED] border-[#FED7AA]': isPending,
              'text-[#059669] bg-[#ECFDF5] border-[#A7F3D0]': isConnected,
            }
          )}
        >
          {isNotConnected && (
            <div className='flex items-center'>
              <CircledAlertIcon width='15' height='15' color='currentColor' />
            </div>
          )}
          {isPending && (
            <div className='flex items-center'>
              <ClockIcon width='15' height='15' color='currentColor' />
            </div>
          )}
          {isConnected && (
            <div className='flex items-center'>
              <CheckedCircleOutlineIcon width='15' height='15' color='currentColor' />
            </div>
          )}
          {statusLabel}
        </span>
      </div>

      {/* Line 2: CTA text (only for NOT_CONNECTED / PENDING) */}
      {ctaLabel && (
        <button
          type='button'
          className='flex items-center gap-1 text-sm text-primaryColor font-semibold cursor-pointer'
          onClick={handleCtaClick}
        >
          <span>{ctaLabel}</span>
          <span className='-mt-[1px]'>{'>'}</span>
        </button>
      )}
    </div>
  )
}

export default GetAppInviteStatusRevamp
