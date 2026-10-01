import practiceSortingConstants from '@constants/practiceSorting.constants'
import useActiveProfile from '@hooks/useActiveProfile'
import useDispatchAction from '@hooks/useDispatchAction'
import ErrorToast from 'components/modal/Alert/ErrorToast'
import SuccessToast from 'components/modal/Alert/SuccessToast'
import ModalCard from 'components/modalCard/ModalCard'
import {AuthContext} from 'context/AuthContext'
import {useContext} from 'react'
import {useSelector} from 'react-redux'
import {getPracticesList} from 'redux/Slices/AppSlice/Practices/practices.slice'
import {acceptRequest, getLabsList, setOpenAcceptModal} from 'redux/Slices/AppSlice/Labs/labs.slice'
import {RootState} from 'redux/store'
import {Invitation} from 'screens/Labs/LabList/types/labs.types'
import {safeParseInt} from 'utils/ConstFunctions'
import useAllUserPlan from '@hooks/useAllUserPlan'
import {useNavigate} from 'react-router-dom'

const ModalConfirmAcceptInvitations = () => {
  const {dispatchAction} = useDispatchAction()
  const {userId, profileId, organizationId} = useContext(AuthContext)
  const {openAcceptModal, selectedLab} = useSelector((state: RootState) => state.labs)
  const {activeProfile} = useActiveProfile()
  const {isGrowthPlanUser, isPractice} = useAllUserPlan()
  const navigate = useNavigate()

  const acceptInvitation = async (invitation: Invitation) => {
    await dispatchAction(
      acceptRequest({
        email: invitation.email?.toLocaleLowerCase(),
        mobile_no: invitation.mobile_no,
        country_code: invitation.country_code,
        first_name: invitation.first_name,
        last_name: invitation.last_name,
        salutation: invitation.salutation,
        registration_type: invitation.registration_type,
        invitation_code: invitation.invitation_code,
        doctor_id: safeParseInt(userId),
        is_on_board_screen_visited: false,
        brand: '',
      })
    )
      .unwrap()
      .then(async () => {
        SuccessToast('Invitation accepted successfully!')
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
            isPractice: isPractice,
          })
        )

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
        navigate('/access-control/labs?tab=connected')
      })
      .catch((error: string) => {
        if (error === 'IN0002') {
          ErrorToast('This invitation has been expired')
        }
      })
  }

  return (
    <ModalCard
      title='Accept invitation?'
      drawerHeight='300px'
      subTitle='After accepting the invite, you can place orders to the Lab.'
      okText='Accept'
      cancelText='Go back'
      classNameForCancelButton='bg-primarySupport border-primaryColor !text-primaryColor font-semibold'
      classNameForOkButton=' font-semibold'
      classNameForBox='text-center p-4'
      open={openAcceptModal}
      onClick={() => {
        dispatchAction(setOpenAcceptModal(false))
        acceptInvitation(selectedLab)
      }}
      onClose={() => {
        dispatchAction(setOpenAcceptModal(false))
      }}
      showCrossButton={false}
      showFooter={true}
    />
  )
}

export default ModalConfirmAcceptInvitations
