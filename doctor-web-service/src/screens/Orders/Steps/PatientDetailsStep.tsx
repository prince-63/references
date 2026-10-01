import Page from 'components/page/Page'
import FooterRedesigned from '../components/FooterRedesigned'
import {useFormik} from 'formik'
import {useContext, useEffect, useState} from 'react'
import defaultCountyCode from '@constants/defaultCountyCode'
import {useDispatch, useSelector} from 'react-redux'
import {AuthContext} from 'context/AuthContext'
import userTypes from '@constants/userTypes'
import hasValue from 'utils/hasValue'
import {useLocation, useParams} from 'react-router-dom'
import {useFeatureAccess} from '@hooks/useFeatureAccess'
import AddPatientContent from 'components/modal/InvitePatient/AddPatientContent'
import {RootState} from 'redux/store'
import {AxiosError} from 'axios'
import {postApiDataListActivePracticeLocation} from 'redux/Slices/AppSlice/PracticeLocation/listActivePracticeLocationSlice'
import useDispatchAction from '@hooks/useDispatchAction'
import {getActivePractices} from 'redux/Slices/AppSlice/Practices/practices.slice'
import {ApiGetData, safeParseInt} from 'utils/ConstFunctions'
import addressService from 'services/addressCityStateCountry/address.service'
import useCountryStateCityApi from '@hooks/useCountryStateCityApi'
import InfoMessage from '../components/InfoMessage'
import RadioGroupIcon from 'components/RadioGroup/RadioGroupIcon'
import {Select} from 'antd'
import {getPatientsList} from 'redux/Slices/AppSlice/Calendar/calendar.slice'
import {map} from 'ramda'
import {
  getSelectedPatientDetails,
  nextStep,
  setOrderPatientDetails,
  validatePatient,
} from 'redux/Slices/AppSlice/orders/orders.slice'
import patientTypeSelectOptions from '@staticData/patientTypeSelectOptions'
import patientTypeSelectConstants from '@constants/patientTypeSelect.constants'
import When from 'components/when/When'
import {schema} from 'utils/AddOrEditPatientSchema'
import userOrderDetails from '../hooks/userOrderDetails'
import PATIENT_TYPE from '@constants/patientType.constants'
import StepCard from '../components/StepCard'
import {User} from 'lucide-react'

