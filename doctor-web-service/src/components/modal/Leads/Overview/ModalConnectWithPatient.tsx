import {FC, useContext, useState} from 'react'
import InputText from 'components/atom/Inputs/InputText'
import {SVG_CROSS} from 'utils/SvgConstants'
import ModalLayout from 'components/modal/ModalLayout'
import clsx from 'clsx'
import hasValue from 'utils/hasValue'
import {AuthContext} from 'context/AuthContext'
import {emailRegex, identifyUser, safeParseInt} from 'utils/ConstFunctions'
import {useDispatch, useSelector} from 'react-redux'
import {
  postApiDataAddAndSendInvite,
  setIsModalConnectWithPatientOpen,
} from 'redux/Slices/AppSlice/InvitePatient/AddAndSendInvite'
import CommonSVG from 'components/atom/SVG/CommonSVG'
import InfoCard from 'screens/Patients/LeadsProfile/main/alignersTracking/components/InfoCard'
import {useMediaQuery} from 'react-responsive'
import {useFormik} from 'formik'
import {RootState} from 'redux/store'
import * as Yup from 'yup'
import {ERROR_MIN_5_CHAR, ERROR_MAX_255_CHAR, ERROR_MAIL_FORMAT} from 'utils/MessageConstant'
import {getLeadsProfileDetails} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileDetails.slice'
import {postApiDataAddPatientDetailsUpdateSlice} from 'redux/Slices/AppSlice/InvitePatient/AddPatientDetailsUpdateSlice'
import ErrorToast from 'components/modal/Alert/ErrorToast'
import AntdButton from 'components/atom/Buttons/AntdButton'
import {getGettingStartedStepDetails} from 'redux/Slices/AppSlice/LeadsProfile/GettingStartedOverview/GettingStartedOverview.slice'
import useDispatchAction from '@hooks/useDispatchAction'
import {useFeatureAccess} from '@hooks/useFeatureAccess'
import useAllUserPlan from '@hooks/useAllUserPlan'

const schema = () => {
  return Yup.object().shape({
    email: Yup.string()
      .required('Please enter a valid email ID')
      .min(5, ERROR_MIN_5_CHAR)
      .matches(
        /^[A-Za-z0-9][A-Za-z0-9._%+-]*@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}$/,
        'Please enter a valid email ID'
      )
      .matches(emailRegex, 'Please enter a valid email ID')
      .max(255, ERROR_MAX_255_CHAR)
      .email(ERROR_MAIL_FORMAT),
  })
}

export const ModalConnectWithPatient: FC = () => {
  const {userId} = useContext(AuthContext)
  const dispatch = useDispatch()
  const {dispatchAction} = useDispatchAction()
  const isMobile = useMediaQuery({query: '(max-width: 768px)'})
  const {data} = useSelector((state: RootState) => state.apiGetLeadsProfileDetails)
  const patientData = data.patient_details
  const email = patientData?.email?.toLocaleLowerCase() ?? ''
  const {doctorData} = useSelector((state: RootState) => state.apiDoctorProfileGet)
  const [loading, setLoading] = useState(false)
  const {isStarterPlanUser} = useAllUserPlan()
  const {permissionChecks} = useFeatureAccess()
  const patientInvitationPermissions =
    permissionChecks?.patientManagement?.patientInvitation?.isAddable || isStarterPlanUser

  const formik = useFormik({
    initialValues: {email: email?.toLocaleLowerCase()},
    enableReinitialize: true,
    validationSchema: schema(),
    onSubmit: async (values) => {
      setLoading(true)
      const postData = {
        data: {
          patient_id: patientData?.id,
          invitation_id: data?.invitation_details?.invitation_id,
          first_name: patientData?.first_name,
          last_name: patientData?.last_name ?? '',
          email: values.email === patientData?.email ? null : values.email?.toLocaleLowerCase(),
          invitation_status: 'SENT',
          practice_location: patientData.practice_location,
          age: patientData?.age ?? '',
          gender: patientData?.gender,
          customer_mapped_id: patientData?.customer_mapped_id,
        },
      }
      dispatch(postApiDataAddPatientDetailsUpdateSlice(postData) as any)
        .unwrap()
        .then(() => {
          const postData = {
            data: {
              patient_id: patientData?.id,
              doctor_name: `Dr ${doctorData?.first_name} ${doctorData?.last_name ?? ''}`,
            },
          }
          dispatch(postApiDataAddAndSendInvite(postData) as any)
            .unwrap()
            .then(() => {
              const postData = {
                patient_id: patientData?.id,
                doctor_id: safeParseInt(userId),
              }
              dispatch(getLeadsProfileDetails(postData) as any)
              formik.resetForm()
              dispatch(setIsModalConnectWithPatientOpen(false))
              setLoading(false)
              dispatchAction(
                getGettingStartedStepDetails({
                  patient_id: safeParseInt(patientData?.id),
                  filter_by_step: 'ASSESSMENT',
                })
              )
            })
            .catch(() => {
              ErrorToast('You can send only 1 invite per day')
              setLoading(false)
            })
        })
        .catch((error: string) => {
          if (error === 'PI005' || error === 'PI002') {
            formik.setFieldError('email', 'Duplicate profile already exists')
          }
          setLoading(false)
        })
    },
  })
  const isEmailValid = hasValue(formik.values.email?.toLocaleLowerCase())

  return (
    <ModalLayout isResponsive={isMobile}>
      <div className='flex flex-shrink-0 items-start justify-between rounded-t-md mb-4'>
        <div>
          <h1 className='font-semibold text-2xl'>Invite your patient</h1>
          <p className='text-textColor mt-1'>
            Onboard your patient via email invite to start their treatment tracking.
          </p>
        </div>
        <div
          onClick={() => {
            identifyUser()
            formik.resetForm()
            dispatch(setIsModalConnectWithPatientOpen(false))
          }}
        >
          <CommonSVG svg={SVG_CROSS} width='36' height='36' />
        </div>
      </div>
      <InfoCard
        title='Once patient is onboarded, they cannot change email'
        showButton={false}
        className='border border-primaryColor p-3'
      />
      <form onSubmit={formik.handleSubmit}>
        <div className='mt-5'>
          <InputText
            name='email'
            className=''
            label='Email'
            placeholder='Enter your email ID'
            classNameLabel='text-sm text-textColor font-medium'
            formik={formik}
            required={true}
            maxLength={50}
          />
        </div>
        {patientInvitationPermissions && (
          <div className='mt-6'>
            <AntdButton
              loading={loading}
              text={'Confirm and send'}
              className={clsx(
                'w-full h-11 mt-2  ',
                !isEmailValid
                  ? '!bg-mediumGray !text-textColor '
                  : 'hover:!bg-primaryColor bg-primaryColor '
              )}
              isDisabled={!isEmailValid || loading}
              onClick={() => formik.handleSubmit()}
            />
          </div>
        )}
      </form>
    </ModalLayout>
  )
}
