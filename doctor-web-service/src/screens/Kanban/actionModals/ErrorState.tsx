import {Modal} from 'antd'
import clsx from 'clsx'
import {useSelector, useDispatch} from 'react-redux'
import {
  clearCardDetails,
  getPatientTaskTrackerFiltered,
  setIsOpenErrorModal,
} from 'redux/Slices/AppSlice/Kanban/Kanban.slice'
import {RootState} from 'redux/store'
import {safeParseInt} from 'utils/ConstFunctions'
import useDispatchAction from '@hooks/useDispatchAction'
import {useContext} from 'react'
import {AuthContext} from 'context/AuthContext'
import When from 'components/when/When'

const ErrorMessageModal = () => {
  const dispatch = useDispatch()
  const {isOpenErrorModal, cardDetails} = useSelector((state: RootState) => state.kanban)
  const {dispatchAction} = useDispatchAction()
  const {userId} = useContext(AuthContext)

  const onClose = () => {
    dispatchAction(
      getPatientTaskTrackerFiltered({
        doctor_id: safeParseInt(userId),
        order_type: 'ALIGNER',
        workflow_name: cardDetails.workflow_name == '' ? 'New Case' : cardDetails.workflow_name,
        page_number: 0,
        page_size: 10,
         sort:'UPDATED_ON',
         "order": "DESC"
      })
    )
      .unwrap()
      .then(() => {
        dispatch(setIsOpenErrorModal({isOpen: false, text: '', showText: true}))
        dispatch(clearCardDetails())
      })
  }

  return (
    <Modal
      closable={false}
      destroyOnClose
      centered
      open={isOpenErrorModal?.isOpen}
      className={clsx('md:w-[480px] w-full')}
      maskClosable={false}
      width={480}
      footer={null}
    >
      <div className='flex flex-col items-center  gap-4 pt-8 px-4'>
        <div className='flex items-center gap-2 text-red-600 font-semibold text-xl'>
          <span>🚫 Action Not Allowed</span>
        </div>

        <div className='text-gray-700 text-base items-center text-center leading-relaxed mt-2 whitespace-pre-line'>
          {isOpenErrorModal?.text}
        </div>

        <When isTrue={isOpenErrorModal?.showText}>
          <div className='text-gray-700 text-base leading-relaxed items-center text-center mt-6 whitespace-pre-line'>
            Please continue from the current stage or contact an admin if a correction is required.
          </div>
        </When>

        <button
          onClick={onClose}
          className=' bg-primaryColor w-full  text-white font-medium rounded-md px-2 py-2.5 transition-all'
        >
          Understood
        </button>
      </div>
    </Modal>
  )
}

export default ErrorMessageModal
