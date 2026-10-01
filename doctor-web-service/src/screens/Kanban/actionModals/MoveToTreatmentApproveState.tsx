import {Modal} from 'antd'
import clsx from 'clsx'
import AntdButton from 'components/atom/Buttons/AntdButton'
import {useDispatch, useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import {useNavigate} from 'react-router-dom'

import {setIsOpenTreatmentApproveModal} from 'redux/Slices/AppSlice/Kanban/Kanban.slice'

const MoveToTreatmentApproveState = () => {
  const {isOpenTreatmentApproveModal, cardDetails, dynamicLabel} = useSelector(
    (state: RootState) => state.kanban
  )
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleCloseModal = () => {
    dispatch(setIsOpenTreatmentApproveModal(false))
  }

  const handleCreateTreatmentPlan = () => {
    handleCloseModal()

    navigate(`/profile/${cardDetails?.patient_id}/plans-list`)
  }

  return (
    <Modal
      closable={true}
      onCancel={() => handleCloseModal()}
      destroyOnClose={true}
      centered={true}
      open={isOpenTreatmentApproveModal}
      className={clsx('md:w-[566px] w-full')}
      maskClosable={false}
      width={566}
      footer={null}
    >
      <div className='flex flex-col items-center gap-6 py-8 px-6'>
        <div className='text-2xl font-bold text-gray-900 text-center'>No Plan Found</div>

        <div className='text-base text-gray-600 text-center max-w-md'>
          {`This case cannot be moved to ${dynamicLabel} because there are no
          treatment plans yet.`}
        </div>
        <div className='flex flex-row gap-4 w-full mt-4'>
          <AntdButton
            className='flex-1 h-12 rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
            text='Cancel'
            htmlType='button'
            onClick={handleCloseModal}
          />
          <AntdButton
            className='flex-1 h-12 rounded-lg text-white !bg-primaryColor hover:!primaryColor'
            text='View Treatment Plans'
            htmlType='button'
            onClick={handleCreateTreatmentPlan}
          />
        </div>
      </div>
    </Modal>
  )
}

export default MoveToTreatmentApproveState
