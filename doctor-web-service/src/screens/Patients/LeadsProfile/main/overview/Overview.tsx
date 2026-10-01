import {useContext, useEffect} from 'react'
import {AuthContext} from 'context/AuthContext'
import trackingMethodTagTypes from '@constants/trackingMethodTagTypes'
import Page from 'components/page/Page'
import useDispatchAction from '@hooks/useDispatchAction'
import When from 'components/when/When'
import {useSelector} from 'react-redux'
import {useNavigate, useParams} from 'react-router-dom'
import {RootState} from 'redux/store'
import OverviewPrompt from './components/TrackingNotActivePrompt'
import {safeParseInt} from 'utils/ConstFunctions'
import getColorPalette from 'utils/getColorPalette'
import UnassignedPatientOverviewPage from './UnassignedOrAssignedToPracticePatientOverviewPage'
import showUnassignedOrAssignedToPracticePatientOverviewPage from './helpers/showUnassignedOrAssignedToPracticePatientOverviewPage'
import patientAssignedTypeConstants from '@constants/patientAssignedType.constants'
import getPatientAssignedTo from '@utils/getPatientAssignedTo'
import useAllUserPlan from '@hooks/useAllUserPlan'
import InfoCard from 'components/instruction/InfoCard'
import {getNextStepInfo} from './helpers/getNextStepInfo'
import hasValue from 'utils/hasValue'
import {getAllCaseRecord} from 'redux/Slices/AppSlice/CaseRecords/CaseRecords.slice'
import {CaseRecordResponse} from 'redux/Slices/AppSlice/CaseRecords/CaseRecord.type'
import {getApiDataPrescriptionByPatient} from 'redux/Slices/AppSlice/Prescription/Prescription.slice'
import {getPatientDetails} from 'redux/Slices/AppSlice/Profile/Profile.slice'

