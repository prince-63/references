import {useContext} from 'react'
import SuccessToast from 'components/modal/Alert/SuccessToast'
import {getSalutations, safeParseInt} from 'utils/ConstFunctions'
import useDispatchAction from '@hooks/useDispatchAction'
import {RootState} from 'redux/store'
import {useSelector} from 'react-redux'
import {AuthContext} from 'context/AuthContext'
import {useNavigate} from 'react-router-dom'
import ModalCard from 'components/modalCard/ModalCard'
import {
  addEditAccessControlUser,
  setOpenSuccessUserAdded,
} from 'redux/Slices/AppSlice/accessControl/AccessControl.slice'

const ModalInviteUser = () => {
  const navigate = useNavigate()
  const {openSuccessUserAdded, dataAddingEditUser} = useSelector(
    (state: RootState) => state.accessControl
  )
  const {userId} = useContext(AuthContext)
  const {dispatchAction} = useDispatchAction()

  const handleSubmit = async () => {
    try {
      await dispatchAction(
        addEditAccessControlUser({
          doctor_id: safeParseInt(userId),
          email: dataAddingEditUser.email,
          first_name: dataAddingEditUser.first_name ?? '',
          last_name: dataAddingEditUser.last_name,
          display_name: [
            getSalutations(dataAddingEditUser.salutation ?? '').trim(),
            dataAddingEditUser.first_name,
            dataAddingEditUser.last_name,
          ]
            .map((value) => (value ?? '').toString().trim())
            .filter(Boolean)
            .join(' '),
          mobile_no: dataAddingEditUser.mobile_number,
          country_code: dataAddingEditUser.country_code ?? '+91',
          salutation: dataAddingEditUser.salutation,
          invitation_id: dataAddingEditUser.invitation_id,
          is_invitation_send: true,
          sub_role_id: safeParseInt(dataAddingEditUser.sub_role_id),
          is_tracking_enabled: false,
          is_stl_file_view_enabled: false,
          is_print_file_view_enabled: false,
          is_scan_file_view_enabled: false,
        })
      )
        .unwrap()
        .then(() => {
          dispatchAction(setOpenSuccessUserAdded(false))
          SuccessToast('Invite sent successfully!')
          navigate(`/access-control/`)
        })
    } catch (error) {
      throw error
    }
  }

  return (
    <ModalCard
      title='Send invite?'
      subTitle='Once sent, the first name and email can’t be changed. You can always deactivate and send a new invite later if needed.'
      className='text-center !p-4'
      okText='Send invite'
      cancelText='Cancel'
      width='566px'
      drawerHeight='450px'
      open={openSuccessUserAdded}
      onClick={() => {
        handleSubmit()
      }}
      onClose={() => {
        dispatchAction(setOpenSuccessUserAdded(false))

        navigate(`/access-control/`)
      }}
      showCrossButton={false}
      showFooter={true}
    ></ModalCard>
  )
}

export default ModalInviteUser
