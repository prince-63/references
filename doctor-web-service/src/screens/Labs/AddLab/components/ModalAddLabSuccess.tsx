import useDispatchAction from '@hooks/useDispatchAction'
import CheckedCircleOutlineIcon from 'assets/icons/CheckedCircleOutlineIcon'
import ModalCard from 'components/modalCard/ModalCard'
import {useSelector} from 'react-redux'
import {useNavigate} from 'react-router-dom'
import {
  setOpenModalAddingEditSuccessLab,
  setOpenModalInviteLab,
} from 'redux/Slices/AppSlice/Labs/labs.slice'
import {RootState} from 'redux/store'

const ModalAddLabSuccess = () => {
  const {dispatchAction} = useDispatchAction()
  const navigate = useNavigate()
  const {openModalAddingEditSuccessLab} = useSelector((state: RootState) => state.labs)

  return (
    <ModalCard
      title='Lab added successfully!'
      drawerHeight='300px'
      subTitle='You can send an invitation now, or do it later from the invitations tab on labs page.'
      okText='Invite lab'
      cancelText='Do it later'
      classNameFooter='mt-5'
      open={openModalAddingEditSuccessLab}
      onClick={() => {
        dispatchAction(setOpenModalAddingEditSuccessLab(false))
        dispatchAction(setOpenModalInviteLab(true))
        navigate(`/settings/labs`)
      }}
      onClose={() => {
        dispatchAction(setOpenModalAddingEditSuccessLab(false))
        navigate(`/settings/labs`)
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

export default ModalAddLabSuccess
