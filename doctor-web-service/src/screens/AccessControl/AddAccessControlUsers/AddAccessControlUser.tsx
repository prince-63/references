// AddAccessControlUser.tsx
import useDispatchAction from '@hooks/useDispatchAction'
import FormikInput from 'components/atom/Inputs/FormikInput'
import Page from 'components/page/Page'
import {AuthContext} from 'context/AuthContext'
import {Formik} from 'formik'
import {useContext, useEffect, useMemo, useState} from 'react'
import {useNavigate as useCustomNavigate} from 'context/CustomNavigationContext'
import {useNavigate as useRouterNavigate, useParams, useSearchParams} from 'react-router-dom'
import {getSalutations, safeParseInt} from 'utils/ConstFunctions'
import getInitialValues from './helpers/getInitialValues'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import hasValue from 'utils/hasValue'
import FormWrapper from '../../../components/formWrapper/FormWrapper'
import {ConfigProvider, Input, Select, Space, Tabs} from 'antd'
import salutations from '@staticData/salutations'
import InputMobile from 'components/atom/Inputs/InputMobile'
import defaultCountyCode from '@constants/defaultCountyCode'
import {map} from 'ramda'
import When from 'components/when/When'
import ModalInvitePractice from './components/ModalInviteUser'
import {setIsBottomBarOpen} from 'redux/Slices/AppSlice/Dashboard/MobileSidebarSlice'
import {accessControlUserSchema} from './accessControlUser.schema'
import FormikSelectListWithSubText from 'components/atom/Dropdown/FormikSelectListWithSubText'
import {AccessControlInvitationDetails} from '../AccessControlList/types/accessControlList.types'
import {
  addEditAccessControlUser,
  getRolesOptionList,
  setDataAddingEditUser,
  setOpenSuccessUserAdded,
} from 'redux/Slices/AppSlice/accessControl/AccessControl.slice'
import useAllUserPlan from '@hooks/useAllUserPlan'
import LabList from 'screens/Labs/LabList/LabList'
import practiceFilterConstants from '@constants/practiceFilter.constants'

