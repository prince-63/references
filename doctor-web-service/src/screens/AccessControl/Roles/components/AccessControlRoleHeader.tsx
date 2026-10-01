import {useFeatureAccess} from '@hooks/useFeatureAccess'
import PlusIcon from 'assets/icons/PlusIcon'
import When from 'components/when/When'
import {useNavigate} from 'react-router-dom'
import getColorPalette from 'utils/getColorPalette'

const AccessControlRoleHeader = () => {
  const navigate = useNavigate()
  const {permissionChecks} = useFeatureAccess()
  const isAccessible =
    permissionChecks?.rolesPermissions?.managingRolesPermissionsExceptAdminRole?.isAddable
  return (
    <div className='flex flex-col gap-3 my-3'>
      <div className='flex flex-wrap justify-between items-center gap-3'>
        <div>
          <div className='text-lg font-semibold w-fit'>Roles & Permissions</div>
          <div className='text-sm font-normal text-textColor'>
            Manage roles and their permissions.
          </div>
        </div>
        <When isTrue={isAccessible}>
          <button
            disabled={true}
            onClick={() => navigate('/add-custom-role')}
            className='md:w-fit w-full flex gap-2 items-center px-2 py-1 border border-grayDisabled text-grayDisabled rounded-lg text-base font-semibold'
          >
            <PlusIcon color={getColorPalette().grayDisabled} />
            <div>Add Custom Role</div>
          </button>
        </When>
      </div>
    </div>
  )
}

export default AccessControlRoleHeader
