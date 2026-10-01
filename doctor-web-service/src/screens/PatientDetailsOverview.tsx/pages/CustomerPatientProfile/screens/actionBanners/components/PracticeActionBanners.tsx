import orderStatusConstants from '@constants/orderStatus.constants'
import useDispatchAction from '@hooks/useDispatchAction'
import {AuthContext} from 'context/AuthContext'
import {FileText, AlertCircle, Eye} from 'lucide-react'
import {useContext, useState} from 'react'
import {useSelector} from 'react-redux'
import {useNavigate, useParams} from 'react-router-dom'
import useProfileBasePath from '@hooks/useProfileBasePath'
import {resetCaseRecordState} from 'redux/Slices/AppSlice/CaseRecords/CaseRecords.slice'
import {getPatientPlanningStepper} from 'redux/Slices/AppSlice/CustomerPatientProfile/CustomerPatientProfile.slice'
import {getLeadsProfileDetails} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileDetails.slice'
import {updateOrder, updateCurrentStep} from 'redux/Slices/AppSlice/orders/orders.slice'
import {RootState} from 'redux/store'
import {safeParseInt} from 'utils/ConstFunctions'
import ResumePlanningModal from '../../../components/ResumePlanningModal'
import {BannerWrapper, BannerCTA} from '../CaseActionBanner'

const PracticeActionBanners = () => {
  const navigate = useNavigate()
  const {patientId} = useParams<{patientId: string}>()
  const {userId} = useContext(AuthContext)
  const profileBasePath = useProfileBasePath()
  const {dispatchAction} = useDispatchAction()

  const {planning_stepper, active_order_id, orderList} = useSelector(
    (state: RootState) => state.customerPatientProfile
  )

  const [showResumeModal, setShowResumeModal] = useState(false)
  const [resumeLoading, setResumeLoading] = useState(false)

  const orderStatus = planning_stepper?.actual_order_status ?? null

  /* ── Move to In Progress handler ── */
  const handleMoveToInProgress = async () => {
    if (!active_order_id) return
    setResumeLoading(true)
    try {
      await dispatchAction(
        updateOrder({
          order_id: String(active_order_id),
          status: orderStatusConstants.ORDERED,
          doctor_id: safeParseInt(userId),
        })
      ).unwrap()

      // Refresh stepper data
      dispatchAction(
        getPatientPlanningStepper({
          order_id: String(active_order_id),
          patient_id: safeParseInt(patientId),
          doctor_id: safeParseInt(userId),
        })
      )
      setShowResumeModal(false)
    } catch {
      // error handled by redux
    } finally {
      setResumeLoading(false)
    }
  }

  /* ── Banner config by status ── */

  if (orderStatus === null || orderStatus === orderStatusConstants.DRAFT) {
    return (
      <BannerWrapper variant='purple'>
        <div className='flex md:items-center'>
          <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primarySupport'>
            <FileText size={18} className='text-primaryColor' />
          </div>
          <div className='flex flex-col gap-0.5'>
            <span className='text-sm font-semibold text-primaryColor'>Case in Draft</span>
            <span className='text-xs text-primaryColor'>
              Complete the case details and submit to the lab to begin planning.
            </span>
          </div>
        </div>
        <BannerCTA
          label='Submit Case'
          variant='purple'
          onClick={() => {
            const postData = {
              patient_id: safeParseInt(patientId),
              doctor_id: safeParseInt(userId),
            }
            dispatchAction(getLeadsProfileDetails(postData) as any)
              .unwrap()
              .then(() => {
                dispatchAction(resetCaseRecordState())
                if (planning_stepper?.order_status === 'DRAFT' && orderList?.length > 0) {
                  dispatchAction(updateCurrentStep(1))
                  navigate(`/customer/create-order/${active_order_id}?refinement-draft=true`, {
                    state: {patientId, fromProfile: true},
                  })
                } else if (planning_stepper?.order_status === 'DRAFT') {
                  dispatchAction(updateCurrentStep(1))
                  navigate(`/customer/create-order/${active_order_id}`, {
                    state: {patientId, fromProfile: true},
                  })
                } else if (orderStatus === orderStatusConstants.DRAFT) {
                  dispatchAction(updateCurrentStep(1))
                  navigate(`/customer/create-order/${active_order_id}`, {
                    state: {patientId, fromProfile: true},
                  })
                } else {
                  dispatchAction(updateCurrentStep(0))
                  navigate('/customer/create-order', {
                    state: {patientId, fromProfile: true},
                  })
                }
              })
          }}
        />
      </BannerWrapper>
    )
  }

  if (orderStatus === orderStatusConstants.NEED_MORE_INFO) {
    return (
      <>
        <BannerWrapper variant='red'>
          <div className='flex md:items-center '>
            <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-redSupport'>
              <AlertCircle size={18} className='text-red' />
            </div>
            <div className='flex flex-col gap-0.5'>
              <span className='text-sm font-semibold text-red'>More Information Required</span>
              <span className='text-xs text-red max-w-xl'>
                {planning_stepper?.notes && (
                  <>
                    <span className='font-medium'>Lab Comments:</span> {planning_stepper.notes}
                    .{' '}
                  </>
                )}
                <div>
                  After adding the requested details, move the case back to In&nbsp;Progress to
                  resume planning.
                </div>
              </span>
            </div>
          </div>
          <BannerCTA
            label='Move to In Progress'
            variant='red'
            onClick={() => setShowResumeModal(true)}
          />
        </BannerWrapper>

        <ResumePlanningModal
          open={showResumeModal}
          onClose={() => setShowResumeModal(false)}
          onConfirm={handleMoveToInProgress}
          loading={resumeLoading}
        />
      </>
    )
  }

  if (orderStatus === orderStatusConstants.IN_REVIEW) {
    const planCount = planning_stepper?.pending_review_treatment_count ?? 0
    return (
      <BannerWrapper variant='blue'>
        <div className='flex md:items-center'>
          <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondarySupport'>
            <Eye size={18} className='text-secondaryColor' />
          </div>
          <div className='flex flex-col gap-0.5'>
            <div className='text-sm font-semibold text-secondaryColor'>
              Action Required: Plan Review
            </div>
            <div className='text-xs text-secondaryColor'>
              {planCount} {planCount === 1 ? 'Plan is' : 'Plans are'} available for your review.
            </div>
          </div>
        </div>
        <BannerCTA
          label='View Plans'
          variant='blue'
          onClick={() =>
            navigate(`${profileBasePath}/${patientId}/plans?order_id=${active_order_id}`)
          }
        />
      </BannerWrapper>
    )
  }
}

export default PracticeActionBanners
