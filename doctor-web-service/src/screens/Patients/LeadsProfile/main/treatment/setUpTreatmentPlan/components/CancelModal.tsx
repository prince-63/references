import {useNavigate, useParams} from 'react-router-dom'

import ModalLayout from 'components/modal/ModalLayout'
import ButtonOutlined from 'components/atom/Buttons/ButtonOutlined'
import ButtonRed from 'components/atom/Buttons/ButtonRed'
import {RootState} from 'redux/store'
import {useSelector} from 'react-redux'

interface propsSuccessModel {
  setIsCancelModalOpen: any
  subTitle?: string
}

const CancelModal: React.FC<propsSuccessModel> = (props) => {
  const navigation = useNavigate()
  const {patientId} = useParams()
  const {serviceConfig} = useSelector((state: RootState) => state.serviceConfiguration)
  const {
    setIsCancelModalOpen,
    subTitle = "You won't be able to set up the treatment form later unless the user signs up on the app and accepts your connection request",
  } = props

  const onPressBack = () => {
    setIsCancelModalOpen(false)
  }

  return (
    <ModalLayout>
      <div className='text-black text-2xl font-bold mt-4 text-center md:text-start  '>
        Are you sure you want to cancel?
      </div>
      <div className='w-auto h-auto mt-3 text-textColor text-base font-normal leading-snug text-center md:text-start'>
        {subTitle}
      </div>
      <div className='flex flex-row h-auto justify-between gap-6 mt-4'>
        <ButtonOutlined
          text='Go back'
          onClick={() => onPressBack()}
          className={'h-14 border-red text-red'}
        />
        <ButtonRed
          text='Yes, cancel'
          onClick={() => {
            if (serviceConfig?.PLANNING) {
              navigation(`/profile/${patientId}/plans`)
            } else {
              navigation(`/profile/${patientId}/plans-list`)
            }
          }}
        />
      </div>
    </ModalLayout>
  )
}

export default CancelModal
