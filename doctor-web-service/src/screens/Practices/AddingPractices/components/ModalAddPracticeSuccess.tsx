import useDispatchAction from '@hooks/useDispatchAction'
import CheckedCircleOutlineIcon from 'assets/icons/CheckedCircleOutlineIcon'
import ModalCard from 'components/modalCard/ModalCard'
import {useSelector} from 'react-redux'
import {useNavigate} from 'react-router-dom'
import {
  setOpenModalAddingEditSuccessPractice,
  setOpenModalInvitePractice,
} from 'redux/Slices/AppSlice/Practices/practices.slice'
import {RootState} from 'redux/store'

const ModalAddPracticeSuccess = () => {
  const {dispatchAction} = useDispatchAction()
  const navigate = useNavigate()
  const {openModalAddingEditSuccessPractice} = useSelector((state: RootState) => state.practices)

  return (
    <ModalCard
      title='Practice added successfully!'
      drawerHeight='300px'
      subTitle='You can send an invitation now, or do it later from the invitations tab on practices page.'
      okText='Invite practice'
      cancelText='Do it later'
      classNameFooter='mt-5'
      open={openModalAddingEditSuccessPractice}
      onClick={() => {
        dispatchAction(setOpenModalAddingEditSuccessPractice(false))
        dispatchAction(setOpenModalInvitePractice(true))
      }}
      onClose={() => {
        dispatchAction(setOpenModalAddingEditSuccessPractice(false))
        const queryParams = new URLSearchParams({
          invitation: 'true',
        }).toString()
        navigate(`/practices?${queryParams}`)
      }}
      HeaderIcon={
        <div className='w-16 h-16 rounded-full bg-tertiarySupport flex justify-center items-center'>
          <CheckedCircleOutlineIcon />
        </div>
      }
      showCrossButton={false}
      showFooter={true}
    />
  )
}

export default ModalAddPracticeSuccess
