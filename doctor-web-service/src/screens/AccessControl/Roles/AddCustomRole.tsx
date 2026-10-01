import FormWrapper from 'components/formWrapper/FormWrapper'
import {Formik} from 'formik'
import getInitialValues from './helpers/getInitialValues'
import useDispatchAction from '@hooks/useDispatchAction'
import {useNavigate, useSearchParams} from 'react-router-dom'
import FormikInput from 'components/atom/Inputs/FormikInput'
import customRoleSelectionOptions from '@staticData/customRoleSelectionOptions'
import {
  addCustomRole,
  editCustomRole,
  getRolePermissionDetails,
  getRolesOptionList,
  setEditModuleData,
  setSelectedTableAccessControls,
} from 'redux/Slices/AppSlice/accessControl/AccessControl.slice'
import FormikRadio from 'components/atom/Radio/FormikRadio'
import FormikSelectListWithSubText from 'components/atom/Dropdown/FormikSelectListWithSubText'
import {RootState} from 'redux/store'
import {useSelector} from 'react-redux'
import CollapsibleSelectPermission from './components/CollapsibleSelectPermission'
import {useContext, useEffect, useState} from 'react'
import {Spin} from 'antd'
import {AuthContext} from 'context/AuthContext'
import {extractSubModulesWithPermissions, safeParseInt} from 'utils/ConstFunctions'
import {accessControlSchema} from './helpers/accessControl.schema'
import {PermissionSubModule} from '../AccessControlList/types/accessControlList.types'
import FormikSelect from 'components/atom/Inputs/FormikSelect'
import When from 'components/when/When'
import ConfirmAddCustomRole from './components/ConfirmAddCustomRole'
function stripNameAndDescription(arr: PermissionSubModule[]) {
  return arr.map(({id, permissions}) => ({sub_module_id: id, permissions}))
}

