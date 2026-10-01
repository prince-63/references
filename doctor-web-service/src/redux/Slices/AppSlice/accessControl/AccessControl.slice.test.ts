jest.mock('utils/ConstFunctions', () => ({
  getRole: (role: string) => role,
}))
jest.mock('utils/storage', () => ({
  getStorageType: () => ({getItem: () => null}),
}))

import AccessControlSlice, {
  addCustomRole,
  editCustomRole,
  getAccessControlUserList,
  getAuditLogsList,
  getRolePermissionDetails,
  getRolesList,
  getRolesOptionList,
  getUsersPermissions,
  setAllResetFilter,
  setDataAddingEditUser,
  setEditModuleData,
  setEditTableAccessControls,
  setOpenSuccessUserAdded,
  setPlanId,
  setSelectedAccessControlRole,
  setSelectedRole,
  setSelectedStatus,
  setSelectedTableAccessControls,
  updateAssignee,
} from './AccessControl.slice'

const reducer = AccessControlSlice.reducer

describe('AccessControl.slice', () => {
  const baseState = reducer(undefined, {type: 'init'})

  it('initializes with defaults', () => {
    expect(baseState.loadingList).toBe(false)
    expect(baseState.selectedStatus).toBe('ALL')
    expect(baseState.selectedRole).toBe(0)
  })

  it('updates basic selection reducers', () => {
    const withRole = reducer(baseState, setSelectedRole(5))
    expect(withRole.selectedRole).toBe(5)

    const withStatus = reducer(withRole, setSelectedStatus('ACTIVE'))
    expect(withStatus.selectedStatus).toBe('ACTIVE')

    const reset = reducer(withStatus, setAllResetFilter('RESET'))
    expect(reset.selectedRole).toBe('RESET')
    expect(reset.selectedStatus).toBe('RESET')

    const success = reducer(reset, setOpenSuccessUserAdded(true))
    expect(success.openSuccessUserAdded).toBe(true)

    const plan = reducer(success, setPlanId(11))
    expect(plan.planId).toBe(11)
  })

  it('stores table/module selections and user edit data', () => {
    const accessControls = [{id: 1}] as any
    const tableState = reducer(baseState, setSelectedTableAccessControls(accessControls))
    expect(tableState.selectedTableAccessControls).toEqual(accessControls)

    const editControls = reducer(tableState, setEditTableAccessControls([{id: 9}] as any))
    expect(editControls.editTableAccessControls[0].id).toBe(9)

    const moduleData = {id: 7} as any
    const moduleState = reducer(editControls, setEditModuleData(moduleData))
    expect(moduleState.editModuleData).toEqual(moduleData)

    const userRow = {name: 'User'} as any
    const dataState = reducer(moduleState, setDataAddingEditUser(userRow))
    expect(dataState.dataAddingEditUser).toEqual(userRow)

    const selectedRole = reducer(dataState, setSelectedAccessControlRole(21))
    expect(selectedRole.selectedAccessControlRole).toBe(21)
  })

  it('handles user list and audit logs fulfillment', () => {
    const listPayload = {
      users: [],
      pagination_details: {
        page_number: 1,
        page_size: 10,
        total_patients: 0,
        total_pages: 0,
        has_next: false,
        has_previous: false,
      },
    }
    const listState = reducer(
      {...baseState, loadingList: true},
      getAccessControlUserList.fulfilled(listPayload as any, 'req', {} as any)
    )
    expect(listState.userList).toEqual(listPayload)
    expect(listState.loadingList).toBe(false)

    const auditPayload = {
      audit_logs: [],
      pagination: {
        has_next: false,
        has_previous: false,
        page_number: 1,
        page_size: 10,
        total_pages: 0,
        total_patients: 0,
      },
    }
    const auditState = reducer(
      {...baseState, loadingAuditLogList: true},
      getAuditLogsList.fulfilled(auditPayload as any, 'req', {} as any)
    )
    expect(auditState.auditLogList).toEqual(auditPayload)
    expect(auditState.loadingAuditLogList).toBe(false)
  })

  it('stores role options and defaults selected sub-role id', () => {
    const payload = {
      list: [{value: 1, label: 'Manager', subLabel: 'desc'}],
      subRoles: [
        {
          id: 99,
          name: 'SUPER_ADMIN',
          description: '',
          sub_role_tag: 'DEFAULT',
          modules: [],
          cloned_from_sub_role: null,
        },
        {
          id: 2,
          name: 'User',
          description: '',
          sub_role_tag: 'CUSTOM',
          modules: [],
          cloned_from_sub_role: null,
        },
      ],
    }

    const rolesState = reducer(
      {...baseState, loadingRoles: true},
      getRolesOptionList.fulfilled(payload as any, 'req', {plan_id: 1, doctor_id: 1} as any)
    )
    expect(rolesState.rolesOptionList).toEqual(payload.list)
    expect(rolesState.selectedSubRoleId).toBe(99)
    expect(rolesState.loadingRoles).toBe(false)

    const listPayload = {
      defaultList: [{value: 1, label: 'A'}],
      customRoleList: [{value: 2, label: 'B'}],
    }
    const listState = reducer(
      {...rolesState, loadingRolesList: true},
      getRolesList.fulfilled(listPayload as any, 'req', {plan_id: 1, doctor_id: 1} as any)
    )
    expect(listState.rolesList).toEqual(listPayload)
    expect(listState.loadingRolesList).toBe(false)
  })

  it('toggles permission data loading flags', () => {
    const pendingModule = reducer(baseState, getRolePermissionDetails.pending('req', 5))
    expect(pendingModule.loadingPermissionModule).toBe(true)

    const moduleData = {id: 5, modules: []}
    const moduleState = reducer(
      pendingModule,
      getRolePermissionDetails.fulfilled(moduleData as any, 'req', 5)
    )
    expect(moduleState.permissionModule).toEqual(moduleData)
    expect(moduleState.loadingPermissionModule).toBe(false)

    const pendingUsers = reducer(baseState, getUsersPermissions.pending('req', 3))
    expect(pendingUsers.loadingUsersPermissions).toBe(true)
    const userPermissions = reducer(
      pendingUsers,
      getUsersPermissions.fulfilled({id: 3} as any, 'req', 3)
    )
    expect(userPermissions.usersPermissions.id).toBe(3)
    expect(userPermissions.loadingUsersPermissions).toBe(false)
  })

  it('marks add/edit custom role loading cycles', () => {
    const addPending = reducer(baseState, addCustomRole.pending('req', {} as any))
    expect(addPending.loadingAddCustomRole).toBe(true)
    const addDone = reducer(addPending, addCustomRole.fulfilled({} as any, 'req', {} as any))
    expect(addDone.loadingAddCustomRole).toBe(false)

    const editPending = reducer(baseState, editCustomRole.pending('req', {} as any))
    expect(editPending.loadingAddCustomRole).toBe(true)
    const editDone = reducer(editPending, editCustomRole.rejected('err' as any, 'req', {} as any))
    expect(editDone.loadingAddCustomRole).toBe(false)

    const updatePending = reducer(baseState, updateAssignee.pending('req', {} as any))
    expect(updatePending.loadingAddCustomRole).toBe(true)
    const updateDone = reducer(updatePending, updateAssignee.fulfilled({} as any, 'req', {} as any))
    expect(updateDone.loadingAddCustomRole).toBe(false)
  })
})
