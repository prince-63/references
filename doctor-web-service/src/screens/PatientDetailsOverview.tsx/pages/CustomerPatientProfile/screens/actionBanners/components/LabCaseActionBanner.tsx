import orderStatusConstants from '@constants/orderStatus.constants'
import {FileText, AlertCircle, Eye} from 'lucide-react'
import {useState} from 'react'
import {useSelector} from 'react-redux'
import {useNavigate, useParams} from 'react-router-dom'
import useProfileBasePath from '@hooks/useProfileBasePath'
import {RootState} from 'redux/store'
import {BannerWrapper, BannerCTA} from '../CaseActionBanner'
import {setTreatmentPlan} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileTreatmentPlan.slice'
import useDispatchAction from '@hooks/useDispatchAction'

const LabCaseActionBanner = () => {
  const navigate = useNavigate()
  const {patientId} = useParams()
  const profileBasePath = useProfileBasePath()
  const {dispatchAction} = useDispatchAction()
  const {planning_stepper, active_order_id} = useSelector(
    (state: RootState) => state.customerPatientProfile
  )
  const [dissmissBanner, setDissmissBanner] = useState(true)
  const orderStatus = planning_stepper?.actual_order_status ?? null

  if (orderStatus === orderStatusConstants.ORDERED) {
    return (
      <BannerWrapper variant='purple'>
        <div className='flex md:items-center'>
          <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primarySupport'>
            <FileText size={18} className='text-primaryColor' />
          </div>
          <div className='flex flex-col gap-0.5'>
            <span className='text-sm font-semibold text-primaryColor'>New Case Submitted</span>
            <span className='text-xs text-primaryColor'>
              A new case has been submitted. Review the records and proceed with planning or request
              additional information.{' '}
            </span>
          </div>
        </div>
        <div className='flex gap-2'>
          <BannerCTA
            label='Review Case'
            variant='purple'
            onClick={() => {
              navigate(`${profileBasePath}/${patientId}/order?order_id=${active_order_id}`)
            }}
          />
          <BannerCTA
            label='Create Plan'
            variant='purple'
            onClick={() => {
              dispatchAction(setTreatmentPlan({}))
              const queryParams = new URLSearchParams()
              queryParams.append('order_id', String(active_order_id))
              const queryString = queryParams.toString()
              navigate(
                `/${patientId}/plans-list/new/setupTreatmentPlan${queryString ? `?${queryString}` : ''}`
              )
            }}
          />
        </div>
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

  if (orderStatus === orderStatusConstants.RE_PLAN && dissmissBanner) {
    return (
      <BannerWrapper variant='red'>
        <div className='flex md:items-center'>
          <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-redSupport'>
            <Eye size={18} className='text-red' />
          </div>
          <div className='flex flex-col gap-0.5'>
            <div className='text-sm font-semibold text-red'>Revision Requested</div>
            <div className='text-xs text-red'>
              A revision has been requested for Plan. Please update the plan accordingly.
            </div>
          </div>
        </div>
        <BannerCTA label='' variant='red' onClick={() => setDissmissBanner(false)} />
      </BannerWrapper>
    )
  }

  if (orderStatus === orderStatusConstants.APPROVED && dissmissBanner) {
    return (
      <BannerWrapper variant='blue'>
        <div className='flex md:items-center'>
          <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondarySupport'>
            <Eye size={18} className='text-secondaryColor' />
          </div>
          <div className='flex flex-col gap-0.5'>
            <div className='text-sm font-semibold text-secondaryColor'>Plan Approved</div>
            <div className='text-xs text-secondaryColor'>
              Plan has been approved by the customer.
            </div>
          </div>
        </div>
        <BannerCTA label='' variant='blue' onClick={() => setDissmissBanner(false)} />
      </BannerWrapper>
    )
  }

  if (orderStatus === orderStatusConstants.STL_FILES_REQUESTED && dissmissBanner) {
    return (
      <BannerWrapper variant='blue'>
        <div className='flex md:items-center'>
          <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondarySupport'>
            <Eye size={18} className='text-secondaryColor' />
          </div>
          <div className='flex flex-col gap-0.5'>
            <div className='text-sm font-semibold text-secondaryColor'>STL Requested</div>
            <div className='text-xs text-secondaryColor'>
              STL files have been requested for Plan.
            </div>
          </div>
        </div>
        <BannerCTA label='' variant='blue' onClick={() => setDissmissBanner(false)} />
      </BannerWrapper>
    )
  }
}

export default LabCaseActionBanner
