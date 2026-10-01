import CloseIcon from 'assets/icons/CloseIcon'
import ModalLayout from 'components/modal/ModalLayout'
import InfoIcon from 'assets/icons/InfoIcon'
import {useNavigate} from 'react-router-dom'
import When from 'components/when/When'
import useAllUserPlan from '@hooks/useAllUserPlan'

const UpgradePlanModal = ({
  onClose,
  title,
  subTitle,
}: {
  onClose: () => void
  title: string
  subTitle: string
}) => {
  const navigation = useNavigate()
  const {isPractice} = useAllUserPlan()
  return (
    <ModalLayout>
      <div className='p-3'>
        <div className='flex justify-between items-center mb-4'>
          <div className='flex items-center justify-center w-12 h-12 rounded-full bg-redSupport'>
            <InfoIcon color='red' width='24' height='24' />
          </div>
          <div className='cursor-pointer' onClick={onClose}>
            <CloseIcon width='24' height='24' />
          </div>
        </div>
        <div>
          <p className='font-semibold text-2xl '>{title}</p>
          <p className=' text-textColor text-base font-normal'>{subTitle}</p>
        </div>
        <When isTrue={!isPractice}>
          <button
            className='w-full h-12 bg-red text-white font-semibold rounded-lg mt-6'
            onClick={() => {
              navigation('/settings/upgrade-renew-subscription')
            }}
          >
            Upgrade
          </button>
        </When>
      </div>
    </ModalLayout>
  )
}

export default UpgradePlanModal