// function areAllPermissionsEmpty(data: PermissionSubModule[]) {
//   return data.every((item) => Array.isArray(item.permissions) && item.permissions.length === 0)
// }
const AddCustomRole = () => {
  const {profileId, userId} = useContext(AuthContext)
  const {dispatchAction} = useDispatchAction()
  const navigate = useNavigate()
  const {rolesOptionList} = useSelector((state: RootState) => state.accessControl)
  const [searchParams] = useSearchParams()
  const isEdit = searchParams.get('edit') === 'true'
  const isDefineDefault = searchParams.get('isDefineDefault') === 'true'
  const [open, setOpen] = useState(false)
  const {
    planId,
    loadingPermissionModule,
    selectedTableAccessControls,
    permissionModule,
    editTableAccessControls,
    editModuleData,
    selectedSubRoleId,
    usersPermissions,
    loadingAddCustomRole,
  } = useSelector((state: RootState) => state.accessControl)
  useEffect(() => {
    if (!planId) return
    dispatchAction(
      getRolesOptionList({
        plan_id: safeParseInt(planId),
        doctor_id: safeParseInt(userId),
      })
    )
  }, [planId])

  useEffect(() => {
    if (!selectedSubRoleId) return
    dispatchAction(getRolePermissionDetails(safeParseInt(selectedSubRoleId)))
  }, [selectedSubRoleId])

  const handleSubmit = async (values: ReturnType<typeof getInitialValues>, formik: any) => {
    try {
      if (values.clone_from_sub_role_id === 0 && values.sub_role_tag === 'DEFAULT') {
        formik.setFieldError('clone_from_sub_role_id', 'please select the default role')
        return
      }

      setOpen(true)
    } catch (error) {
      throw error
    }
  }

  const handleConfirmSubmit = ({
    values,
    formik,
  }: {
    values: ReturnType<typeof getInitialValues>
    formik: any
  }) => {
    if (isEdit) {
      handleEditCustomRole(values, editTableAccessControls)
    } else {
      handleAddCustomRole(values, selectedTableAccessControls)
    }
    formik.resetForm()
  }

  const handleAddCustomRole = async (
    values: ReturnType<typeof getInitialValues>,
    permissionDataModule: PermissionSubModule[]
  ) => {
    await dispatchAction(
      addCustomRole({
        name: values.name,
        description: values.description,
        sub_role_tag: values.sub_role_tag,
        plan_id: isDefineDefault ? safeParseInt(values?.plan_id) : safeParseInt(planId),
        profile_id: safeParseInt(profileId),
        clone_from_sub_role_id:
          values.clone_from_sub_role_id === 0 ? null : safeParseInt(values.clone_from_sub_role_id),
        sub_modules:
          values.clone_from_sub_role_id !== 0
            ? null
            : stripNameAndDescription(permissionDataModule),
      })
    )
      .unwrap()
      .then((res: {id: number}) => {
        setEditModuleData(null)
        const checkedSubModules = extractSubModulesWithPermissions(usersPermissions, false)
        dispatchAction(setSelectedTableAccessControls(checkedSubModules))
        navigate(`/access-control/roles?id=${res.id}`)
      })
      .catch(() => {})
  }

  const handleEditCustomRole = async (
    values: ReturnType<typeof getInitialValues>,
    permissionDataModule: PermissionSubModule[]
  ) => {
    await dispatchAction(
      editCustomRole({
        sub_role_id: safeParseInt(editModuleData?.id),
        name: values.name,
        description: values.description,
        sub_role_tag: values.sub_role_tag,
        plan_id: safeParseInt(planId),
        profile_id: safeParseInt(profileId),
        clone_from_sub_role_id: null,
        sub_modules: stripNameAndDescription(permissionDataModule),
      })
    )
      .unwrap()
      .then((res: {id: number}) => {
        setEditModuleData(null)
        const checkedSubModules = extractSubModulesWithPermissions(usersPermissions, false)
        dispatchAction(setSelectedTableAccessControls(checkedSubModules))
        navigate(`/access-control/roles?id=${res.id}`)
      })
      .catch(() => {})
  }

  return (
    <Formik
      initialValues={getInitialValues(editModuleData)}
      onSubmit={handleSubmit}
      enableReinitialize={true}
      validationSchema={accessControlSchema()}
    >
      {(formik) => {
        return (
          <FormWrapper
            title={isEdit ? 'Edit role' : 'Add Custom Role'}
            isSubmitting={formik.isSubmitting || loadingAddCustomRole}
            // isDisabled={
            //   areAllPermissionsEmpty(selectedTableAccessControls) &&
            //   formik.values.sub_role_tag === 'CUSTOM'
            // }
            buttonText='Save'
            onClickCancel={() => {
              formik.resetForm()
              navigate(-1)
            }}
            onClickSave={() => {
              formik.handleSubmit()
            }}
          >
            <ConfirmAddCustomRole
              open={open}
              setOpen={setOpen}
              formik={formik}
              onClick={({values, formik}) => handleConfirmSubmit({values, formik})}
            />
            <Spin spinning={loadingPermissionModule} />
            <div className='md:w-2/3 flex flex-col gap-3'>
              <FormikInput
                name={'name'}
                label={'Name '}
                required={true}
                className='py-3'
                maxLength={100}
                placeholder='Enter name'
              />
              <FormikInput
                name={'description'}
                label={'Description'}
                className='py-3'
                maxLength={100}
                placeholder='Add description'
              />
              <FormikRadio
                name='sub_role_tag'
                label='Choose permissions'
                required
                items={customRoleSelectionOptions}
              />

              <When isTrue={isDefineDefault}>
                {' '}
                <FormikSelect name='plan_id' label='Select Plan' required options={options} />
              </When>

              {formik.values.sub_role_tag === 'DEFAULT' ? (
                <FormikSelectListWithSubText
                  name='clone_from_sub_role_id'
                  disabled={formik.values.sub_role_tag !== 'DEFAULT'}
                  items={rolesOptionList}
                  required={true}
                  onChangeMapperFunc={String}
                  className='!h-12 !rounded-sm'
                  size='large'
                  onChangeSuccess={(value) => {
                    formik.setFieldValue('role', value?.value)
                  }}
                />
              ) : (
                <div>
                  {permissionModule?.modules.map((module) => {
                    return (
                      <div key={module.id} className='flex flex-col gap-3'>
                        <CollapsibleSelectPermission
                          edit={true}
                          module={module.name}
                          module_description={module?.description}
                          module_permission={module?.sub_modules}
                        />
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </FormWrapper>
        )
      }}
    </Formik>
  )
}

export default AddCustomRole
const options = [
  {label: 'Plan 1', value: '1'},
  {label: 'Plan 2', value: '2'},
  {label: 'Plan 3', value: '3'},
  {label: 'Plan 4', value: '4'},
  {label: 'Plan 5', value: '5'},
  {label: 'Plan 6', value: '6'},
  {label: 'Plan 7', value: '7'},
  {label: 'Plan 8', value: '8'},
  {label: 'Plan 9', value: '9'},
  {label: 'Plan 10', value: '10'},
  {label: 'Plan 11', value: '11'},
  {label: 'Plan 12', value: '12'},
  {label: 'Plan 13', value: '13'},
  {label: 'Plan 14', value: '14'},
  {label: 'Plan 15', value: '15'},
  {label: 'Plan 16', value: '16'},
  {label: 'Plan 17', value: '17'},
  {label: 'Plan 18', value: '18'},
  {label: 'Plan 19', value: '19'},
  {label: 'Plan 20', value: '20'},
  {label: 'Plan 21', value: '21'},
  {label: 'Plan 22', value: '22'},
  {label: 'Plan 23', value: '23'},
  {label: 'Plan 24', value: '24'},
  {label: 'Plan 25', value: '25'},
  {label: 'Plan 26', value: '26'},
  {label: 'Plan 27', value: '27'},
  {label: 'Plan 28', value: '28'},
  {label: 'Plan 29', value: '29'},
  {label: 'Plan 30', value: '30'},
  {label: 'Plan 31', value: '31'},
  {label: 'Plan 32', value: '32'},
  {label: 'Plan 33', value: '33'},
  {label: 'Plan 34', value: '34'},
  {label: 'Plan 35', value: '35'},
  {label: 'Plan 36', value: '36'},
  {label: 'Plan 37', value: '37'},
  {label: 'Plan 38', value: '38'},
  {label: 'Plan 39', value: '39'},
  {label: 'Plan 40', value: '40'},
  {label: 'Plan 41', value: '41'},
  {label: 'Plan 42', value: '42'},
  {label: 'Plan 43', value: '43'},
  {label: 'Plan 44', value: '44'},
  {label: 'Plan 45', value: '45'},
  {label: 'Plan 46', value: '46'},
  {label: 'Plan 47', value: '47'},
  {label: 'Plan 48', value: '48'},
  {label: 'Plan 49', value: '49'},
  {label: 'Plan 50', value: '50'},
]
