import {useContext, useEffect, useState} from 'react'
import {
  ApiGetData,
  checkButtonStates,
  identifyUser,
  safeParseInt,
} from '../../../utils/ConstFunctions'
import Button from '../../atom/Buttons/Button'
import {AxiosError} from 'axios'
import {postApiDataListActivePracticeLocation} from '../../../redux/Slices/AppSlice/PracticeLocation/listActivePracticeLocationSlice'
import {useDispatch, useSelector} from 'react-redux'
import {AuthContext} from '../../../context/AuthContext'
import DisabledButton from '../../atom/Buttons/DisabledButton'
import When from 'components/when/When'
import AddPracticeLocation from 'screens/PracticeLocation/AddPracticeLocation'
import ModalSuccess from '../Alert/ModalSuccess'
import clsx from 'clsx'
import ButtonOutlined from 'components/atom/Buttons/ButtonOutlined'
import {postApiDataListPracticeLocation} from 'redux/Slices/AppSlice/PracticeLocation/listPracticeLocationSlice'
import {useFormik, FormikProvider} from 'formik'
import defaultCountyCode from '@constants/defaultCountyCode'
import userTypes from '@constants/userTypes'
import {postApiDataAddPatientSlice} from 'redux/Slices/AppSlice/InvitePatient/AddPatient'
import hasValue from 'utils/hasValue'
import {TEXT_LOADING} from 'utils/MessageConstant'
import {useLocation, useNavigate, useSearchParams} from 'react-router-dom'
import {RootState} from 'redux/store'
import {postApiLeadsProfileDetailsUpdate} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileUpdateDetails.slice'
import useCountryStateCityApi from '@hooks/useCountryStateCityApi'
import addressService from 'services/addressCityStateCountry/address.service'
import useDispatchAction from '@hooks/useDispatchAction'
import {getActivePractices} from 'redux/Slices/AppSlice/Practices/practices.slice'
import {useFeatureAccess} from '@hooks/useFeatureAccess'
import AddPatientContent from './AddPatientContent'
import {schema} from 'utils/AddOrEditPatientSchema'
import {validatePatient} from 'redux/Slices/AppSlice/orders/orders.slice'
import useAllUserPlan from '@hooks/useAllUserPlan'
import {getKanbanCountsByProfile} from 'redux/Slices/AppSlice/Kanban/Kanban.slice'
import {nextStep, setSavePatientData} from 'redux/Slices/AppSlice/ExistingCase/ExistingCase.slice'
import Footer from 'screens/ExistingCase/components/Footer'
import useActiveProfile from '@hooks/useActiveProfile'
import useProfileBasePath from '@hooks/useProfileBasePath'
import ErrorToast from '../Alert/ErrorToast'

export interface InviteData {
  inviter_id: number
  inviter_user_type: 'DOCTOR' | 'PATIENT'
  invitation_code: string
  invited_user_type: 'DOCTOR' | 'PATIENT'
  patient_id: number
  email: string
  status: string
}

