/* cspell:ignore CoolDown */

import useDispatchAction from '@hooks/useDispatchAction'
import DropdownSvg from 'assets/icons/DropdownSvg'
import clsx from 'clsx'
import ModalUpgradeConfirm from 'components/modal/LeadsProfile/Tracking/ModalUpgradeConfirm'
import When from 'components/when/When'
import {useState} from 'react'
import {setIsModalConnectWithPatientOpen} from 'redux/Slices/AppSlice/InvitePatient/AddAndSendInvite'
import moment from 'moment'
import hasValue from 'utils/hasValue'
import cn from '@utils/cn'
import CaretRightIcon from 'assets/icons/CaretRightIcon'

interface ConnectionStatus {
  is_patient_connected: boolean
  is_patient_invited: boolean
  invite_sent_duration?: number | null
  last_invitation_at?: string | null
}

const InviteSection = ({
  connectionDate,
  connectionStatus,
}: {
  connectionDate: string
  connectionStatus: ConnectionStatus
}) => {
  const [isModalUpgradeOpen, setIsModalUpgradeOpen] = useState(false)

  const {dispatchAction} = useDispatchAction()
  const inviteSentDurationRaw = connectionStatus?.invite_sent_duration
  const shouldTreatAsCoolDown =
    inviteSentDurationRaw === null || inviteSentDurationRaw === undefined
  const inviteSentDuration = shouldTreatAsCoolDown
    ? 0
    : typeof inviteSentDurationRaw === 'number'
      ? inviteSentDurationRaw
      : Number(inviteSentDurationRaw) || 0
  const isResendPending =
    connectionStatus?.is_patient_invited && !connectionStatus?.is_patient_connected
  const isResendOnCoolDown = isResendPending && (shouldTreatAsCoolDown || inviteSentDuration <= 1)
  const resendCoolDownHelperText = isResendOnCoolDown ? 'Resend in 24h' : null

  const getConnectionStatus = (connectionStatus: ConnectionStatus) => {
    if (!connectionStatus?.is_patient_connected && !connectionStatus?.is_patient_invited) {
      return 'Not connected'
    }

    if (!connectionStatus?.is_patient_connected && connectionStatus?.is_patient_invited) {
      return 'Pending'
    }

    if (connectionStatus?.is_patient_connected) {
      return 'Connected'
    }

    return 'Unknown'
  }
  const status = getConnectionStatus(connectionStatus)

  return (
    <div
      className={clsx(
        'w-full border shadow-none rounded-lg',
        status === 'Not connected'
          ? 'bg-primarySupport  border-primaryColor'
          : 'bg-white border-mediumGray'
      )}
    >
      <When isTrue={isModalUpgradeOpen}>
        <ModalUpgradeConfirm setIsModalUpgradeOpen={setIsModalUpgradeOpen} />
      </When>
      <div className=' flex flex-col mb-4'>
        <div className='flex-col px-3 pt-4 gap-1'>
          <div
            className={clsx(
              'w-fit px-2 py-1 rounded-[100px] flex items-center justify-center gap-1.5 border',
              {
                'bg-redSupport text-red border-red': status === 'Not connected',
                'bg-orangeSupport text-orange border-orange': status === 'Pending',
                'bg-tertiarySupport text-tertiaryColor border-tertiaryColor':
                  status === 'Connected',
              }
            )}
          >
            <div
              className={clsx('w-[12px] h-[12px] rounded-full', {
                'bg-red': status === 'Not connected',
                'bg-orange': status === 'Pending',
                'bg-tertiaryColor': status === 'Connected',
              })}
            ></div>
            <span className={clsx('font-medium text-sm')}>{status}</span>
          </div>
          <div className='font-semibold md:text-lg w-fit mt-3'>Patient app</div>
        </div>
        {/*<--------------------------------------------------------------- Invite Code part---------------------------------------------> */}
        <div className='px-4 mt-1'>
          <div className='flex justify-center gap-2 w-fit'>
            <div className='pt-[2px]'>
              <span className='text-textColor font-normal text-[14px] '>
                {status === 'Not connected' &&
                  "No invite has been sent yet. Add the patient's email to connect them to the app."}
                {status === 'Pending' &&
                  "An invite has been sent, but the patient hasn't signed up yet. Resend the invite and ensure they use the same email ID."}
                {status === 'Connected' &&
                  `The patient signed up on ${
                    hasValue(connectionDate) ? moment(connectionDate).format('DD-MMM-YYYY') : '--'
                  } and is actively connected to the app`}
              </span>
            </div>
          </div>
          <When isTrue={status === 'Not connected'}>
            <button
              className='w-full text-white bg-primaryColor font-semibold mt-3 py-2 flex justify-center items-center gap-2 rounded-lg'
              onClick={() => dispatchAction(setIsModalConnectWithPatientOpen(true))}
            >
              {'Invite now'} <DropdownSvg width='7' height='12' color='white' />
            </button>
          </When>
          <When isTrue={status === 'Pending'}>
            <div className='flex flex-col gap-2 mt-3'>
              <button
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg border border-primaryColor bg-primarySupport w-full text-primaryColor font-semibold text-base hover:bg-primarySupport transition-colors duration-150',
                  isResendOnCoolDown && 'cursor-not-allowed opacity-60 hover:bg-primarySupport'
                )}
                onClick={() => dispatchAction(setIsModalConnectWithPatientOpen(true))}
                disabled={isResendOnCoolDown}
              >
                {'Resend invite'} <CaretRightIcon color='#735BF2' />
              </button>
              <When isTrue={Boolean(resendCoolDownHelperText)}>
                <span className='text-sm font-medium text-textColor text-center'>
                  {resendCoolDownHelperText}
                </span>
              </When>
            </div>
          </When>
        </div>
      </div>
    </div>
  )
}
export default InviteSection