const Overview = () => {
  const {patientId} = useParams()
  const {profileId} = useContext(AuthContext)
  const navigate = useNavigate()
  const {dataLeadsOverview: dataLeadsData} = useSelector((state: RootState) => state.leadsProfile)
  const {dispatchAction} = useDispatchAction()
  const {data} = useSelector((state: RootState) => state.apiGetLeadsProfileDetails)
  const {isPractice} = useAllUserPlan()
  const patientData = data.patient_details
  const patientAssignedTo = getPatientAssignedTo(profileId, patientData)
  const gettingStartedDetails = data.getting_started_details
  const {patientDetailsList} = useSelector((state: RootState) => state.profile)

  const {gettingStartedStepData} = useSelector((state: RootState) => state.GettingStartedOverview)

  const {allCaseRecords: allCaseRecordsRaw} = useSelector((state: RootState) => state.caseRecord)
  const allCaseRecords: CaseRecordResponse[] = allCaseRecordsRaw ?? []

  useEffect(() => {
    getAllCaseRecords()
    getAllPrescription()
  }, [patientId])

  const getAllCaseRecords = async () => {
    const idFromUrl = hasValue(patientId) ? safeParseInt(patientId) : null
    if (idFromUrl) {
      await dispatchAction(getAllCaseRecord({patient_id: idFromUrl}))
    }
  }

  const getAllPrescription = async () => {
    const idFromUrl = hasValue(patientId) ? safeParseInt(patientId) : null
    if (idFromUrl) {
      await dispatchAction(getApiDataPrescriptionByPatient(idFromUrl))
    }
  }

  useEffect(() => {
    if (patientId) {
      dispatchAction(getPatientDetails({patientId: safeParseInt(patientId)}))
    }
  }, [patientId, dispatchAction])

  const isProductionCompleted =
    gettingStartedStepData?.in_manufacturing?.manufacturing_details_list?.some((batch: any) =>
      ['COMPLETED', 'SHIPPED', 'DELIVERED'].includes(batch.status)
    ) ||
    !!gettingStartedStepData?.in_transit?.manufacturing_id ||
    !!gettingStartedStepData?.starting_soon?.is_treatment_started

  // 1️⃣ Original helper result
  const rawNextStepInfo = getNextStepInfo(
    {
      ...(gettingStartedDetails || {}),
      finalise_tracking_enable:
        gettingStartedDetails?.finalise_tracking_enable || isProductionCompleted,
    },
    isPractice
  )

  // 2️⃣ New logic based on patientDetailsList.current_step
  const nextStepInfo = (() => {
    const currentStepVal = patientDetailsList?.current_step
      ? safeParseInt(patientDetailsList.current_step)
      : null

    // If we have a current_step from profile, use that mapping
    if (currentStepVal) {
      switch (currentStepVal) {
        case 3:
          // Case files
          return {
            step: 1, // Case Files step in StarterPlanAddPatientStepper
            title: 'Case files not added',
            description: 'Upload photos, scans and X-rays to complete the case record.',
            ctaLabel: 'Add case files',
          }

        case 4:
          // Prescription
          return {
            step: 2, // Prescription step
            title: 'Prescription not created',
            description: 'Create a prescription to proceed to treatment planning.',
            ctaLabel: 'Create prescription',
          }

        case 5:
          // Treatment setup
          return {
            step: 3, // Treatment Plan step
            title: 'Treatment setup pending',
            description: 'Review and finalise the treatment plan.',
            ctaLabel: 'Treatment setup',
          }

        case 6:
          // Start production
          return {
            step: 4, // Production details step
            title: 'Production not started',
            description: 'Add production details to start manufacturing.',
            ctaLabel: 'Start production',
          }

        case 7:
          // Start treatment
          return {
            step: 5, // Start treatment step
            title: 'Start treatment',
            description: "Begin the patient's treatment and tracking.",
            ctaLabel: 'Start treatment',
          }

        default:
          break
      }
    }

    if (!gettingStartedDetails) return rawNextStepInfo

    const caseInfoDetailsFilled = allCaseRecords?.length > 0
    const prescriptionCount = gettingStartedDetails?.prescription_count ?? 0
    const hasPrescription = prescriptionCount > 0

    if (!hasPrescription) {
      if (!caseInfoDetailsFilled) {
        return {
          step: 1,
          title: 'Case files not added',
          description: 'Upload photos, scans and X-rays to complete the case record.',
          ctaLabel: 'Add case files',
        }
      }

      return {
        step: 2,
        title: 'Prescription not created',
        description: 'Create a prescription to proceed to treatment planning.',
        ctaLabel: 'Create prescription',
      }
    }

    return rawNextStepInfo
  })()

  const handleTakeMeThereClick = () => {
    if (!patientId) return
    navigate(`/profile/${patientId}/plans-list`)
  }

  const handleResumeOnboarding = () => {
    if (!nextStepInfo || !patientId) return

    const params: Record<string, string> = {
      step: nextStepInfo.step.toString(),
      patient_id: patientId,
    }

    if (gettingStartedDetails?.order_id) {
      params.order_id = gettingStartedDetails.order_id.toString()
    }

    const queryParams = new URLSearchParams(params).toString()
    navigate(`/add-patient-starter?${queryParams}`)
  }

  if (
    showUnassignedOrAssignedToPracticePatientOverviewPage({
      patientAssignedTo,
      dataLeadsData,
    })
  ) {
    return (
      <UnassignedPatientOverviewPage
        {...{
          patientAssignedTo: patientAssignedTo as keyof Omit<
            typeof patientAssignedTypeConstants,
            'ASSIGNED_TO_ME'
          >,
          dataLeadsData,
        }}
      />
    )
  }

  return (
    <div className=''>
      <Page title='' loading={false}>
        {/* Show What's Next card when tracking is not enabled and there's a next step */}
        <When isTrue={!dataLeadsData?.tracking?.enabled && nextStepInfo !== null}>
          <InfoCard
            title={`What's Next? ${nextStepInfo?.title || ''}`}
            subTitle={nextStepInfo?.description || ''}
            color={getColorPalette().primaryColor}
            className='bg-primarySupport border-primaryColor'
            buttonText={nextStepInfo?.ctaLabel || ''}
            classNameButton='bg-primaryColor'
            onClick={handleResumeOnboarding}
          />
        </When>

        <When
          isTrue={
            !dataLeadsData?.tracking?.enabled &&
            dataLeadsData?.tracking?.status === trackingMethodTagTypes.DRAFT &&
            dataLeadsData?.tracking?.patient_data_fill_status === 'UNASSIGNED'
          }
        >
          <OverviewPrompt
            title='Tracking feature is not active'
            text='Check your tracking method page to complete the steps and get started'
            type='warning'
            handleTakeMeThereClick={handleTakeMeThereClick}
          />
        </When>

        <When
          isTrue={
            !dataLeadsData?.tracking?.enabled &&
            dataLeadsData?.tracking?.status === 'DRAFT' &&
            dataLeadsData?.tracking?.patient_data_fill_status === 'PATIENT_FILLED_DATA'
          }
        >
          <OverviewPrompt
            title='Your patient has sent you the data'
            text="You can now complete the tracking selection and monitor your patient's treatment"
            type='primary'
            handleTakeMeThereClick={handleTakeMeThereClick}
          />
        </When>
      </Page>
    </div>
  )
}

export default Overview