export interface PatientData {
  patient_id: number
  invitation_id: number
  first_name: string
  last_name: string
  email: string
  country_code: string
  mobile: string
  invitation_status: string
  practice_location: string
  gender: string
  age: number
  customer_mapped_id: string
  country: string
  state: string
  city: string
}
const AddPatient = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const profileBasePath = useProfileBasePath()
  const {isAlignerCompanyOrg} = useAllUserPlan()
  const {userId, organizationId, profileId}: any = useContext(AuthContext)
  const [addPracticeLocationStatusModal, setAddPracticeLocationStatusModal] =
    useState<boolean>(false)
  const [practiceLocationList, setPracticeLocationList] = useState<any>([])
  const [successTitle, setSuccessTitle] = useState<string>('')
  const [success, setSuccess] = useState<boolean>(false)
  const [searchParams] = useSearchParams()
  const {isPractice} = useAllUserPlan()
  const isEditPatient = searchParams.get('isEdit') === 'true'
  const [buttonContinueText, setButtonContinueText] = useState(
    isEditPatient ? 'Save changes' : 'Add patient'
  )
  const {currentCountryCode} = useContext(AuthContext)
  const [countryCode, setCountryCode] = useState<string>(
    currentCountryCode ?? defaultCountyCode.DEFAULT_COUNTRY_CODE_INDIA
  )
  const {activeProfile} = useActiveProfile()
  const {activePractices} = useSelector((state: RootState) => state.practices)
  const {serviceConfig} = useSelector((state: RootState) => state.serviceConfiguration)
  const {savePatientData} = useSelector((state: RootState) => state.existingCase)
  const {dispatchAction} = useDispatchAction()
  const location = useLocation()
  const isExistingPatient = location.pathname.includes('/existing_case/')
  const isStarterPlanStepper = location.pathname.includes('/add-patient-starter')
  const isStandaloneAddPatient = !isExistingPatient && !isStarterPlanStepper
  const isVspPlanning = serviceConfig?.VSP_PLANNING ?? false

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
          invitation_status: 'ALL',
          invitation_roles: ['CONSULTING_ORTHODONTIST'],
        },
      })
    )
  }
  const patientId = searchParams.get('patientId')
  const {data} = useSelector((state: RootState) => state.apiGetLeadsProfileDetails)
  const patientData = isExistingPatient ? savePatientData?.data : data.patient_details
  const treatmentPlanFinalized = data?.aligner_treatment_plan_finalized ?? false
  const [disable, setDisable] = useState(false)
  const {permissionChecks} = useFeatureAccess()
  const practicesPermissions = permissionChecks?.customerManagement?.customerManagement?.isAddable

  useEffect(() => {
    getClinics()
    getActivePracticeList('')
  }, [])
  const initialValues = {
    firstName: '',
    lastName: '',
    mobileNumber: '',
    email: '',
    practiceLocation: '',
    age: '',
    gender: '',
    customer_mapped_id: '',
    practice_location_id: '',
    practice_profile_id: practicesPermissions ? '' : String(profileId ?? ''),
    lab_profile_id: '',
    receiver_profile_id: isPractice ? activeProfile?.owner_profile_id : profileId,
    receiver_org_id: isPractice ? activeProfile?.organization_id : organizationId,
    receiver_doctor_id: isPractice ? activeProfile?.owner_doctor_id : userId,
    country: '',
    state: '',
    city: '',
    practice_invite_id: '',
  }

  // Add Patient
  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validationSchema: schema({countryCode}),
    onSubmit: async (values) => {
      setButtonContinueText(TEXT_LOADING)

      const postData = {
        data: {
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
          practice_location_id:
            values.practice_location_id !== '' ? values.practice_location_id : null,
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
          practice_invite_code: hasValue(values.practice_invite_id)
            ? values.practice_invite_id
            : null,
        },
      }
      if (isEditPatient) {
        const email =
          values.email === patientData?.email || values.email === ''
            ? null
            : values.email?.toLocaleLowerCase()
        const mobile =
          values.mobileNumber === patientData?.mobile || values.mobileNumber === ''
            ? null
            : values.mobileNumber
        // Update
        const postData = {
          data: {
            first_name: values.firstName,
            last_name: values.lastName,
            email: email?.toLocaleLowerCase(),
            mobile: mobile,
            country_code: countryCode,
            practice_location_name: values.practiceLocation !== '' ? values.practiceLocation : null,
            customer_mapped_id: values.customer_mapped_id.trim(),
            age: values.age,
            gender: values.gender,
            practice_location_id:
              values.practice_location_id !== '' ? values.practice_location_id : null,
            country: values.country,
            state: values.state,
            city: values.city,
            receiver_profile_id: hasValue(values.receiver_profile_id)
              ? safeParseInt(values.receiver_profile_id)
              : null,
            receiver_org_id: hasValue(values.receiver_org_id)
              ? safeParseInt(values.receiver_org_id)
              : null,
            receiver_doctor_id: hasValue(values.receiver_doctor_id)
              ? safeParseInt(values.receiver_doctor_id)
              : null,
            patient_id: patientData?.id,
            practice_profile_id: hasValue(values.practice_profile_id)
              ? values.practice_profile_id
              : null,
            doctor_id: safeParseInt(userId),
          },
        }

        if (patientData.email) {
          dispatch(postApiLeadsProfileDetailsUpdate(postData) as any)
            .unwrap()
            .then((res: PatientData) => {
              dispatchAction(getKanbanCountsByProfile({profile_id: Number(profileId)}))
                .unwrap()
                .then(() => {
                  navigate(`${profileBasePath}/${res.patient_id}`)
                })
            })
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
                formik.setFieldError('email', 'Duplicate profile already exists')
                setButtonContinueText(isEditPatient ? 'Save changes' : 'Add patient')
              } else {
                dispatch(postApiLeadsProfileDetailsUpdate(postData) as any)
                  .unwrap()
                  .then((res: PatientData) => {
                    navigate(`${profileBasePath}/${res.patient_id}`)
                  })
              }
            })
        }
      } else {
        // New Patient
        identifyUser()
        dispatchAction(
          validatePatient({
            doctor_id: safeParseInt(userId),
            patient_email_id: values.email?.toLocaleLowerCase(),
          })
        )
          .unwrap()
          .then((res: any) => {
            if (res?.is_patient_present) {
              formik.setFieldError('email', 'Duplicate profile already exists')
              setButtonContinueText(isEditPatient ? 'Save changes' : 'Add patient')
            } else {
              if (isExistingPatient) {
                dispatchAction(setSavePatientData(postData))
                dispatchAction(nextStep())
                return
              }
              dispatch(postApiDataAddPatientSlice(postData) as any)
                .unwrap()
                .then((res: PatientData) => {
                  navigate(`${profileBasePath}/${res.patient_id}`)
                })
                .catch((error: string) => {
                  if (error === 'AI001' || error === 'PI002') {
                    formik.setFieldError('mobileNumber', 'Duplicate profile already exists')
                  }
                  if (error === 'END000') {
                    ErrorToast('You have exceeded your plan limit. Please upgrade to continue.')
                  }
                  setButtonContinueText(isEditPatient ? 'Save changes' : 'Add patient')
                })
            }
          })
      }
      identifyUser()
    },
  })

  useEffect(() => {
    if (profileId === formik.values.practice_profile_id) {
      setDisable(false)
    } else {
      setDisable(true)
      formik.setFieldValue('country', '')
      formik.setFieldValue('state', '')
      formik.setFieldValue('city', '')
      formik.setFieldValue('practice_location_id', '')
      formik.setFieldValue('practiceLocation', '')
    }
  }, [formik.values.practice_profile_id])

  useEffect(() => {
    if ((isEditPatient && hasValue(patientId)) || (isExistingPatient && patientData)) {
      setCountryCode(patientData?.country_code)
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
          isExistingPatient
            ? patientData?.practice_profile_id
            : (String(patientData?.assigned_practice?.practice_profile_id) ?? '')
        )
        formik.setFieldValue(
          'practice_invite_id',
          isExistingPatient
            ? patientData?.practice_invite_id
            : (String(patientData?.practice_invite_id) ?? '')
        )
      }
      formik.setFieldValue(
        'gender',
        hasValue(patientData?.gender) ? String(patientData.gender).toUpperCase() : ''
      )
      formik.setFieldValue('firstName', patientData?.first_name)
      formik.setFieldValue('lastName', patientData?.last_name)
      formik.setFieldValue(
        'email',
        patientData?.email ? patientData?.email?.toLocaleLowerCase() : ''
      )
      formik.setFieldValue('age', hasValue(patientData?.age) ? String(patientData?.age) : '')
      formik.setFieldValue('mobileNumber', hasValue(patientData?.mobile) ? patientData?.mobile : '')
      formik.setFieldValue('country', patientData?.country ?? '')
      formik.setFieldValue('state', patientData?.state ?? '')
      formik.setFieldValue('city', patientData?.city ?? '')
      formik.setFieldValue('customer_mapped_id', patientData?.customer_mapped_id ?? '')
    }
  }, [isEditPatient, isExistingPatient, patientData])

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

  const hasCustomerSelection =
    hasValue(formik.values.practice_profile_id) || hasValue(formik.values.practice_invite_id)
  const isLabSelectionMissing =
    !isVspPlanning && isPractice && !hasValue(formik.values.lab_profile_id) && !isEditPatient
  const disabledAddButton = (isAlignerCompanyOrg && !hasCustomerSelection) || isLabSelectionMissing

  const addClinicModalOpen = () => {
    setAddPracticeLocationStatusModal(true)
  }

  useEffect(() => {
    if (successTitle.length > 0) {
      setSuccess(true)
      const postData: ApiGetData = {
        data: {
          doctor_id: safeParseInt(userId),
        },
      }
      dispatch(postApiDataListPracticeLocation(postData) as any)
        .unwrap()
        .then(async (res: any) => {
          const clinicList = res.practice_location_list
          getClinics()

          const filteredClinic = clinicList.find(
            (clinic: any) => clinic.practice_location_name === practiceLocationName && clinic.active
          )
          if (!filteredClinic) return
          formik.setFieldValue('practiceLocation', filteredClinic.practice_location_name)
          formik.setFieldValue(
            'practice_location_id',
            filteredClinic.practice_location_id.toString()
          )
          await Promise.all([
            addressService.getCountryList(dispatch),
            addressService.getStateList(dispatch, filteredClinic.country),
            addressService.getCityList(dispatch, filteredClinic.country, filteredClinic.state),
          ])
          formik.setFieldValue('country', filteredClinic.country)
          formik.setFieldValue('state', filteredClinic.state)
          formik.setFieldValue('city', filteredClinic.city)
        })
        .catch((error: AxiosError) => {
          console.error(error)
        })
      setTimeout(() => {
        setSuccessTitle('')
      }, 3000)
    }
  }, [successTitle])

  const [practiceLocationName, setPracticeLocationName] = useState('')

  const fetchCountryStateCityData = async (country: string, state: string) => {
    await Promise.all([
      addressService.getCountryList(dispatch),
      country && addressService.getStateList(dispatch, country),
      country && state && addressService.getCityList(dispatch, country, state),
    ])
  }

  useCountryStateCityApi({
    formik,
    dispatch,
    isNew: true,
  })

  return (
    <div className={clsx('bg-white w-full')}>
      {success && <ModalSuccess setIsSuccessModelOpen={setSuccess} title={successTitle} />}
      <When isTrue={addPracticeLocationStatusModal}>
        <AddPracticeLocation
          setIsAddPracticeLocationModelOpen={setAddPracticeLocationStatusModal}
          clinicData={{}}
          setIsEditPracticeLocationModelOpen={() => {}}
          isNew={true}
          setSuccessTitle={setSuccessTitle}
          setPracticeLocationName={setPracticeLocationName}
        />
      </When>

      <div className='w-full'>
        <div className='md:px-6'>
          <div className='flex flex-shrink-0 items-center justify-between rounded-t-md mb-4'>
            {isExistingPatient ? (
              <div className='text-2xl font-semibold'>Patient details</div>
            ) : (
              <div>
                <When isTrue={isEditPatient}>
                  <h1 className='font-semibold text-[24px]'>Edit patient details</h1>
                </When>
                <When isTrue={!isEditPatient}>
                  <h1 className='font-semibold text-[24px]'>Add Patient</h1>
                </When>

                <p className='text-[16px] text-textColor'>
                  {isEditPatient
                    ? 'Edit the patient’s details and save changes'
                    : 'Enter the required details to add the patient'}
                </p>
              </div>
            )}
          </div>
        </div>
        <FormikProvider value={formik}>
          <form onSubmit={formik.handleSubmit}>
            <div
              className={clsx(
                'mt-4 md:px-6',
                isExistingPatient ? 'md:pb-0 pb-40' : 'pb-40',
                isStandaloneAddPatient && 'h-[calc(100vh -14px)] md:overflow-y-auto'
              )}
            >
              <AddPatientContent
                {...{
                  formik,
                  dispatch,
                  activePractices,
                  practiceLocationList,
                  addClinicModalOpen,
                  practicesPermissions,
                  countryCode,
                  setCountryCode,
                  isEditPatient,
                  patientData,
                  treatmentPlanFinalized,
                  disable,
                }}
              />

              {isExistingPatient || isStarterPlanStepper ? (
                <Footer
                  {...{
                    onNext: () => {
                      formik.handleSubmit()
                    },
                    disabled: practicesPermissions
                      ? (!hasValue(formik.values.practice_profile_id) &&
                          !hasValue(formik.values.practice_invite_id)) ||
                        formik.values.firstName?.length < 2 ||
                        isLabSelectionMissing
                      : isLabSelectionMissing,
                  }}
                />
              ) : (
                <div className='fixed bg-white bottom-0 left-0 w-full h-[96px] border-t border-mediumGray gap-2 z-auto'>
                  <div className='relative  h-[96px] flex gap-2 justify-end items-center md:me-12 me-4'>
                    <ButtonOutlined
                      text={'Cancel'}
                      className={'!h-[50px] !w-[150px] border !border-mediumGray text-textColor'}
                      onClick={() => {
                        formik.resetForm()
                        navigate(-1)
                      }}
                    />
                    <When isTrue={!isEditPatient && formik.values.firstName?.length < 2}>
                      <DisabledButton
                        text={buttonContinueText}
                        className={'!h-[50px] !w-[150px]'}
                      />
                    </When>

                    <When isTrue={formik.values.firstName?.length >= 2}>
                      <Button
                        text={buttonContinueText}
                        isDisabled={
                          isExistingPatient ||
                          checkButtonStates(buttonContinueText) ||
                          disabledAddButton
                        }
                        className={'!h-[50px] !w-[150px]'}
                      />
                    </When>
                  </div>
                </div>
              )}
            </div>
          </form>
        </FormikProvider>
      </div>
    </div>
  )
}

export default AddPatient
