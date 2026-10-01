import CrossIcon from 'assets/icons/CrossIcon'
import InfoIcon from 'assets/icons/InfoIcon'
import SignOutIcon from 'assets/icons/SignOutIcon'
import clsx from 'clsx'
import {AuthContext} from 'context/AuthContext'
import {useContext} from 'react'

const LabStaffDeactivatedScreen = () => {
  const {logout} = useContext(AuthContext)

  return (
    <div className='flex flex-col gap-4 md:w-[566px] w-full border border-mediumGray rounded-lg p-4'>
      <div className='flex items-center justify-between'>
        <div
          className={clsx('w-12 h-12 rounded-full flex justify-center items-center bg-redSupport')}
        >
          <InfoIcon color={'red'} />
        </div>
        <button onClick={() => logout()}>
          <CrossIcon />
        </button>
      </div>
      <div>
        <div className='font-semibold text-2xl'>User Account Deactivated</div>
        <div className='font-normal text-base break-words text-textColor'>
          Your account has been deactivated by the lab admin. You no longer have access to the
          platform. Contact your lab admin to reactivate your account or for further assistance.
        </div>
      </div>
      <div className='flex gap-2'>
        <button
          onClick={() => logout()}
          className='flex items-start gap-2 w-fit px-4 py-3 bg-redSupport border border-red text-red  font-semibold text-base rounded-lg'
        >
          <SignOutIcon />
          <div>Log out</div>
        </button>
      </div>
    </div>
  )
}

export default LabStaffDeactivatedScreen
