import React, {useContext, useEffect, useMemo, useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {useFormik, FormikProvider} from 'formik'
import {AuthContext} from 'context/AuthContext'
import {RootState} from 'redux/store'
import useDispatchAction from '@hooks/useDispatchAction'
import {schema} from 'utils/AddOrEditPatientSchema'
import AddPatientContent from 'components/modal/InvitePatient/AddPatientContent'
import {postApiDataAddPatientSlice} from 'redux/Slices/AppSlice/InvitePatient/AddPatient'

import {validatePatient} from 'redux/Slices/AppSlice/orders/orders.slice'
import {getActivePractices} from 'redux/Slices/AppSlice/Practices/practices.slice'
import {postApiDataListActivePracticeLocation} from 'redux/Slices/AppSlice/PracticeLocation/listActivePracticeLocationSlice'
import {safeParseInt, identifyUser} from 'utils/ConstFunctions'
import userTypes from '@constants/userTypes'
import defaultCountyCode from '@constants/defaultCountyCode'
import {useFeatureAccess} from '@hooks/useFeatureAccess'
import {markGettingStartedComplete} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfile.slice'
import {postApiLeadsProfileDetailsUpdate} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileUpdateDetails.slice'
import {getLeadsProfileDetails} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileDetails.slice'
import Footer from '../components/Footer'
import {useSearchParams} from 'react-router-dom'
import useAllUserPlan from '@hooks/useAllUserPlan'
import ErrorToast from 'components/modal/Alert/ErrorToast'

interface PatientDetailsStepProps {
  onNext: (patientId: number, patientData: any, orderId?: number) => void
  patientDataProp?: any
}

const PatientDetailsStep: React.FC<PatientDetailsStepProps> = ({onNext, patientDataProp}) => {
  const dispatch = useDispatch()
  const {userId, organizationId, profileId, currentCountryCode}: any = useContext(AuthContext)
  const {dispatchAction} = useDispatchAction()
  const {activePractices} = useSelector((state: RootState) => state.practices)
  const patientDetailsFromStore = useSelector(
    (state: RootState) => state.apiGetLeadsProfileDetails.data?.patient_details
  )
  const [searchParams] = useSearchParams()
  const patientId = searchParams.get('patient_id')
  const {isStarterPlanUser} = useAllUserPlan()
  const [practiceLocationList, setPracticeLocationList] = useState<any>([])
  const [countryCode, setCountryCode] = useState<string>(
    currentCountryCode ?? defaultCountyCode.DEFAULT_COUNTRY_CODE_INDIA
  )
  const [loading, setLoading] = useState(false)
  const {permissionChecks} = useFeatureAccess()
  const practicesPermissions = permissionChecks?.customerManagement?.customerManagement?.isAddable
  const initialFormValues = useMemo(
    () => ({
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
      country: '',
      state: '',
      city: '',
      practice_invite_id: '',
      lab_profile_id: '',
      receiver_profile_id: '',
      receiver_org_id: '',
      receiver_doctor_id: '',
    }),
    [practicesPermissions, profileId]
  )

  useEffect(() => {
    getClinics()
    getActivePracticeList('')
  }, [])

  // Fetch patient details when a patient id is provided/changes
  useEffect(() => {
    if (!patientId) return
    const parsedPatientId = safeParseInt(patientId)
    const parsedDoctorId = safeParseInt(userId)
    if (!parsedPatientId || !parsedDoctorId) return
    dispatchAction(
      getLeadsProfileDetails({
        doctor_id: parsedDoctorId,
        patient_id: parsedPatientId,
      }) as any
    )
  }, [patientId, userId])

  // Pre-fill form if patient data is available (prop or fetched)
  useEffect(() => {
    // When no patientId is provided (new patient), avoid using stale store data
    const patientData = patientId ? patientDetailsFromStore : (patientDataProp ?? null)
    if (patientData) {
      if (patientData.country_code) {
        setCountryCode(patientData.country_code)
      }

      formik.setValues({
        firstName: patientData.first_name || '',
        lastName: patientData.last_name || '',
        mobileNumber: patientData.mobile || '',
        email: patientData.email || '',
        practiceLocation: patientData.practice_location || '',
        age: patientData.age ? String(patientData.age) : '',
        gender: patientData.gender || '',
        customer_mapped_id: patientData.customer_mapped_id || '',
        practice_location_id: patientData.practice_location_id
          ? String(patientData.practice_location_id)
          : '',
        practice_profile_id: patientData.practice_profile_id
          ? String(patientData.practice_profile_id)
          : practicesPermissions
            ? ''
            : String(profileId ?? ''),
        country: patientData.country || '',
        state: patientData.state || '',
        city: patientData.city || '',
        practice_invite_id: '', // Usually not returned in basic details or not editable
        // RECHECK
        receiver_doctor_id: patientData.receiver_doctor_id,
        receiver_org_id: patientData.receiver_org_id,
        receiver_profile_id: patientData.receiver_profile_id,
        lab_profile_id: patientData.lab_profile_id,
      })
    } else {
      // Reset when switching to a patient without data to avoid stale values
      setCountryCode(currentCountryCode ?? defaultCountyCode.DEFAULT_COUNTRY_CODE_INDIA)
      formik.resetForm({
        values: {
          ...initialFormValues,
          practice_profile_id: practicesPermissions ? '' : String(profileId ?? ''),
        },
      })
    }
  }, [
    patientDataProp,
    patientDetailsFromStore,
    practicesPermissions,
    profileId,
    currentCountryCode,
    initialFormValues,
    patientId,
  ])

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

  const getClinics = () => {
    dispatchAction(
      postApiDataListActivePracticeLocation({
        data: {doctor_id: safeParseInt(userId)},
      })
    )
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
  }

  const formik = useFormik({
    initialValues: {
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
      receiver_profile_id: '',
      receiver_org_id: '',
      receiver_doctor_id: '',
      country: '',
      state: '',
      city: '',
      practice_invite_id: '',
    },
    validationSchema: schema({countryCode}),
    onSubmit: async (values) => {
      setLoading(true)
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
          practice_profile_id: values.practice_profile_id || null,
          practice_invite_code: values.practice_invite_id || null,
          receiver_profile_id: values.receiver_profile_id
            ? safeParseInt(values.receiver_profile_id)
            : null,
          receiver_org_id: values.receiver_org_id ? safeParseInt(values.receiver_org_id) : null,
          receiver_doctor_id: values.receiver_doctor_id
            ? safeParseInt(values.receiver_doctor_id)
            : null,
          current_step: 3,
        },
        isStarterPlan: isStarterPlanUser,
      }

      try {
        const validationRes: any = await dispatchAction(
          validatePatient({
            doctor_id: safeParseInt(userId),
            patient_email_id: values.email?.toLocaleLowerCase(),
          })
        ).unwrap()

        if (validationRes?.is_patient_present && !patientId) {
          formik.setFieldError('email', 'Duplicate profile already exists')
          setLoading(false)
          return
        }

        let res: any
        if (patientId) {
          // Update existing patient
          const updateData = {
            data: {
              ...postData.data,
              patient_id: patientId,
            },
          }
          res = await dispatchAction(postApiLeadsProfileDetailsUpdate(updateData as any)).unwrap()
        } else {
          // Create new patient
          res = await dispatch(postApiDataAddPatientSlice(postData) as any).unwrap()
          dispatchAction(markGettingStartedComplete({patient_id: safeParseInt(res.patient_id)}))
          identifyUser()
        }

        // Proceed to next step with patient data (order is not created here)
        onNext(patientId || res.patient_id, postData.data, undefined)
      } catch (error: any) {
        if (error === 'AI001' || error === 'PI002') {
          formik.setFieldError('mobileNumber', 'Duplicate profile already exists')
        }
        if (error === 'END000') {
          ErrorToast('You have exceeded your plan limit. Please upgrade to continue.')
        }
        setLoading(false)
      }
    },
  })

  return (
    <div className='w-full p-4 md:p-6'>
      <div className='md:mb-6'>
        <h2 className='text-2xl font-semibold'>Patient details</h2>
      </div>

      <FormikProvider value={formik}>
        <form onSubmit={formik.handleSubmit}>
          <AddPatientContent
            formik={formik}
            activePractices={activePractices}
            practiceLocationList={practiceLocationList}
            countryCode={countryCode}
            setCountryCode={setCountryCode}
            isEditPatient={false}
            practicesPermissions={practicesPermissions}
          />
          <Footer
            {...{
              nextButtonText: loading ? 'Saving...' : 'Save & Continue',
              disableNext: formik.values.firstName?.length < 2,
              onNext: () => {
                formik.handleSubmit()
              },
            }}
          />
        </form>
      </FormikProvider>
    </div>
  )
}

export default PatientDetailsStep
