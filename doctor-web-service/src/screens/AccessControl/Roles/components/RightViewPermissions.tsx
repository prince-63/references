import useDispatchAction from '@hooks/useDispatchAction'
import PencilIcon from 'assets/icons/PencilIcon'
import Tag from 'components/tags/Tag'
import {useSelector} from 'react-redux'
import {useNavigate} from 'react-router-dom'
import {
  setEditModuleData,
  setEditTableAccessControls,
} from 'redux/Slices/AppSlice/accessControl/AccessControl.slice'
import {RootState} from 'redux/store'
import {extractSubModulesWithPermissions, getRole} from 'utils/ConstFunctions'
import getColorPalette from 'utils/getColorPalette'
import CollapsibleSelectPermission from './CollapsibleSelectPermission'
import Spinner from 'components/spinner/Spinner'
import {Spin} from 'antd'
import {useFeatureAccess} from '@hooks/useFeatureAccess'

const RightViewPermissions = () => {
  const navigate = useNavigate()
  const {dispatchAction} = useDispatchAction()
  const {permissionModule, loadingPermissionModule} = useSelector(
    (state: RootState) => state.accessControl
  )
  const {permissionChecks} = useFeatureAccess()
  const isAccessible =
    permissionChecks?.rolesPermissions?.managingRolesPermissionsExceptAdminRole?.isEditable
  return (
    <div className='w-full flex flex-col justify-center items-center'>
      <Spin indicator={<Spinner loading />} spinning={loadingPermissionModule}></Spin>
      {!loadingPermissionModule && permissionModule && (
        <div className='w-full flex flex-col gap-3 my-3'>
          <div className='flex flex-wrap justify-between items-center gap-3'>
            <div>
              <div className='flex gap-2 items-center text-2xl font-semibold w-fit'>
                <div>{getRole(permissionModule?.name)}</div>
                <Tag
                  value={
                    permissionModule?.sub_role_tag === 'CUSTOM' ? 'Custom Role' : 'Default Role'
                  }
                  className='text-xs bg-lightGray text-textColor rounded-full'
                />
              </div>
              <div className='text-sm font-normal text-textColor'>
                {permissionModule?.description}
              </div>
            </div>
            {permissionModule?.sub_role_tag === 'CUSTOM' && isAccessible && (
              <button
                onClick={() => {
                  dispatchAction(setEditModuleData(permissionModule))
                  const checkedSubModules = extractSubModulesWithPermissions(permissionModule, true)
                  dispatchAction(setEditTableAccessControls(checkedSubModules))
                  const queryParams = new URLSearchParams({
                    edit: 'true',
                  }).toString()
                  navigate(`/add-custom-role?${queryParams}`)
                }}
                className='md:w-fit w-full flex gap-1 items-center px-2 py-1  border border-mediumGray text-textColor rounded-lg text-base font-semibold'
              >
                <PencilIcon color={getColorPalette().textColor} />
                <div>Edit</div>
              </button>
            )}
          </div>
          <div>
            {permissionModule?.modules.map((module) => {
              return (
                <div key={module.id} className='flex flex-col gap-3'>
                  <CollapsibleSelectPermission
                    module={module.name}
                    module_description={module?.description}
                    module_permission={module?.sub_modules}
                  />
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default RightViewPermissions
