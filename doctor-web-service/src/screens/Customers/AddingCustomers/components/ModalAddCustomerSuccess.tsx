import useDispatchAction from '@hooks/useDispatchAction'
import CheckedCircleOutlineIcon from 'assets/icons/CheckedCircleOutlineIcon'
import ModalCard from 'components/modalCard/ModalCard'
import {useSelector} from 'react-redux'
import {useNavigate} from 'react-router-dom'
import {
  setOpenModalAddingEditSuccessCustomer,
  setOpenModalInviteCustomer,
} from 'redux/Slices/AppSlice/Customers/customers.slice'
import {RootState} from 'redux/store'

const ModalAddCustomerSuccess = () => {
  const {dispatchAction} = useDispatchAction()
  const navigate = useNavigate()
  const {openModalAddingEditSuccessCustomer} = useSelector((state: RootState) => state.customers)

  return (
    <ModalCard
      title='Customer added successfully!'
      drawerHeight='300px'
      subTitle='You can send an invitation now, or do it later from the invitations tab on customers page.'
      okText='Invite customer'
      cancelText='Do it later'
      classNameFooter='mt-5'
      open={openModalAddingEditSuccessCustomer}
      onClick={() => {
        dispatchAction(setOpenModalAddingEditSuccessCustomer(false))
        dispatchAction(setOpenModalInviteCustomer(true))
      }}
      onClose={() => {
        dispatchAction(setOpenModalAddingEditSuccessCustomer(false))
        const queryParams = new URLSearchParams({
          invitation: 'true',
        }).toString()
        navigate(`/customers?${queryParams}`)
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

export default ModalAddCustomerSuccess
