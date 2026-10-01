import rolesConstants from '@constants/roles.constants'
import useDispatchAction from '@hooks/useDispatchAction'
import ErrorToast from 'components/modal/Alert/ErrorToast'
import SuccessToast from 'components/modal/Alert/SuccessToast'
import Page from 'components/page/Page'
import {AuthContext} from 'context/AuthContext'
import {useContext, useEffect, useMemo, useState} from 'react'
import {useSelector} from 'react-redux'
import {
  createCaseTeam,
  CreateCaseTeamRequest,
  getCaseTeams,
} from 'redux/Slices/AppSlice/CaseTeam/caseTeam.slice'
import {getUsersList as getSettingsUsersList} from 'redux/Slices/AppSlice/settings/settings.slice'
import {RootState} from 'redux/store'
import {Invitation} from 'screens/Labs/LabList/types/labs.types'
import ContainerWrapper from '../components/ContainerWrapper'
import CaseTeamsTable from './components/CaseTeamsTable'
import CreateCaseTeamModal from './components/CreateCaseTeamModal'
import {InternalUserOption} from './caseTeam.types'

const CASE_TEAMS_PAGE_SIZE = 20

const mapInvitationToInternalUser = (user: Invitation): InternalUserOption => {
  const fullName = `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim()

  return {
    user_profile_id: user.profile_id,
    name: user.display_name || fullName || user.email,
    email: user.email,
    role: user.invitation_role,
  }
}

const CaseTeamPage = () => {
  const {dispatchAction} = useDispatchAction()
  const {userId} = useContext(AuthContext)
  const {loadingUserList, dataUserList} = useSelector((state: RootState) => state.settings)
  const {caseTeamsData, getCaseTeamsLoading, createCaseTeamLoading} = useSelector(
    (state: RootState) => state.caseTeam
  )

  const [pageNumber, setPageNumber] = useState(1)
  const [openCreateModal, setOpenCreateModal] = useState(false)

  const internalUsers = useMemo(() => {
    const users = (dataUserList?.doctor_invitation_details_list ?? [])
      .map((user: Invitation) => mapInvitationToInternalUser(user))
      .filter((user) => Boolean(user.user_profile_id))

    const uniqueByProfileId = new Map<number, InternalUserOption>()
    users.forEach((user) => {
      uniqueByProfileId.set(user.user_profile_id, user)
    })

    return Array.from(uniqueByProfileId.values())
  }, [dataUserList?.doctor_invitation_details_list])

  const caseTeams = caseTeamsData?.teams ?? []
  const totalCaseTeams = caseTeamsData?.pagination_details?.total_patients ?? 0
  const pageSize = caseTeamsData?.pagination_details?.page_size ?? CASE_TEAMS_PAGE_SIZE

  const fetchCaseTeams = async (page: number) => {
    await dispatchAction(
      getCaseTeams({
        page: Math.max(page - 1, 0),
        size: CASE_TEAMS_PAGE_SIZE,
      })
    )
  }

  useEffect(() => {
    if (!userId) return

    dispatchAction(
      getSettingsUsersList({
        doctor_id: String(userId),
        page_number: 0,
        page_size: 200,
        invitation_roles: [rolesConstants.INTERNAL_USER],
        sort_order: 'ADDED_ON_NEWEST_TO_OLDEST',
        invitation_status: 'ACCEPTED',
      })
    )

    fetchCaseTeams(1)
  }, [dispatchAction, userId])

  const handleOnSearch = async ({page = 1}: {page?: number}) => {
    setPageNumber(page)
    await fetchCaseTeams(page)
  }

  const handleCreateCaseTeam = async (payload: CreateCaseTeamRequest) => {
    try {
      await dispatchAction(createCaseTeam(payload)).unwrap()
      SuccessToast('Case team created successfully')
      setOpenCreateModal(false)
      setPageNumber(1)
      await fetchCaseTeams(1)
    } catch (error: any) {
      ErrorToast(error?.message || 'Unable to create case team')
      throw error
    }
  }

  return (
    <Page loading={false}>
      <div className='flex flex-col gap-8 md:w-3/4'>
        <ContainerWrapper
          title='Case Team'
          subTitle='Create and manage internal case teams for patient workflows.'
          buttonText='Create Case Team'
          onClickButton={() => setOpenCreateModal(true)}
          showButton
          extraButtonDisable={loadingUserList}
        >
          <CaseTeamsTable
            caseTeams={caseTeams}
            loading={getCaseTeamsLoading}
            pageNumber={pageNumber}
            pageSize={pageSize}
            totalCaseTeams={totalCaseTeams}
            onPageChange={handleOnSearch}
          />
        </ContainerWrapper>
      </div>

      <CreateCaseTeamModal
        open={openCreateModal}
        loading={createCaseTeamLoading}
        internalUsers={internalUsers}
        onClose={() => setOpenCreateModal(false)}
        onCreateCaseTeam={handleCreateCaseTeam}
      />
    </Page>
  )
}

export default CaseTeamPage
