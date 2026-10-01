import useDispatchAction from '@hooks/useDispatchAction'
import FormikSelectList from 'components/atom/Dropdown/FormikSelectList'
import FormikInput from 'components/atom/Inputs/FormikInput'
import Page from 'components/page/Page'
import {AuthContext} from 'context/AuthContext'
import {Formik} from 'formik'
import {useContext, useEffect, useState} from 'react'
import {useNavigate, useParams} from 'react-router-dom'
import {
  addOrEditCustomers,
  setDataAddingEditCustomer,
  setOpenModalAddingEditSuccessCustomer,
} from 'redux/Slices/AppSlice/Customers/customers.slice'
import {safeParseInt} from 'utils/ConstFunctions'
import getInitialValues from './helpers/getInitialValues'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import hasValue from 'utils/hasValue'
import FormWrapper from '../../../components/formWrapper/FormWrapper'
import {ConfigProvider, Input, Select, Space} from 'antd'
import salutations from '@staticData/salutations'
import InputMobile from 'components/atom/Inputs/InputMobile'
import defaultCountyCode from '@constants/defaultCountyCode'
import {map} from 'ramda'
import When from 'components/when/When'
import ModalAddCustomerSuccess from './components/ModalAddCustomerSuccess'
import {setIsBottomBarOpen} from 'redux/Slices/AppSlice/Dashboard/MobileSidebarSlice'
import {customersSchema} from './customers.schema'
import customerRolesOptions from '@staticData/customerRolesOptions'
import ModalInviteCustomer from './components/ModalInviteCustomer'
import {Invitation} from 'screens/Labs/LabList/types/labs.types'

const AddCustomer = () => {
  const {userId, organizationId, profileId} = useContext(AuthContext)
  const {customerId} = useParams()
  const {dispatchAction} = useDispatchAction()
  const navigate = useNavigate()
  const {dataEditCustomer, openModalAddingEditSuccessCustomer, openModalInviteCustomer} =
    useSelector((state: RootState) => state.customers)
  const {currentCountryCode} = useContext(AuthContext)
  const [countryCode, setCountryCode] = useState<string>(
    dataEditCustomer.country_code ??
      currentCountryCode ??
      defaultCountyCode.DEFAULT_COUNTRY_CODE_INDIA
  )

  useEffect(() => {
    dispatchAction(setIsBottomBarOpen(false))
  }, [])

  const handleSubmit = async (values: ReturnType<typeof getInitialValues>, formik: any) => {
    try {
      await dispatchAction(
        addOrEditCustomers({
          organization_id: safeParseInt(organizationId),
          profile_id: safeParseInt(profileId),
          doctor_id: safeParseInt(userId),
          email: values.email?.toLocaleLowerCase() ?? '',
          first_name: values.first_name ?? '',
          last_name: values.last_name ?? '',
          mobile_no: values.mobile_no ?? null,
          country_code: countryCode,
          salutation: values.salutation,
          doctor_role: values.doctor_role,
          invitation_id: hasValue(customerId) ? safeParseInt(customerId) : null,
          is_invitation_send: false,
          invited_user_profile_id: hasValue(customerId)
            ? safeParseInt(dataEditCustomer?.profile_id) === 0
              ? null
              : safeParseInt(dataEditCustomer?.profile_id)
            : null,
          is_tracking_enabled: true,
          is_stl_file_view_enabled: true,
          is_print_file_view_enabled: false,
          is_scan_file_view_enabled: false,
        })
      )
        .unwrap()
        .then((res: Invitation) => {
          formik.resetForm()
          if (hasValue(customerId)) {
            const queryParams = new URLSearchParams({
              invitation: 'true',
            }).toString()
            if (dataEditCustomer?.status === 'ACCEPTED') {
              navigate(`/customers`)
            } else {
              navigate(`/customers?${queryParams}`)
            }
          } else {
            dispatchAction(setDataAddingEditCustomer(res))
            dispatchAction(setOpenModalAddingEditSuccessCustomer(true))
          }
        })
        .catch((error: string) => {
          if (error === 'DO001') {
            formik.setFieldError(
              'email',
              'The email address belongs to a different organization. Please use an email address associated with your organization.'
            ) // TODOS
          } else if (error === 'IN0003' || error === 'IN0005') {
            formik.setFieldError('email', 'Duplicate profile already exists') // Custom error for the email field
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

  return (
    <Formik
      initialValues={getInitialValues(dataEditCustomer)}
      onSubmit={handleSubmit}
      enableReinitialize={true}
      validationSchema={customersSchema(countryCode)}
    >
      {(formik) => {
        return (
          <Page exitConfirmPredicate={formik.dirty}>
            <When isTrue={openModalAddingEditSuccessCustomer}>
              <ModalAddCustomerSuccess />
            </When>
            <When isTrue={openModalInviteCustomer}>
              <ModalInviteCustomer />
            </When>
            <FormWrapper
              title={hasValue(customerId) ? 'Edit customer' : 'Add customer'}
              subTitle={
                hasValue(customerId)
                  ? 'Edit details and verify to add the customer details.'
                  : 'Add the necessary details to add the practice.'
              }
              isSubmitting={formik.isSubmitting}
              onClickCancel={() => {
                formik.resetForm()
                navigate(-1)
              }}
              onClickSave={() => {
                formik.handleSubmit()
              }}
            >
              <div className='flex flex-col gap-3 md:w-2/5'>
                <FormikSelectList
                  {...{
                    name: 'doctor_role',
                    showSearch: true,
                    required: true,
                    items: customerRolesOptions,
                    className: '!h-12 !rounded-sm',
                    label: 'Role',
                    onChangeMapperFunc: String,
                    disabled: true,
                  }}
                />

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
                    <label
                      className={'w-full text-bold text-textColor text-base font-medium'}
                      style={{color: '#666666'}}
                    >
                      First Name
                      <span className='text-red ml-1'>*</span>
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
                        disabled={hasValue(customerId) || dataEditCustomer.status === 'ACCEPTED'}
                      >
                        {map(
                          (item) => (
                            <Option
                              key={`${item.label}-${item.value}`}
                              value={item.value}
                              selected={item.value === item.value}
                            >
                              {item.label}
                            </Option>
                          ),
                          salutations
                        )}
                      </Select>
                      <div className='w-full'>
                        <Input
                          value={formik.values.first_name ?? ''}
                          className={'w-full px-2 h-12 border rounded  font-medium'}
                          onChange={formik.handleChange}
                          id={'first_name'}
                          name={'first_name'}
                          disabled={hasValue(customerId) || dataEditCustomer.status === 'ACCEPTED'}
                        />
                      </div>
                    </Space.Compact>
                  </ConfigProvider>
                  <div className='text-xs text-red mt-1'>
                    {formik.touched['first_name'] && formik.errors['first_name'] && (
                      <div className='text-red'>{formik.errors['first_name']}</div>
                    )}
                  </div>
                </div>
                <FormikInput
                  name={'last_name'}
                  label={'Last Name '}
                  required={false}
                  className='py-3'
                  maxLength={100}
                />
                <FormikInput
                  name={'email'}
                  label={'Email '}
                  required={true}
                  className='py-3'
                  maxLength={100}
                  disabled={hasValue(customerId) || dataEditCustomer.status === 'ACCEPTED'}
                />
                <div className='relative mt-4'>
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
                </div>
              </div>
            </FormWrapper>
          </Page>
        )
      }}
    </Formik>
  )
}

export default AddCustomer
