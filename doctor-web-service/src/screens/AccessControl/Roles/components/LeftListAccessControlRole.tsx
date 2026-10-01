import useDispatchAction from '@hooks/useDispatchAction'
import ExpandIcon from 'assets/icons/ExpandIcon'
import clsx from 'clsx'
import {useSelector} from 'react-redux'
import {useNavigate} from 'react-router-dom'
import {setSelectedAccessControlRole} from 'redux/Slices/AppSlice/accessControl/AccessControl.slice'
import {RootState} from 'redux/store'
import {optionType} from 'types/optionType'
import {getRole} from 'utils/ConstFunctions'
import getColorPalette from 'utils/getColorPalette'

const LeftListAccessControlRole = () => {
  const {rolesList, selectedAccessControlRole, loadingPermissionModule} = useSelector(
    (state: RootState) => state.accessControl
  )
  const {defaultList, customRoleList} = rolesList

  return (
    <div>
      <div className='font-semibold text-textColor text-xs uppercase mb-2'>Default roles</div>
      <div className='w-full flex flex-col gap-2'>
        {defaultList &&
          defaultList
            .filter((role) => role.label.trim() !== 'Customer (Without Tracking)')
            .map((role) => {
              return (
                <div key={role.value}>
                  <RoleSelections
                    role={role}
                    selectedAccessControlRole={selectedAccessControlRole}
                    disabled={loadingPermissionModule}
                  />
                </div>
              )
            })}
      </div>
      {customRoleList?.length > 0 && (
        <>
          <hr className='my-3' />
          <div className='font-semibold text-textColor text-xs uppercase  mb-2'>Custom roles</div>
          <div className='w-full flex flex-col gap-2'>
            {customRoleList &&
              customRoleList.map((role) => {
                return (
                  <div key={role.value}>
                    <RoleSelections
                      role={role}
                      selectedAccessControlRole={selectedAccessControlRole}
                      disabled={loadingPermissionModule}
                    />
                  </div>
                )
              })}
          </div>
        </>
      )}
    </div>
  )
}

export default LeftListAccessControlRole

const RoleSelections = ({
  role,
  selectedAccessControlRole,
  disabled,
}: {
  role: optionType
  selectedAccessControlRole: string | null
  disabled: boolean
}) => {
  const {dispatchAction} = useDispatchAction()
  const navigate = useNavigate()
  return (
    <button
      className={clsx(
        'w-full px-4 py-3 flex items-center justify-between border  rounded-lg font-medium',
        role.value === selectedAccessControlRole
          ? 'border-primaryColor text-primaryColor'
          : 'border-mediumGray '
      )}
      onClick={() => {
        dispatchAction(setSelectedAccessControlRole(role.value))
        navigate(`/access-control/roles?id=${role.value}`)
      }}
      disabled={disabled}
    >
      <span className='ml-1'>{getRole(role.label)}</span>
      <ExpandIcon
        color={
          role.value === selectedAccessControlRole ? getColorPalette().primaryColor : '#666666'
        }
        isActive={role.value === selectedAccessControlRole}
      />
    </button>
  )
}