const PatientDetailsStep = () => {
  const {currentCountryCode} = useContext(AuthContext)
  const [countryCode, setCountryCode] = useState<string>(
    currentCountryCode ?? defaultCountyCode.DEFAULT_COUNTRY_CODE_INDIA
  )
  const dispatch = useDispatch()
  const {userId, profileId, organizationId} = useContext(AuthContext)
  const {loadingPatientsList, patientsList} = useSelector((state: RootState) => state.calendar)
  const {orderId} = useParams()
  const isEditOrder = hasValue(orderId)
  const {activePractices} = useSelector((state: RootState) => state.practices)
  const {patientDetails} = useSelector((state: RootState) => state.orders)
  const patientData = patientDetails?.patient_details
  const [practiceLocationList, setPracticeLocationList] = useState<any>([])
  const {dispatchAction} = useDispatchAction()
  const {state} = useLocation()
  const patientId: number | undefined = hasValue(state?.patientId)
    ? safeParseInt(state.patientId)
    : undefined
  const {permissionChecks} = useFeatureAccess()
  const practicesPermissions = permissionChecks?.patientProfileActions?.assignee?.isEditable

  const getActivePracticeList = async (query: string) => {
    await dispatchAction(
      getActivePractices({
        data: {
          sort_order: 'PRACTICE_NAME_ASC',
          page_number: 0,
          page_size: 0,
          search: query,
          doctor_id: safeParseInt(userId),
          organization_id: safeParseInt(organizationId),
          invitation_status: 'ACCEPTED',
          invitation_roles: ['CONSULTING_ORTHODONTIST'],
        },
      })
    )
  }

  useEffect(() => {
    getClinics()
    getActivePracticeList('')
    if (userId) {
      dispatchAction(getPatientsList({doctor_id: safeParseInt(userId)}))
    }

    if (!isEditOrder && hasValue(patientId) && patientId !== 0) {
      dispatchAction(
        getSelectedPatientDetails({
          doctor_id: safeParseInt(userId),
          patient_id: safeParseInt(patientId),
        })
      )
    }
  }, [userId, patientId, isEditOrder])

  const {order, loadingOrder} = userOrderDetails()

  useEffect(() => {
    if (isEditOrder && order?.patient_details?.id) {
      dispatchAction(
        getSelectedPatientDetails({
          doctor_id: safeParseInt(userId),
          patient_id: safeParseInt(order?.patient_details?.id),
        })
      )
    }
  }, [order?.patient_details?.id])

  const formik = useFormik({
    initialValues: {
      patientType: patientTypeSelectConstants.SELECT_EXISTING_PATIENT,
      selectedPatientId: isEditOrder
        ? order?.patient_details?.id
        : hasValue(patientId)
          ? patientId
          : '',
      firstName: '',
      lastName: '',
      mobileNumber: '',
      email: '',
      practiceLocation: '',
      age: '',
      gender: '',
      customer_mapped_id: '',
      practice_location_id: '',
      practice_profile_id: profileId,
      lab_profile_id: '',
      receiver_profile_id: '',
      receiver_org_id: '',
      receiver_doctor_id: '',
      receiver_name: '',
      country: '',
      state: '',
      city: '',
    },
    enableReinitialize: true,
    validationSchema: schema({countryCode}),
    onSubmit: async (values) => {
      const postData = {
        first_name: values.firstName,
        last_name: values.lastName,
        email: values.email !== '' ? values.email?.toLocaleLowerCase() : null,
        mobile: values.mobileNumber !== '' ? values.mobileNumber : null,
        country_code: countryCode,
        practice_location: values.practiceLocation !== '' ? values.practiceLocation : null,
        inviter_id: userId,
        inviter_user_type: userTypes.DOCTOR,
        customer_mapped_id: values.customer_mapped_id.trim(),
        age: values.age,
        gender: values.gender,
        practice_location_id: values.practice_location_id ? values.practice_location_id : null,
        country: values.country,
        state: values.state,
        city: values.city,
        practice_profile_id: hasValue(values.practice_profile_id)
          ? values.practice_profile_id
          : null,
        receiver_profile_id: hasValue(values.receiver_profile_id)
          ? safeParseInt(values.receiver_profile_id)
          : null,
        receiver_org_id: hasValue(values.receiver_org_id)
          ? safeParseInt(values.receiver_org_id)
          : null,
        receiver_doctor_id: hasValue(values.receiver_doctor_id)
          ? safeParseInt(values.receiver_doctor_id)
          : null,
      }
      if (values.patientType !== patientTypeSelectConstants.ADD_NEW_PATIENT) {
        dispatchAction(
          setOrderPatientDetails({...postData, id: safeParseInt(values.selectedPatientId)})
        )
        dispatchAction(nextStep())
      } else {
        dispatchAction(
          validatePatient({
            doctor_id: safeParseInt(userId),
            patient_email_id: values.email?.toLocaleLowerCase(),
          })
        )
          .unwrap()
          .then((res: any) => {
            if (res?.is_patient_present) {
              formik.setFieldError('email', 'Patient with this email already exists')
            } else {
              dispatchAction(
                setOrderPatientDetails({
                  ...postData,
                  receiver_name: values.receiver_name,
                  profile_id: profileId,
                })
              )
              dispatchAction(nextStep())
            }
          })
      }
    },
  })

  useEffect(() => {
    if (!patientData) return
    patientData?.country_code && setCountryCode(patientData?.country_code)

    fetchCountryStateCityData(patientData?.country ?? '', patientData?.state ?? '')
    formik.setFieldValue(
      'practiceLocation',
      hasValue(patientData?.practice_location) ? patientData?.practice_location : ''
    )
    formik.setFieldValue(
      'practice_location_id',
      hasValue(patientData?.practice_location_id) ? String(patientData?.practice_location_id) : ''
    )
    if (practicesPermissions) {
      formik.setFieldValue(
        'practice_profile_id',
        String(patientData?.assigned_practice?.practice_profile_id) ?? ''
      )
    } else {
      formik.setFieldValue(
        'practice_profile_id',
        String(patientData?.assigned_practice?.practice_profile_id) ?? ''
      )
    }
    formik.setFieldValue('firstName', patientData?.first_name)
    formik.setFieldValue('lastName', patientData?.last_name)
    formik.setFieldValue('email', patientData?.email ? patientData?.email?.toLocaleLowerCase() : '')
    formik.setFieldValue(
      'gender',
      hasValue(patientData?.gender) ? patientData?.gender.toUpperCase() : ''
    )
    formik.setFieldValue('age', hasValue(patientData?.age) ? String(patientData?.age) : '')
    formik.setFieldValue('mobileNumber', hasValue(patientData?.mobile) ? patientData?.mobile : '')
    formik.setFieldValue('country', patientData?.country ?? '')
    formik.setFieldValue('state', patientData?.state ?? '')
    formik.setFieldValue('city', patientData?.city ?? '')
    formik.setFieldValue('customer_mapped_id', patientData?.customer_mapped_id ?? '')
  }, [patientDetails])

  const getClinics = () => {
    const postData: ApiGetData = {
      data: {
        doctor_id: safeParseInt(userId),
      },
    }
    dispatch(postApiDataListActivePracticeLocation(postData) as any)
      .unwrap()
      .then((res: any) => {
        const clinicList: any = []
        res?.practice_location_list?.forEach((element: any) => {
          clinicList.push({
            value: element.practice_location_id.toString(),
            label: element.practice_location_name,
            country: element.country,
            state: element.state,
            city: element.city,
          })
        })

        setPracticeLocationList(clinicList)
      })
      .catch((error: AxiosError) => {
        console.error(error)
      })
  }

  const fetchCountryStateCityData = async (country: string, state: string) => {
    await Promise.all([
      addressService.getCountryList(dispatch),
      country && addressService.getStateList(dispatch, country),
      country && state && addressService.getCityList(dispatch, country, state),
    ])
  }

  const {Option} = Select
  useCountryStateCityApi({
    formik,
    dispatch,
    isNew: true,
  })

  return (
    <Page
      title=''
      loading={loadingOrder}
      exitConfirmPredicate={false}
      containerClassName='min-h-full'
    >
      <div className='md:contents flex flex-col md:h-auto'>
        <StepCard
          title='Patient Details'
          subtitle='Select an existing patient or add a new one'
          icon={<User className='w-5 h-5' />}
          className='md:w-4/5 lg:w-3/5'
        >
          <div className='flex flex-col gap-4'>
            <InfoMessage
              tipMessage={'Email and mobile number of a patient are not displayed to the ORG. '}
            />

            <RadioGroupIcon
              options={patientTypeSelectOptions.map((item) => ({
                ...item,
                disabled:
                  item.value === patientTypeSelectConstants.ADD_NEW_PATIENT &&
                  (isEditOrder || hasValue(patientId)),
              }))}
              onOptionChange={(option) => {
                formik.resetForm()
                formik.setFieldValue('patientType', option)
              }}
              selectedOption={formik.values.patientType}
              label=''
              className='text-center rounded-xl'
            />

            <When
              isTrue={
                formik.values.patientType === patientTypeSelectConstants.SELECT_EXISTING_PATIENT
              }
            >
              <div className='mt-1'>
                <label className='text-sm font-medium text-textColor mb-1.5 block'>
                  Search patient
                </label>
                <Select
                  value={patientData?.full_name}
                  className='h-11 focus:outline-none font-medium w-full [&_.ant-select-selector]:!rounded-xl [&_.ant-select-selector]:!border-mediumGray/60'
                  showSearch
                  disabled={isEditOrder || hasValue(patientId)}
                  loading={loadingPatientsList}
                  id='selectedPatient'
                  placeholder='Type to search...'
                  filterOption={(input, option) =>
                    (option?.children?.toString().toLowerCase() ?? '').indexOf(
                      input.toLowerCase()
                    ) >= 0
                  }
                  onChange={(v) => {
                    formik.setFieldValue('selectedPatientId', v)
                    dispatchAction(
                      getSelectedPatientDetails({
                        doctor_id: safeParseInt(userId),
                        patient_id: safeParseInt(v),
                      })
                    )
                  }}
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
                    isEditOrder
                      ? patientsList
                      : patientsList.filter(
                          (item) => item.patient_type !== PATIENT_TYPE.EXISTING_PATIENT
                        )
                  )}
                </Select>
              </div>
              {formik.touched['selectedPatientId'] && formik.errors['selectedPatientId'] && (
                <p className='text-xs text-red mt-1'>{formik.errors['selectedPatientId']}</p>
              )}
            </When>

            <When
              isTrue={
                (formik.values.patientType === patientTypeSelectConstants.ADD_NEW_PATIENT ||
                  hasValue(formik.values.selectedPatientId)) &&
                !state?.isClone
              }
            >
              <div className='border-b border-mediumGray/40 w-full my-2' />
            </When>
          </div>
        </StepCard>

        {/* Patient form content */}
        <div className='md:w-4/5 lg:w-3/5 pb-40 md:pb-0 mt-4'>
          <When
            isTrue={
              (formik.values.patientType === patientTypeSelectConstants.ADD_NEW_PATIENT ||
                hasValue(formik.values.selectedPatientId)) &&
              !state?.isClone
            }
          >
            <StepCard className='mt-0'>
              <form onSubmit={formik.handleSubmit}>
                <AddPatientContent
                  {...{
                    formik,
                    dispatch,
                    activePractices,
                    practiceLocationList,
                    practicesPermissions,
                    countryCode,
                    setCountryCode,
                    isEditPatient: isEditOrder,
                    patientData,
                    allDisabled:
                      formik.values.patientType ===
                      patientTypeSelectConstants.SELECT_EXISTING_PATIENT,
                  }}
                />
              </form>
            </StepCard>
          </When>
        </div>

        {/* Fixed CTA on mobile; neutral on web */}
        <div className='fixed bottom-0 left-0 right-0 px-8 z-20 bg-white/90 backdrop-blur-sm border-t border-mediumGray/40 md:contents'>
          <FooterRedesigned
            {...{
              onNext: () => {
                formik.handleSubmit()
              },
              nextButtonText: 'Next',
            }}
          />
        </div>
      </div>
    </Page>
  )
}

export default PatientDetailsStep
