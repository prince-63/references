import useDispatchAction from '@hooks/useDispatchAction'
import {ModalConnectWithPatient} from 'components/modal/Leads/Overview/ModalConnectWithPatient'
import Page from 'components/page/Page'
import When from 'components/when/When'
import {AuthContext} from 'context/AuthContext'
import {useContext, useEffect, useMemo} from 'react'
import {useSelector} from 'react-redux'
import {useParams} from 'react-router-dom'
import {getManufacturingListDetails} from 'redux/Slices/AppSlice/LeadsProfile/GettingStartedOverview/GettingStartedOverview.slice'
import {getApiLeadsOverview} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfile.slice'
import {
  getAllTreatmentPlanList,
  getTreatmentPlan,
} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileTreatmentPlan.slice'
import treatmentPlanStatusConstants from '@constants/treatmentPlanStatus.constants'
import {RootState} from 'redux/store'
import InvitePatientInfoCard from 'screens/Patients/LeadsProfile/main/overview/components/InvitePatientInfoCard'
import StartingSoonStep from 'screens/Patients/LeadsProfile/main/overview/components/StartingSoonStep'
import PatientProfileOverview from 'screens/Patients/NewPatientProfile/PatientProfileOverview'
import {ApiGetData, safeParseInt} from 'utils/ConstFunctions'
import PaperPlaneTiltIcon from 'assets/icons/PaperPlaneTiltIcon'
import useAllUserPlan from '@hooks/useAllUserPlan'
import BracesTracking from './BracesTracking'

