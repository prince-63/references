import clsx from 'clsx'
import {getFirstLetterCapitalOfWord} from 'utils/ConstFunctions'
import CheckedCircleOutlineIcon from 'assets/icons/CheckedCircleOutlineIcon'
import ClockIcon from 'assets/icons/ClockIcon'
import CircledAlertIcon from 'assets/icons/CircledAlertIcon'

const GetAppInviteStatus = ({app_invite_status}: {app_invite_status: string}) => {
  const isNotConnected = app_invite_status === 'NOT_CONNECTED'
  const isPending = app_invite_status === 'PENDING'
  const isConnected = app_invite_status === 'CONNECTED'

  return (
    <div className='flex md:flex-col flex-row gap-2 w-fit'>
      <div className='flex-row flex items-center justify-start'>
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

          {isNotConnected
            ? 'Not Connected'
            : getFirstLetterCapitalOfWord(app_invite_status).toUpperCase()}
        </span>
      </div>
    </div>
  )
}

export default GetAppInviteStatus
