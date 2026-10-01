import orderStatusConstants from '@constants/orderStatus.constants'
import useDispatchAction from '@hooks/useDispatchAction'
import {AuthContext} from 'context/AuthContext'
import {FileText, AlertCircle, Eye} from 'lucide-react'
import {useContext, useState} from 'react'
import {useSelector} from 'react-redux'
import {useNavigate, useParams, useSearchParams} from 'react-router-dom'
import {setOpenShippingDetailsModal} from 'redux/Slices/AppSlice/LeadsProfile/GettingStartedOverview/GettingStartedOverview.slice'
import {resetCaseRecordState} from 'redux/Slices/AppSlice/CaseRecords/CaseRecords.slice'
import {getLeadsProfileDetails} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileDetails.slice'
import {updateCurrentStep} from 'redux/Slices/AppSlice/orders/orders.slice'
import {RootState} from 'redux/store'
import {safeParseInt} from 'utils/ConstFunctions'
import {BannerWrapper, BannerCTA} from '../CaseActionBanner'

const PracticeActionBanners = ({onViewShippingDetails}: {onViewShippingDetails?: () => void}) => {
  const navigate = useNavigate()
  const {patientId} = useParams<{patientId: string}>()
  const [searchParams] = useSearchParams()
  const {userId} = useContext(AuthContext)
  const {dispatchAction} = useDispatchAction()
  const {vsp_stepper, planning_stepper, patientData, loadingVspStatus} = useSelector(
    (state: RootState) => state.customerPatientProfile
  )
  const orderStatus = vsp_stepper?.order_status ?? null
  const production_status = patientData?.production_status ?? null
  const resolvedOrderId = searchParams.get('order_id') ?? patientData?.order_id ?? null
  const [dissmissBanner, setDissmissBanner] = useState(true)

  const isShowShipping =
    production_status === 'SHIPPED' && orderStatus === orderStatusConstants.COMPLETED

  /* ── Banner config by status ── */

  const shouldShowDraftBanner =
    !loadingVspStatus && (orderStatus === null || orderStatus === orderStatusConstants.DRAFT)

  if (shouldShowDraftBanner) {
    return (
      <BannerWrapper variant='purple'>
        <div className='flex  gap-2 md:items-center'>
          <div className='flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white'>
            <FileText size={18} className='text-primaryColor' />
          </div>
          <div className='flex flex-col gap-0.5'>
            <span className='text-base font-semibold text-primaryColor'>Case in Draft</span>
            <span className='text-sm text-primaryColor'>
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
                if (orderStatus === orderStatusConstants.DRAFT && resolvedOrderId) {
                  dispatchAction(updateCurrentStep(1))
                  navigate(`/vsp/create-order/${resolvedOrderId}?patient_id=${patientId}`, {
                    state: {patientId, fromProfile: true},
                  })
                } else {
                  dispatchAction(updateCurrentStep(0))
                  navigate(`/vsp/create-order?patient_id=${patientId}`, {
                    state: {patientId, fromProfile: true},
                  })
                }
              })
          }}
        />
      </BannerWrapper>
    )
  }

  if (orderStatus === orderStatusConstants.NEED_MORE_INFO && dissmissBanner) {
    return (
      <>
        <BannerWrapper variant='red'>
          <div className='flex md:items-center '>
            <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-redSupport'>
              <AlertCircle size={18} className='text-red' />
            </div>
            <div className='flex flex-col gap-0.5'>
              <span className='text-sm font-semibold text-red'>Information Requested</span>
              <span className='text-xs text-red max-w-xl'>
                <div>Additional information has been requested.</div>
                {planning_stepper?.notes && (
                  <>
                    <span className='font-medium'>Lab Comments:</span> {planning_stepper.notes}
                    .{' '}
                  </>
                )}
              </span>
            </div>
          </div>
          <BannerCTA label='' variant='red' onClick={() => setDissmissBanner(false)} />
        </BannerWrapper>
      </>
    )
  }

  if (orderStatus === orderStatusConstants.IN_REVIEW) {
    return (
      <BannerWrapper variant='blue'>
        <div className='flex  gap-2 md:items-center'>
          <div className='flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white'>
            <Eye size={18} className='text-secondaryColor' />
          </div>
          <div className='flex flex-col gap-0.5'>
            <div className='text-base font-semibold text-secondaryColor'>
              Action Required: Plan Review
            </div>
            <div className='text-sm text-secondaryColor'>
              Plan is available for your review. Please check and approve to proceed.{' '}
            </div>
          </div>
        </div>
        <BannerCTA
          label='View Plans'
          variant='blue'
          onClick={() => navigate(`/vsp-profile/${patientId}/plans?order_id=${resolvedOrderId}`)}
        />
      </BannerWrapper>
    )
  }

  if (isShowShipping) {
    return (
      <BannerWrapper variant='blue'>
        <div className='flex gap-2  md:items-center'>
          <div className='flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white'>
            <Eye size={18} className='text-secondaryColor' />
          </div>
          <div className='flex flex-col gap-0.5'>
            <div className='text-base font-semibold text-secondaryColor'>Order Shipped </div>
            <div className='text-sm text-secondaryColor'>
              Your package is in transit and is currently on its way to your clinic.{' '}
            </div>
          </div>
        </div>
        <BannerCTA
          label='View Shipping Details'
          variant='blue'
          onClick={() => {
            if (onViewShippingDetails) {
              onViewShippingDetails()
              return
            }

            dispatchAction(setOpenShippingDetailsModal(true))
          }}
        />
      </BannerWrapper>
    )
  } else {
    null
  }
}

export default PracticeActionBanners
