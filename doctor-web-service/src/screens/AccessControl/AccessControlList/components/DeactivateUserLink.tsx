import useDispatchAction from '@hooks/useDispatchAction'
import ModalCard from 'components/modalCard/ModalCard'
import {AuthContext} from 'context/AuthContext'
import {useContext} from 'react'
import {useSelector} from 'react-redux'
import {
  addEditAccessControlUser,
  getAccessControlUserList,
} from 'redux/Slices/AppSlice/accessControl/AccessControl.slice'
import {RootState} from 'redux/store'
import {safeParseInt} from 'utils/ConstFunctions'

const DeactivateUserLink = ({
  id,
  openModal,
  setOpenModal,
}: {
  id: number
  openModal: boolean
  setOpenModal: (openModal: boolean) => void
}) => {
  const {userId} = useContext(AuthContext)
  const {dispatchAction} = useDispatchAction()
  const {dataAddingEditUser} = useSelector((state: RootState) => state.accessControl)

  const callDeactivate = () => {
    dispatchAction(
      addEditAccessControlUser({
        doctor_id: safeParseInt(userId),
        invitation_id: id,
        invitation_status: 'DEACTIVATED',
        first_name: dataAddingEditUser?.first_name,
        email: dataAddingEditUser?.email,
      })
    )
      .unwrap()
      .then(() => {
        const payload = {
          doctor_id: safeParseInt(userId),
          search: null,
          status: 'ALL',
          sub_role_id: null,
          page_number: 0,
          page_size: 10,
        }
        dispatchAction(getAccessControlUserList(payload))
        setOpenModal(false)
      })
  }
  return (
    <ModalCard
      title='Deactivate and withdraw access?'
      classNameTitle='text-center  px-4 pt-4'
      subTitleClassName='text-center px-4'
      subTitle='This will invalidate the unique invite link sent to the user and disable them from joining with it. Are you sure you want to continue?'
      okText='Deactivate'
      cancelText='Cancel'
      width='566px'
      drawerHeight='450px'
      open={openModal}
      onClick={() => {
        callDeactivate()
      }}
      onClose={() => {
        setOpenModal(false)
      }}
      classNameForOkButton='bg-red hover:!bg-red'
      classNameForCancelButton='border-red hover:!border-red hover:!text-red !text-red bg-redSupport hover:!bg-redSupport'
      showCrossButton={false}
      showFooter={true}
      classNameFooter='px-4 pb-4'
    ></ModalCard>
  )
}

export default DeactivateUserLink