const Tracking = () => {
  const {patientId} = useParams()
  const {userId, organizationId} = useContext(AuthContext)
  const {isEnterprisePlanUser} = useAllUserPlan()

  const {dispatchAction} = useDispatchAction()
  const {data} = useSelector((state: RootState) => state.apiGetLeadsProfileDetails)
  const {dataLeadsOverview: dataLeadsData, loadingLeadsOverview} = useSelector(
    (state: RootState) => state.leadsProfile
  )
  const {allTreatmentPlanList, getAllTreatmentPlanListLoading} = useSelector(
    (state: RootState) => state.leadsProfileTreatmentPlanReducer
  )
  const {manufacturingListByPlan, loadingManufacturingListByPlan} = useSelector(
    (state: RootState) => state.GettingStartedOverview
  )
  const alignerJourneyId = dataLeadsData?.treatment_plan?.journey_id
  const tracking_enabled = dataLeadsData?.tracking?.enabled
  const bracesTrackingEnabled = dataLeadsData?.braces_journey_tracking_response?.enabled
  const bracesJourneyId = dataLeadsData?.braces_journey_tracking_response?.braces_journey_id

  const {isModalConnectWithPatientOpen} = useSelector(
    (state: RootState) => state.apiAddAndSendInvite
  )
  useEffect(() => {
    if (!patientId || !userId) return
    const postData: ApiGetData = {
      data: {
        patient_id: safeParseInt(patientId),
        doctor_id: safeParseInt(userId),
      },
    }
    dispatchAction(getApiLeadsOverview(postData))
  }, [dispatchAction, patientId, userId])

  useEffect(() => {
    if (!dataLeadsData?.treatment_plan_id) return
    dispatchAction(
      getTreatmentPlan({aligner_treatment_id: String(dataLeadsData?.treatment_plan_id ?? '')})
    )
  }, [dispatchAction, dataLeadsData?.treatment_plan_id])

  useEffect(() => {
    if (!patientId || !userId || !organizationId) return
    dispatchAction(
      getAllTreatmentPlanList({
        doctor_id: userId!,
        patient_id: patientId!,
        organization_id: safeParseInt(organizationId),
      })
    )
  }, [dispatchAction, patientId, userId, organizationId])

  const activeTreatmentPlan = useMemo(() => {
    if (!Array.isArray(allTreatmentPlanList) || allTreatmentPlanList.length === 0) {
      return null
    }
    return (
      allTreatmentPlanList.find(
        (plan) => plan.treatment_status === treatmentPlanStatusConstants.ACTIVE
      ) ?? allTreatmentPlanList[0]
    )
  }, [allTreatmentPlanList])

  const activePlanId = useMemo(() => {
    return safeParseInt(activeTreatmentPlan?.aligner_treatment_id ?? 0)
  }, [activeTreatmentPlan])

  useEffect(() => {
    if (!patientId || !activePlanId) return
    dispatchAction(
      getManufacturingListDetails({
        patient_id: safeParseInt(patientId),
        treatment_plan_id: activePlanId,
      })
    )
  }, [patientId, activePlanId])

  const manufacturingList = activePlanId ? manufacturingListByPlan?.[activePlanId] : undefined
  const hasDeliveredBatch =
    manufacturingList?.processed_manufacturing?.some((batch) => batch.status === 'DELIVERED') ??
    false
  const manufacturingLoading = activePlanId ? loadingManufacturingListByPlan?.[activePlanId] : false
  const hasLeadsOverviewData = !!dataLeadsData && Object.keys(dataLeadsData).length > 0
  const hasTreatmentPlanList = Array.isArray(allTreatmentPlanList) && allTreatmentPlanList.length > 0

  const pageLoading =
    (loadingLeadsOverview && !hasLeadsOverviewData) ||
    (getAllTreatmentPlanListLoading && !hasTreatmentPlanList) ||
    (!!manufacturingLoading && !manufacturingList)

  return (
    <Page loading={pageLoading}>
      <When isTrue={isModalConnectWithPatientOpen}>
        <ModalConnectWithPatient />
      </When>
      {pageLoading ? null : bracesTrackingEnabled && bracesJourneyId ? (
        <BracesTracking
          patientId={safeParseInt(patientId)}
          bracesJourneyId={bracesJourneyId}
          practiceLocationId={data?.patient_details?.practice_location_id}
        />
      ) : tracking_enabled ? (
        <PatientProfileOverview
          loading={loadingLeadsOverview}
          alignerJourneyId={alignerJourneyId || null}
          patientId={safeParseInt(patientId)}
          treatmentStatus={dataLeadsData?.treatment_plan?.aligner_treatment_status}
        />
      ) : hasDeliveredBatch ? (
        <div className='flex flex-col gap-4 p-4'>
          <StartingSoonStep />
          <When isTrue={!data?.invitation_details?.is_patient_connected && !isEnterprisePlanUser}>
            <InvitePatientInfoCard
              // left section
              icon={<PaperPlaneTiltIcon color='#be8901' />} // orange icon
              iconWrapperClassName='flex h-12 w-14 items-center justify-center rounded-xl bg-orangeSupport' // orange bg wrapper
              title='Invite patient'
              description={
                !data?.invitation_details?.is_patient_invited
                  ? "The patient hasn't signed up yet. Send an invitation to start communicating."
                  : "An invite has been sent, but the patient hasn't signed up yet. Resend the invite and ensure they use the same email ID."
              }
              optionalLabel='' // hide “(Optional)” text
              // buttons
              // not in the reference design/ no right arrow
              primaryButtonClassName={
                !data?.invitation_details?.is_patient_invited
                  ? 'rounded-lg px-5 py-3 text-sm font-semibold !h-auto !border-none bg-[#BE8901] text-white transition-opacity duration-200 hover:!opacity-90'
                  : '!bg-lightGray !text-mediumGray cursor-not-allowed'
              }
              // card container
              cardClassName='flex flex-col md:flex-row md:items-center md:justify-between rounded-xl border border-mediumGray bg-white shadow-sm p-4'
              primaryButtonLabel={
                data?.invitation_details?.is_patient_invited ? 'Resend Invite' : 'Send Invite'
              }
              primaryButtonIcon={null}
            />
          </When>
        </div>
      ) : (
        <div className='flex items-center justify-center flex-col gap-4'>
          <div className='rounded-lg  bg-white p-6 text-center text-sm text-gray-500'>
            Details will be available when aligners are delivered.
          </div>
        </div>
      )}
    </Page>
  )
}

export default Tracking
