import useDispatchAction from '@hooks/useDispatchAction'
import FormikSelectList from 'components/atom/Dropdown/FormikSelectList'
import FormikInput from 'components/atom/Inputs/FormikInput'
import Page from 'components/page/Page'
import {AuthContext} from 'context/AuthContext'
import {Formik} from 'formik'
import {useContext, useEffect, useState} from 'react'
import {useNavigate, useParams} from 'react-router-dom'
import {
  addOrEditLabs,
  setDataAddingEditLab,
  setOpenModalAddingEditSuccessLab,
} from 'redux/Slices/AppSlice/Labs/labs.slice'
import {safeParseInt} from 'utils/ConstFunctions'
import {labsSchema} from './labs.schema'
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
import {setIsBottomBarOpen} from 'redux/Slices/AppSlice/Dashboard/MobileSidebarSlice'
import {Invitation} from '../LabList/types/labs.types'
import ModalAddLabSuccess from './components/ModalAddLabSuccess'
import ModalInviteLab from './components/ModalInviteLab'
import rolesConstants from '@constants/roles.constants'
const AddLabs = () => {
  const {userId, organizationId, profileId} = useContext(AuthContext)
  const {labId} = useParams()
  const {dispatchAction} = useDispatchAction()
  const navigate = useNavigate()
  const {dataEditLab, openModalAddingEditSuccessLab, openModalInviteLab} = useSelector(
    (state: RootState) => state.labs
  )
  const {currentCountryCode} = useContext(AuthContext)
  const [countryCode, setCountryCode] = useState<string>(
    currentCountryCode ?? defaultCountyCode.DEFAULT_COUNTRY_CODE_INDIA
  )

  useEffect(() => {
    dispatchAction(setIsBottomBarOpen(false))
  }, [])

  const handleSubmit = async (values: ReturnType<typeof getInitialValues>, formik: any) => {
    try {
      await dispatchAction(
        addOrEditLabs({
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
          invitation_id: hasValue(labId) ? safeParseInt(labId) : null,
          is_invitation_send: false,
        })
      )
        .unwrap()
        .then((res: Invitation) => {
          formik.resetForm()
          if (hasValue(labId)) {
            navigate(-1)
          } else {
            dispatchAction(setDataAddingEditLab(res))
            dispatchAction(setOpenModalAddingEditSuccessLab(true))
          }
        })
        .catch((error: string) => {
          if (error === 'IN0003' || error === 'IN0005') {
            formik.setFieldError('email', 'Duplicate profile already exists') // Custom error for the email field
          } else if (error === 'IN0004' || error === 'IN0006') {
            formik.setFieldError('mobile_no', 'Duplicate profile already exists')
          }
        })
    } catch (error) {
      throw error
    }
  }
  const {Option} = Select

  return (
    <Formik
      initialValues={getInitialValues(dataEditLab)}
      onSubmit={handleSubmit}
      enableReinitialize={true}
      validationSchema={labsSchema(countryCode)}
    >
      {(formik) => {
        return (
          <Page exitConfirmPredicate={formik.dirty}>
            <When isTrue={openModalAddingEditSuccessLab}>
              <ModalAddLabSuccess />
            </When>
            <When isTrue={openModalInviteLab}>
              <ModalInviteLab />
            </When>
            <FormWrapper
              title={hasValue(labId) ? 'Edit lab' : 'Add lab'}
              subTitle={
                hasValue(labId)
                  ? 'Edit details and verify to add the lab details.'
                  : 'Add the necessary details to add the lab.'
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
                    items: [{label: 'Lab', value: rolesConstants.VENDOR}],
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
                        disabled={hasValue(labId)}
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
                          disabled={hasValue(labId)}
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
                  disabled={hasValue(labId)}
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

export default AddLabs
