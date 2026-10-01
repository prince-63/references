import React, {useCallback} from 'react'
import './PermissionTable.css'
import {PermissionSubModule} from 'screens/AccessControl/AccessControlList/types/accessControlList.types'
import {useSearchParams} from 'react-router-dom'
import {RootState} from 'redux/store'
import {useSelector} from 'react-redux'
import useDispatchAction from '@hooks/useDispatchAction'
import {
  setEditTableAccessControls,
  setSelectedTableAccessControls,
} from 'redux/Slices/AppSlice/accessControl/AccessControl.slice'

const PERMISSION_TYPES = ['VIEW', 'ADD', 'EDIT', 'DELETE'] as const
type Permission = (typeof PERMISSION_TYPES)[number]

type Props = {
  modules: PermissionSubModule[]
  isNotViewable: boolean
}

const PermissionTable: React.FC<Props> = ({modules, isNotViewable}) => {
  const [searchParams] = useSearchParams()
  const {dispatchAction} = useDispatchAction()
  const isEdit = searchParams.get('edit') === 'true'
  const isDefineDefault = searchParams.get('isDefineDefault') === 'true'

  const {selectedTableAccessControls, editTableAccessControls} = useSelector(
    (state: RootState) => state.accessControl
  )

  const modulePermissions = isEdit ? editTableAccessControls : selectedTableAccessControls

  const handlePermission = useCallback(
    (id: number, permission: Permission, value: boolean) => {
      const updatedModules = modulePermissions.map((module) => {
        if (module.id !== id) return module

        let updatedPermissions = [...module.permissions]

        if (value) {
          // ✅ Add permission
          if (!updatedPermissions.includes(permission)) {
            updatedPermissions.push(permission)
          }

          // Rule: ADD or EDIT requires VIEW
          if (
            (permission === 'ADD' || permission === 'EDIT') &&
            !updatedPermissions.includes('VIEW')
          ) {
            updatedPermissions.push('VIEW')
          }
        } else {
          updatedPermissions = updatedPermissions.filter((perm) => perm !== permission)

          // Rule: If VIEW is unchecked, remove ADD & EDIT too
          if (permission === 'VIEW') {
            updatedPermissions = updatedPermissions.filter(
              (perm) => perm !== 'ADD' && perm !== 'EDIT'
            )
          }
        }

        return {
          ...module,
          permissions: updatedPermissions,
        }
      })

      dispatchAction(setEditTableAccessControls(updatedModules))
      dispatchAction(setSelectedTableAccessControls(updatedModules))
    },
    [dispatchAction, modulePermissions]
  )

  return (
    <table className='permission-table'>
      <thead>
        <tr>
          <th className='module-header'>MODULE</th>
          {PERMISSION_TYPES.map((perm) => (
            <th key={perm} className='perm-header'>
              {perm.replace('_', ' ')}
            </th>
          ))}
        </tr>
      </thead>
      {isDefineDefault ? (
        <tbody>
          {modules.map((mod) => {
            const editModule = editTableAccessControls.find((m) => m.id === mod.id)

            return (
              <tr key={mod.id}>
                <td className='module-name'>{mod.name}</td>
                {PERMISSION_TYPES.map((perm) => {
                  const isChecked = editModule?.permissions.includes(perm) ?? false
                  return (
                    <td key={perm} className='perm-cell'>
                      <div>
                        <input
                          type='checkbox'
                          className='green-checkbox'
                          checked={isChecked}
                          onChange={(e: any) => handlePermission(mod.id, perm, e.target.checked)}
                        />
                      </div>
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      ) : (
        <tbody>
          {modules.map((mod) => {
            const editModule = editTableAccessControls.find((m) => m.id === mod.id)

            return (
              <tr key={mod.id}>
                <td className='module-name'>{mod.name}</td>
                {PERMISSION_TYPES.map((perm) => {
                  const hasPermission = mod.permissions.includes(perm)
                  const isChecked = editModule?.permissions.includes(perm) ?? false

                  return (
                    <td key={perm} className='perm-cell'>
                      {hasPermission ? (
                        <div>
                          {isEdit ? (
                            <input
                              type='checkbox'
                              className='green-checkbox'
                              checked={isChecked}
                              onChange={(e: any) =>
                                handlePermission(mod.id, perm, e.target.checked)
                              }
                            />
                          ) : (
                            <>
                              {isNotViewable ? (
                                <input
                                  type='checkbox'
                                  className='green-checkbox'
                                  onChange={(e: any) =>
                                    handlePermission(mod.id, perm, e.target.checked)
                                  }
                                />
                              ) : (
                                <input
                                  type='checkbox'
                                  checked
                                  readOnly
                                  className='green-checkbox'
                                />
                              )}
                            </>
                          )}
                        </div>
                      ) : (
                        <span className='na-text'>NA</span>
                      )}
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      )}
    </table>
  )
}

export default PermissionTable
