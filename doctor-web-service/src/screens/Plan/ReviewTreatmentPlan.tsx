import Page from 'components/page/Page'
import {useContext, useEffect, useState} from 'react'
import ReceivedPlan from './components/ReceivedPlan'
import SentPlan from './components/SentPlan'
import {useParams, useSearchParams} from 'react-router-dom'
import {RootState} from 'redux/store'
import {useSelector} from 'react-redux'
import hasValue from 'utils/hasValue'
import useDispatchAction from '@hooks/useDispatchAction'
import {
  getAllTreatmentPlanList,
  getSentToPracticeTreatmentPlan,
  getTreatmentPlan,
  setSentToPracticeTreatmentPlan,
  setTreatmentPlan,
} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileTreatmentPlan.slice'
import {AuthContext} from 'context/AuthContext'
import {safeParseInt} from 'utils/ConstFunctions'
import When from 'components/when/When'
import treatmentPlanStatusConstants from '@constants/treatmentPlanStatus.constants'
import InfoCard from 'screens/Patients/LeadsProfile/main/alignersTracking/components/InfoCard'
import userOrderDetails from 'screens/Orders/hooks/userOrderDetails'
import {getLeadsProfileDetails} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileDetails.slice'

const ReviewTreatmentPlan = () => {
  const [searchParams] = useSearchParams()

  const isNew = searchParams.get('new') === 'true'
  const orderId = searchParams.get('order_id')
  const {
    treatmentPlan,
    getTreatmentPlanLoading,
    getSentToPracticeTreatmentPlanLoading,
    sentToPracticeTreatmentPlan,
  } = useSelector((state: RootState) => state.leadsProfileTreatmentPlanReducer)
  const {dispatchAction} = useDispatchAction()
  const {patientId, treatmentId} = useParams()
  const {userId, organizationId} = useContext(AuthContext)
  const {loadingOrder} = userOrderDetails(true)
  const callGetTreatmentPlan = async () => {
    if (isNew) return
    await dispatchAction(
      getTreatmentPlan({
        aligner_treatment_id: treatmentId?.toString() ?? '',
      })
    )
  }
  useEffect(() => {
    if (!userId || !patientId) return
    callGetTreatmentPlan()
    dispatchAction(
      getLeadsProfileDetails({
        patient_id: safeParseInt(patientId),
        doctor_id: safeParseInt(userId),
      })
    )
    dispatchAction(
      getAllTreatmentPlanList({
        doctor_id: userId,
        patient_id: patientId,
        organization_id: safeParseInt(organizationId),
      })
    )
    return () => {
      dispatchAction(setTreatmentPlan({}))
      dispatchAction(setSentToPracticeTreatmentPlan({}))
    }
  }, [])
  useEffect(() => {
    if (hasValue(treatmentPlan.linked_treatment_plan_metadata?.linked_treatment_plan_id)) {
      dispatchAction(
        getSentToPracticeTreatmentPlan({
          aligner_treatment_id:
            treatmentPlan.linked_treatment_plan_metadata?.linked_treatment_plan_id?.toString() ??
            '',
        })
      )
    }
  }, [treatmentPlan.linked_treatment_plan_metadata?.linked_treatment_plan_id])
  const [showReplanModal, setShowReplanModal] = useState(false)

  return (
    <Page
      title='Review treatment plan'
      loading={getSentToPracticeTreatmentPlanLoading || getTreatmentPlanLoading || loadingOrder}
      showBackButton
      backNavigationRoute={`/orders/${orderId}`}
    >
      <div>
        <When
          isTrue={
            sentToPracticeTreatmentPlan.initiator_status === treatmentPlanStatusConstants.RE_PLAN
          }
        >
          <InfoCard
            className='border border-red bg-redSupport text-sm font-normal mb-4 '
            titleClassName='text-black text-base font-semibold'
            title={`Next step: Request re-plan ${treatmentPlan.treatment_plan_name}`}
            content={'Request re-plan on linked treatment plan received from Lab.'}
            showButton={true}
            infoIconColor='red'
            showArrowIcon={false}
            buttonText='Request for Re-Plan'
            buttonClassName='border-red bg-transparent text-red'
            onClick={() => {
              setShowReplanModal(true)
            }}
          />
        </When>
        <div className='flex flex-col md:flex-row gap-4'>
          <ReceivedPlan
            {...{
              showReplanModal,
              setShowReplanModal,
            }}
          />
          <SentPlan />
        </div>
      </div>
    </Page>
  )
}

export default ReviewTreatmentPlan
