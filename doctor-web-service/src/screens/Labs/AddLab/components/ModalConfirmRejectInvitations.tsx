import practiceSortingConstants from '@constants/practiceSorting.constants'
import rolesConstants from '@constants/roles.constants'
import useActiveProfile from '@hooks/useActiveProfile'
import useDispatchAction from '@hooks/useDispatchAction'
import SuccessToast from 'components/modal/Alert/SuccessToast'
import ModalCard from 'components/modalCard/ModalCard'
import {AuthContext} from 'context/AuthContext'
import {useContext} from 'react'
import {useSelector} from 'react-redux'
import {getPracticesList} from 'redux/Slices/AppSlice/Practices/practices.slice'
import {getLabsList, rejectRequest, setOpenRejectModal} from 'redux/Slices/AppSlice/Labs/labs.slice'
import {RootState} from 'redux/store'
import {Invitation} from 'screens/Labs/LabList/types/labs.types'
import useAllUserPlan from '@hooks/useAllUserPlan'
import {safeParseInt} from 'utils/ConstFunctions'

const ModalConfirmRejectInvitations = () => {
  const {dispatchAction} = useDispatchAction()
  const {openRejectModal, selectedLab} = useSelector((state: RootState) => state.labs)
  const {userId, profileId, organizationId} = useContext(AuthContext)
  const {activeProfile} = useActiveProfile()
  const {isGrowthPlanUser} = useAllUserPlan()

  const rejectInvitation = async (invitation: Invitation) => {
    await dispatchAction(
      rejectRequest({
        invitation_id: invitation.invitation_id,
      })
    ).unwrap()
    SuccessToast('Invitation rejected successfully!')
    if (invitation.invitation_role === rolesConstants.VENDOR) {
      dispatchAction(
        getLabsList({
          payload: {
            doctor_id: userId ?? '',
            invitation_status: isGrowthPlanUser ? 'ALL' : 'PENDING',
            page_number: 0,
            page_size: 10,
            search: null,
            sort_order: 'ADDED_ON_NEWEST_TO_OLDEST',
          },
          roles: activeProfile.roles,
        })
      )
    } else {
      dispatchAction(
        getPracticesList({
          doctor_id: safeParseInt(userId),
          profile_id: safeParseInt(profileId),
          organization_id: safeParseInt(organizationId),
          invitation_status: 'PENDING',
          sort_order: practiceSortingConstants.ADDED_ON_NEWEST_TO_OLDEST,
          page_number: 0,
          page_size: 10,
          search: null,
          invitation_roles: [
            'CONSULTING_ORTHODONTIST',
            'ENTERPRISE_CUSTOMER',
            'GROWTH_CUSTOMER',
            'PRACTICE_CUSTOMER',
          ],
        })
      )
    }
  }
  return (
    <ModalCard
      title='Reject invitation?'
      drawerHeight='300px'
      subTitle='This will disable you from placing orders to this Lab unless invited again. Reject anyway?'
      okText='Reject'
      cancelText='Go back'
      classNameForBox='text-center px-4 pt-4'
      classNameForCancelButton='bg-redSupport border-red !text-red  font-semibold'
      classNameForOkButton='!bg-red !text-white  font-semibold '
      open={openRejectModal}
      onClick={() => {
        dispatchAction(setOpenRejectModal(false))
        rejectInvitation(selectedLab)
      }}
      onClose={() => {
        dispatchAction(setOpenRejectModal(false))
      }}
      showCrossButton={false}
      showFooter={true}
    />
  )
}

export default ModalConfirmRejectInvitations
