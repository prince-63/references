import {useContext, useEffect, useMemo} from 'react'
import {useNavigate} from 'react-router-dom'
import useAllUserPlan from '@hooks/useAllUserPlan'
import UserPlusIcon from 'assets/icons/UserPlusIcon'
import UsersIcon from 'assets/icons/UsersIcon'
import {AuthContext} from 'context/AuthContext'
import useDispatchAction from '@hooks/useDispatchAction'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import {getInvitationCountsByRoles} from 'redux/Slices/AppSlice/accessControl/AccessControl.slice'
import {safeParseInt} from 'utils/ConstFunctions'

const AccessControlOverview = () => {
  const navigate = useNavigate()
  const {isEnterprisePlanUser} = useAllUserPlan()
  const {userId, organizationId, profileId} = useContext(AuthContext)
  const {dispatchAction} = useDispatchAction()
  const {invitationCountsByRoles, loadingInvitationCountsByRoles} = useSelector(
    (state: RootState) => state.accessControl
  )

  useEffect(() => {
    if (!userId || !organizationId || !profileId) return
    dispatchAction(
      getInvitationCountsByRoles({
        doctor_id: safeParseInt(userId),
        organization_id: safeParseInt(organizationId),
        profile_id: safeParseInt(profileId),
      })
    )
  }, [dispatchAction, userId, organizationId, profileId])

  const totalUsersCount = useMemo(() => {
    const list = invitationCountsByRoles?.all_invitations ?? []
    return list
      .filter((item) => item.receiver_role === 'INTERNAL_USER')
      .reduce((sum, item) => sum + (item.active_count ?? 0), 0)
  }, [invitationCountsByRoles])

  const customersCount = useMemo(() => {
    const list = invitationCountsByRoles?.all_invitations ?? []
    return list
      .filter((item) => item.receiver_role === 'CONSULTING_ORTHODONTIST')
      .reduce((sum, item) => sum + (item.active_count ?? 0), 0)
  }, [invitationCountsByRoles])

  const labPartnersCount = useMemo(() => {
    const list = invitationCountsByRoles?.all_invitations ?? []
    return list
      .filter((item) => item.receiver_role === 'VENDOR')
      .reduce((sum, item) => sum + (item.active_count ?? 0), 0)
  }, [invitationCountsByRoles])

  const totalUsersDisplay = loadingInvitationCountsByRoles ? '-' : (totalUsersCount ?? 0)
  const customersDisplay = loadingInvitationCountsByRoles ? '-' : (customersCount ?? 0)
  const labPartnersDisplay = loadingInvitationCountsByRoles ? '-' : (labPartnersCount ?? 0)

  return (
    <div className='flex flex-col gap-6 my-6'>
      {/* Quick Actions Section */}
      <div>
        <div className='text-lg font-semibold text-neutralBlack mb-3'>Quick Actions</div>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          {/* Add User Card */}
          <div
            onClick={() => navigate('/add-access-control-user')}
            className='group cursor-pointer bg-white border-2 border-mediumGray rounded-xl p-6 hover:border-primaryColor hover:shadow-lg transition-all duration-200'
          >
            <div className='flex items-start gap-4'>
              <div className='w-12 h-12 bg-primarySupport rounded-lg flex items-center justify-center group-hover:bg-primaryColor transition-colors'>
                <div className='text-primaryColor group-hover:text-white transition-colors'>
                  <UserPlusIcon />
                </div>
              </div>
              <div className='flex-1'>
                <div className='text-base font-semibold text-neutralBlack mb-1 group-hover:text-primaryColor transition-colors'>
                  Add User
                </div>
                <div className='text-sm text-textColor'>
                  Invite team members to your organization
                </div>
              </div>
            </div>
          </div>

          {/* Add Customer Card */}
          {isEnterprisePlanUser && (
            <div
              onClick={() => navigate('/customers-add')}
              className='group cursor-pointer bg-white border-2 border-mediumGray rounded-xl p-6 hover:border-primaryColor hover:shadow-lg transition-all duration-200'
            >
              <div className='flex items-start gap-4'>
                <div className='w-12 h-12 bg-secondarySupport rounded-lg flex items-center justify-center group-hover:bg-secondaryColor transition-colors'>
                  <div className='text-secondaryColor group-hover:text-white transition-colors'>
                    <UsersIcon />
                  </div>
                </div>
                <div className='flex-1'>
                  <div className='text-base font-semibold text-neutralBlack mb-1 group-hover:text-primaryColor transition-colors'>
                    Add Customer
                  </div>
                  <div className='text-sm text-textColor'>
                    Connect with new customer organizations
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats Section */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <div className='bg-primarySupport rounded-xl p-5 border border-primaryColor/20'>
          <div className='text-sm text-textColor mb-1'>Total Users</div>
          <div className='text-2xl font-bold text-primaryColor'>{totalUsersDisplay}</div>
        </div>
        {isEnterprisePlanUser && (
          <>
            <div className='bg-secondarySupport rounded-xl p-5 border border-secondaryColor/20'>
              <div className='text-sm text-textColor mb-1'>Customers</div>
              <div className='text-2xl font-bold text-secondaryColor'>{customersDisplay}</div>
            </div>
            <div className='bg-tertiarySupport rounded-xl p-5 border border-tertiaryColor/20'>
              <div className='text-sm text-textColor mb-1'>Lab Partners</div>
              <div className='text-2xl font-bold text-tertiaryColor'>{labPartnersDisplay}</div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default AccessControlOverview