const AddAccessControlUser = () => {
  const {userId} = useContext(AuthContext)
  const {accessControlUserId} = useParams()
  const {dispatchAction} = useDispatchAction()
  const navigate = useRouterNavigate()
  const {setShouldBlock} = useCustomNavigate()
  const [searchParams] = useSearchParams()
  const isEdit = searchParams.get('edit') === 'true'
  const {dataAddingEditUser, openSuccessUserAdded, rolesOptionList, planId} = useSelector(
    (state: RootState) => state.accessControl
  )
  const {serviceConfig} = useSelector((state: RootState) => state.serviceConfiguration)
  const {currentCountryCode} = useContext(AuthContext)
  const {isEnterprisePlanUser, isPractice} = useAllUserPlan()
  const [countryCode, setCountryCode] = useState<string>(
    isEdit
      ? dataAddingEditUser.country_code
      : (currentCountryCode ?? defaultCountyCode.DEFAULT_COUNTRY_CODE_INDIA)
  )

  useEffect(() => {
    dispatchAction(setIsBottomBarOpen(false))
    if (planId && userId)
      dispatchAction(
        getRolesOptionList({
          plan_id: safeParseInt(planId),
          doctor_id: safeParseInt(userId),
        })
      )
  }, [planId, userId])

  useEffect(() => {
    return () => {
      setShouldBlock(false)
    }
  }, [setShouldBlock])

  const handleSubmit = async (values: ReturnType<typeof getInitialValues>, formik: any) => {
    try {
      await dispatchAction(
        addEditAccessControlUser({
          doctor_id: safeParseInt(userId),
          email: values.email,
          first_name: values.first_name ?? '',
          last_name: values.last_name,
          display_name: [
            getSalutations(values.salutation ?? '').trim(),
            values.first_name,
            values.last_name,
          ]
            .map((value) => (value ?? '').toString().trim())
            .filter(Boolean)
            .join(' '),
          mobile_no:
            !hasValue(values.mobile_no) || values.mobile_no === '' ? null : values.mobile_no,
          country_code: countryCode ?? '+91',
          salutation: values.salutation,
          invitation_id: isEdit ? dataAddingEditUser?.invitation_id : null,
          is_invitation_send: false,
          sub_role_id: safeParseInt(values.role),
          invited_user_profile_id: isEdit ? (dataAddingEditUser?.profile_id ?? null) : null,
          is_tracking_enabled: false,
          is_stl_file_view_enabled: false,
          is_print_file_view_enabled: false,
          is_scan_file_view_enabled: false,
        })
      )
        .unwrap()
        .then((res: AccessControlInvitationDetails) => {
          formik.resetForm()
          if (hasValue(accessControlUserId) || isEdit) {
            navigate(`/access-control/`)
          } else {
            dispatchAction(setDataAddingEditUser(res))
            dispatchAction(setOpenSuccessUserAdded(true))
          }
        })
        .catch((error: string) => {
          if (error === 'IE0001' || error === 'IN0005' || error === 'IE0002') {
            formik.setFieldError('email', 'Duplicate profile already exists')
          } else if (error === 'IN0004' || error === 'IN0006') {
            formik.setFieldError('mobile_no', 'Duplicate profile already exists')
          } else if (error === 'ORG0002') {
            formik.setFieldError('email', 'The user belongs to a different organization.')
          }
        })
    } catch (error) {
      throw error
    }
  }

  const {Option} = Select
  const roleDropdownItems = useMemo(() => {
    if (!serviceConfig?.VSP_PLANNING) {
      return rolesOptionList
    }

    return rolesOptionList.filter((role) => role.label?.toLowerCase() === 'admin')
  }, [rolesOptionList, serviceConfig?.VSP_PLANNING])

  const userFormContent = (
    <Formik
      initialValues={getInitialValues(dataAddingEditUser)}
      onSubmit={handleSubmit}
      enableReinitialize
      validationSchema={accessControlUserSchema(countryCode)}
    >
      {(formik) => (
        <Page exitConfirmPredicate={formik.dirty} containerClassName='px-4'>
          <When isTrue={openSuccessUserAdded}>
            <ModalInvitePractice />
          </When>

          <FormWrapper
            title={isEdit ? 'Edit user' : 'Invite user'}
            isSubmitting={formik.isSubmitting}
            buttonText='Send invite'
            onClickCancel={() => {
              formik.resetForm()
              navigate(-1)
            }}
            onClickSave={() => {
              formik.handleSubmit()
            }}
          >
            <div className='flex flex-col gap-3 md:w-2/5'>
              <div>
                <ConfigProvider
                  theme={{
                    token: {fontFamily: 'figtree'},
                    components: {
                      Input: {
                        hoverBorderColor: 'inherit',
                        activeBorderColor: 'inherit',
                        activeShadow: 'none',
                      },
                      Select: {
                        hoverBorderColor: 'inherit',
                        activeBorderColor: 'inherit',
                        activeOutlineColor: 'inherit',
                      },
                    },
                  }}
                >
                  <label className='w-full text-bold text-textColor text-base font-medium'>
                    First Name<span className='text-red ml-1'>*</span>
                  </label>
                  <Space.Compact className='w-full'>
                    <Select
                      value={formik.values['salutation']}
                      className='h-12 focus:outline-none font-medium'
                      id='salutation'
                      popupMatchSelectWidth={false}
                      onChange={(v) => {
                        formik.setFieldValue('salutation', v)
                      }}
                      disabled={isEdit}
                    >
                      {map(
                        (item) => (
                          <Option key={item.value} value={item.value}>
                            {item.label}
                          </Option>
                        ),
                        salutations
                      )}
                    </Select>
                    <div className='w-full'>
                      <Input
                        value={formik.values.first_name ?? ''}
                        className='w-full px-2 h-12 border rounded font-medium'
                        onChange={formik.handleChange}
                        id='first_name'
                        name='first_name'
                        disabled={isEdit}
                      />
                    </div>
                  </Space.Compact>
                </ConfigProvider>
                <div className='text-xs text-red mt-1'>
                  {formik.touched.first_name && formik.errors.first_name && (
                    <div>{formik.errors.first_name}</div>
                  )}
                </div>
              </div>

              <FormikInput
                name='last_name'
                label='Last Name'
                required={false}
                className='py-3'
                maxLength={100}
              />
              <FormikInput
                name='email'
                label='Email'
                required
                className='py-3'
                maxLength={100}
                disabled={isEdit}
              />

              <InputMobile
                name='mobile_no'
                className=''
                label='Mobile Number'
                classNameLabel='text-textColor text-base font-medium'
                formik={formik}
                required={false}
                countryCode={countryCode}
                setCountryCode={setCountryCode}
                value={formik.values.mobile_no ?? ''}
              />

              <FormikSelectListWithSubText
                name='role'
                items={roleDropdownItems}
                required={true}
                label='Role'
                onChangeMapperFunc={String}
                className='!h-12 !rounded-sm'
                size='large'
                onChangeSuccess={(value) => {
                  formik.setFieldValue('role', value?.value)
                }}
              />
            </div>
          </FormWrapper>
        </Page>
      )}
    </Formik>
  )

  if (isEnterprisePlanUser || isPractice) {
    return (
      <Tabs
        defaultActiveKey='users'
        items={[
          {label: 'Users', key: 'users', children: userFormContent},
          {label: 'Connected Labs', key: 'labs', children: <LabList />},
          {
            label: 'Invitations',
            key: 'invitations',
            children: <LabList initialActiveTab={practiceFilterConstants.PENDING} />,
          },
        ]}
      />
    )
  }

  return userFormContent
}

export default AddAccessControlUser
