import {useContext, useEffect} from 'react'
import AccessControlRoleHeader from './components/AccessControlRoleHeader'
import LeftListAccessControlRole from './components/LeftListAccessControlRole'
import RightViewPermissions from './components/RightViewPermissions'
import useDispatchAction from '@hooks/useDispatchAction'
import {safeParseInt} from 'utils/ConstFunctions'
import {
  getRolePermissionDetails,
  getRolesList,
  setPlanId,
  setSelectedAccessControlRole,
} from 'redux/Slices/AppSlice/accessControl/AccessControl.slice'
import {AuthContext} from 'context/AuthContext'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import {Spin} from 'antd'
import {optionType} from 'types/optionType'
import Spinner from 'components/spinner/Spinner'
import {Sub_Role_Data} from '../AccessControlList/types/accessControlList.types'
import {useSearchParams} from 'react-router-dom'

const AccessControlRoles = () => {
  const {dispatchAction} = useDispatchAction()
  const {userId} = useContext(AuthContext)
  const {planId, loadingRolesList, rolesList, selectedAccessControlRole} = useSelector(
    (state: RootState) => state.accessControl
  )

  const [searchParams] = useSearchParams()
  const id = searchParams.get('id')

  useEffect(() => {
    if (!planId) return
    dispatchAction(
      getRolesList({
        plan_id: safeParseInt(planId),
        doctor_id: safeParseInt(userId),
      })
    )
      .unwrap()
      .then((res: {defaultList: optionType[]; customRoleList: optionType[]}) => {
        const availableRoles = [...(res?.defaultList ?? []), ...(res?.customRoleList ?? [])]
        const requestedRoleId = id ? safeParseInt(id) : null
        const superAdminId = res?.defaultList?.find((role) => role.label === 'SUPER_ADMIN')?.value
        const hasRequestedRole = availableRoles.some((role) => role.value === requestedRoleId)

        if (requestedRoleId && hasRequestedRole) {
          dispatchAction(setSelectedAccessControlRole(requestedRoleId))
        } else {
          dispatchAction(setSelectedAccessControlRole(superAdminId))
        }
      })
  }, [planId])

  useEffect(() => {
    if (!id) return

    const availableRoles = [...(rolesList?.defaultList ?? []), ...(rolesList?.customRoleList ?? [])]
    const requestedRoleId = safeParseInt(id)
    const hasRequestedRole = availableRoles.some((role) => role.value === requestedRoleId)
    const superAdminId = rolesList?.defaultList?.find((role) => role.label === 'SUPER_ADMIN')?.value

    dispatchAction(setSelectedAccessControlRole(hasRequestedRole ? requestedRoleId : superAdminId))
  }, [id, rolesList])

  useEffect(() => {
    if (!selectedAccessControlRole) return
    dispatchAction(getRolePermissionDetails(safeParseInt(selectedAccessControlRole)))
      .unwrap()
      .then((res: Sub_Role_Data) => {
        dispatchAction(setPlanId(res?.plan_id))
      })
  }, [selectedAccessControlRole])

  return (
    <div className='flex flex-col gap-3 my-3'>
      <AccessControlRoleHeader />
      <Spin indicator={<Spinner loading />} spinning={loadingRolesList}></Spin>

      {rolesList && !loadingRolesList && (
        <div className='w-full flex gap-4'>
          <div className='w-1/4'>
            <LeftListAccessControlRole />
          </div>
          <div className='w-3/4'>
            <RightViewPermissions />
          </div>
        </div>
      )}
    </div>
  )
}

export default AccessControlRoles
