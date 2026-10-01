import React, {Dispatch, SetStateAction, useEffect} from 'react'
import CustomDrawer from 'components/drawer/CustomDrawer'
import {Action, Aligner} from '../patientTimeline.types'
import ALIGNER_ACTIONS from '@constants/alignerActions.constants'
import AlignerChangeDrawerContent from './AlignerChangeDrawerContent'
import AlignerCheckInDrawerContent from './AlignerCheckInDrawerContent'
import {useSelector} from 'react-redux'
import {useContext, useState} from 'react'
import {AuthContext} from 'context/AuthContext'
import FooterButtons from 'screens/Patients/LeadsProfile/main/viewAlignerChanges/components/alignerChangeDetails/components/FooterButtons'
import ConfirmMoveToPreviousAligner from 'screens/Patients/LeadsProfile/main/viewAlignerChanges/modals/ConfirmMoveToPreviousAligner'
import {RootState} from 'redux/store'
import When from 'components/when/When'
import BroadCastSelectMessageContainer from 'screens/Patients/Chat/components/broadCast/BroadCastSelectMessageContainer'
import {Formik} from 'formik'
import ReviewAndSendMessageFooter from 'screens/Patients/Chat/components/broadCast/ReviewAndSendMessageFooter'
import {getAlignerUpdateDetails} from 'redux/Slices/AppSlice/LeadsProfile/AlignerTracking.slice'
import useDispatchAction from '@hooks/useDispatchAction'
import Page from 'components/page/Page'
import patientOverviewAlignerActionFilterConstantsConstants from '@constants/patientOverviewAlignerActionFilterConstants.constants'
import {useParams} from 'react-router-dom'
import {getFirstLetterCapitalOfWord} from 'utils/ConstFunctions'
import userTypes from '@constants/userTypes'
import {postApiDataPatientNudge} from 'redux/Slices/AppSlice/Dashboard/PatientNudgeSlice'
import SuccessToast from 'components/modal/Alert/SuccessToast'
interface TimelineDetailsDrawerProps {
  open: boolean
  onClose: () => void
  action?: Action | null
  aligner?: Aligner | null
  isSendReminder?: boolean
  selectedFilter: keyof typeof patientOverviewAlignerActionFilterConstantsConstants
  progressStatus: keyof typeof treatmentPlanStatusConstants | null
  setMoveToPreviousAlignerSuccess: Dispatch<SetStateAction<boolean>>
  onExtendWearDays: () => void
}
import * as Yup from 'yup'
import {MAX_CHAR_COUNT} from 'screens/Patients/Chat/components/broadCast/BroadCastSelectMessageDrawer'
import treatmentPlanStatusConstants from '@constants/treatmentPlanStatus.constants'
import {getPatientTimeline} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfile.slice'
import useAllUserPlan from '@hooks/useAllUserPlan'
const validationSchema = Yup.object({
  customMessage: Yup.string()
    .transform((value) => value.replace(/\s/g, ''))
    .max(MAX_CHAR_COUNT, `Please enter a message in less than ${MAX_CHAR_COUNT} characters`)
    .test('nonEmpty', 'Input cannot be empty or consist only of spaces', (value) => {
      return !!value && value.trim().length > 0
    })
    .required('Message is required'),
})
const TimelineDetailsDrawer: React.FC<TimelineDetailsDrawerProps> = ({
  open,
  onClose,
  action,
  aligner,
  isSendReminder,
  selectedFilter,
  progressStatus,
  setMoveToPreviousAlignerSuccess,
  onExtendWearDays,
}) => {
  if (!isSendReminder && !action) return null
  const isDeactivated = progressStatus === treatmentPlanStatusConstants.DEACTIVATED
  const isPaused = progressStatus === treatmentPlanStatusConstants.PAUSED
  const {dispatchAction} = useDispatchAction()
  const [gettingAlignerActionDetails, setGettingAlignerActionDetails] = useState(false)
  const {dataLeadsOverview} = useSelector((state: RootState) => state.leadsProfile)
  const isManualTracking = dataLeadsOverview?.tracking?.type === 'MANUAL'
  const getAlignerActionDetails = async () => {
    if (!action?.action_id) return
    setGettingAlignerActionDetails(true)
    await dispatchAction(
      getAlignerUpdateDetails({
        aligner_action_id: action.action_id,
      })
    )
      .unwrap()
      .then(() => {
        setGettingAlignerActionDetails(false)
      })
  }
  useEffect(() => {
    if (!isSendReminder) {
      getAlignerActionDetails()
    }
  }, [])
  const isAlignerChange = action?.action_type === ALIGNER_ACTIONS.ALIGNER_CHANGE
  const isCheckIn = action?.action_type === ALIGNER_ACTIONS.CHECK_IN
  const {patientId} = useParams()
  const {userId, userDetail}: any = useContext(AuthContext)

  const getDrawerTitle = () => {
    if (isSendReminder) return 'Add message'
    if (isAlignerChange) return 'Aligner Change Details'
    if (isCheckIn) return 'Check-in submitted'
    return ''
  }

  const renderDrawerContent = () => {
    if (isSendReminder) {
      return (
        <Formik
          initialValues={{
            customMessage:
              'Hi! We’ve noticed that your aligner change is significantly overdue. Delaying too long can affect your treatment progress. Please switch to your next aligner immediately, and let us know if you need any help!',
          }}
          validationSchema={validationSchema}
          onSubmit={async (values) => {
            const postData = {
              data: {
                patients: [{patient_id: patientId, patient_name: patientData?.full_name}],
                doctor_name: `${userDetail.first_name + ' ' + userDetail.last_name}`,
                doctor_id: userId,
                message: values.customMessage.trim(),
                role_name: getFirstLetterCapitalOfWord(userTypes.DOCTOR),
                created_by: `Dr ${userDetail.first_name + ' ' + userDetail.last_name}`,
                aligner_sr_no: aligner?.aligner_number,
                is_message_sent_from_patient_overview: true,
              },
            }

            await dispatchAction(postApiDataPatientNudge(postData))
            dispatchAction(
              getPatientTimeline({
                doctor_id: parseInt(userId as string),
                patient_id: parseInt(patientId as string),
                filter: selectedFilter,
              })
            )
            onClose()
            SuccessToast('message sent!')
          }}
        >
          {(props) => (
            <>
              <BroadCastSelectMessageContainer formik={props} hideQuickSelect={true} />
              <When isTrue={isSendReminder && !isPaused && !isDeactivated}>
                <ReviewAndSendMessageFooter
                  {...{
                    formik: props,
                    toggleAddMessageDrawer: () => {
                      onClose()
                    },
                  }}
                />
              </When>
            </>
          )}
        </Formik>
      )
    }
    if (isAlignerChange) {
      return <AlignerChangeDrawerContent />
    }

    if (isCheckIn) {
      return <AlignerCheckInDrawerContent aligner={aligner} />
    }
    return null
  }
  const {data} = useSelector((state: RootState) => state.apiGetLeadsProfileDetails)

  const patientData = data.patient_details
  const [isConfirmMoveToPreviousAlignerModalOpen, setIsConfirmMoveToPreviousAlignerModalOpen] =
    useState(false)

  const {isOrganization, isPractice, isStarterPlanUser, isEnterprisePlanUser ,isGrowthPlanUser} = useAllUserPlan()
  const {alignerUpdateDetails} = useSelector((state: RootState) => state.alignerTracking)
  const is_your_patient = patientData?.assigned_practice?.practice_doctor_id == userId

  const isAccessibleActionButton =
    (!isSendReminder && isOrganization && !isEnterprisePlanUser && is_your_patient) ||
    isStarterPlanUser ||
    isPractice || isGrowthPlanUser

  return (
    <CustomDrawer
      open={open}
      onClose={onClose}
      title={getDrawerTitle()}
      footer={
        isAccessibleActionButton &&
        !gettingAlignerActionDetails &&
        !alignerUpdateDetails.validated &&
        !isDeactivated &&
        !isPaused &&
        !isManualTracking ? (
          <FooterButtons
            setIsMoveToPreviousAlignerModalOpen={setIsConfirmMoveToPreviousAlignerModalOpen}
            {...{alignerUpdateDetails}}
            selectedFilter={selectedFilter}
            onExtendWearDays={onExtendWearDays}
          />
        ) : undefined
      }
    >
      <Page loading={gettingAlignerActionDetails}>{renderDrawerContent()}</Page>

      <When isTrue={isConfirmMoveToPreviousAlignerModalOpen}>
        <ConfirmMoveToPreviousAligner
          setIsConfirmMoveToPreviousAlignerModalOpen={setIsConfirmMoveToPreviousAlignerModalOpen}
          alignerUpdateDetails={alignerUpdateDetails}
          alignerJourneyId={aligner?.aligner_journey_id?.toString()}
          setMoveToPreviousAlignerSuccess={setMoveToPreviousAlignerSuccess}
        />
      </When>
    </CustomDrawer>
  )
}

export default TimelineDetailsDrawer
