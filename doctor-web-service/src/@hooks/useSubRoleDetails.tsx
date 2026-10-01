import {extractSubModulesWithPermissions, safeParseInt} from 'utils/ConstFunctions'
import useDispatchAction from './useDispatchAction'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import {useContext, useEffect} from 'react'
import {AuthContext} from 'context/AuthContext'
import {
  getUsersPermissions,
  setPlanId,
  setSelectedTableAccessControls,
} from 'redux/Slices/AppSlice/accessControl/AccessControl.slice'
import {Sub_Role_Data} from 'screens/AccessControl/AccessControlList/types/accessControlList.types'

const useSubRoleDetails = (getFreshData: boolean = false) => {
  const {dispatchAction} = useDispatchAction()
  const {loadingUsersPermissions, usersPermissions} = useSelector(
    (state: RootState) => state.accessControl
  )
  const {subRoleId} = useContext(AuthContext)

  useEffect(() => {
    if (!getFreshData || !subRoleId) return
    dispatchAction(getUsersPermissions(safeParseInt(subRoleId)))
      .unwrap()
      .then((res: Sub_Role_Data) => {
        dispatchAction(setPlanId(res.plan_id))
        const checkedSubModules = extractSubModulesWithPermissions(res, false)
        dispatchAction(setSelectedTableAccessControls(checkedSubModules))
      })
  }, [getFreshData, subRoleId, dispatchAction])

  return {loadingPermissionModule: loadingUsersPermissions, permissionModule: usersPermissions}
}

export default useSubRoleDetails
