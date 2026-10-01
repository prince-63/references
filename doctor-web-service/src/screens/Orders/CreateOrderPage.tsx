import {IMAGE_APP_LOGO} from 'utils/ImageConst'
import useDispatchAction from '@hooks/useDispatchAction'
import {
  clearOrder,
  getVendorsList,
  resetPatientDetails,
  updateCurrentStep,
} from 'redux/Slices/AppSlice/orders/orders.slice'
import {getCreateOrderSteps} from './components/CreateOrderSteps'
import userOrderDetails from './hooks/userOrderDetails'
import useSubscriptionDetails from '@hooks/useSubscriptionDetails'
import getStepItems from './Steps/helpers/getStepItems'
import {useLocation, useParams, useSearchParams} from 'react-router-dom'
import hasValue from 'utils/hasValue'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import {useContext, useEffect, useState, useMemo} from 'react'
import When from 'components/when/When'
import {AuthContext} from 'context/AuthContext'
import {safeParseInt} from 'utils/ConstFunctions'
import {
  resetCaseRecordState,
  resetFilesUploadStatus,
} from 'redux/Slices/AppSlice/CaseRecords/CaseRecords.slice'
import orderStatusConstants from '@constants/orderStatus.constants'
import {getApiDataDoctorProfile} from 'redux/Slices/AppSlice/DoctorProfile/DoctorProfileGetSlice'
import useAllUserPlan from '@hooks/useAllUserPlan'
import CustomStepper from './components/CustomStepper'
import {Copy, X} from 'lucide-react'
import {resetOrderId} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileFiles.slice'

const HEADER_HEIGHT = 72

const CreateOrderPage = () => {
  const {dispatchAction} = useDispatchAction()
  const {currentStep} = useSelector((state: RootState) => state.orders)
  const {order} = userOrderDetails(true)
  useSubscriptionDetails(true)
  const {orderId} = useParams()
  const isEditOrder = hasValue(orderId)
  const location = useLocation()
  const {state} = location
  const {userId} = useContext(AuthContext)
  const {isPractice, isOrganization, isCustomer, isGrowthPlanUser, isAlignerCompanyOrg} =
    useAllUserPlan()
  const isLabSelected = hasValue(order?.order_details?.target_user_details?.profile_id)
  const [searchParams] = useSearchParams()
  const isAlignerOrderFromParam = searchParams.get('is_aligner_order') === 'true'

  const isAlignerOrder = useMemo(() => isAlignerOrderFromParam, [isAlignerOrderFromParam])

  useEffect(() => {
    if (order && order.status === orderStatusConstants.NEED_MORE_INFO) {
      dispatchAction(updateCurrentStep(1))
    }

    if (isOrganization || isCustomer) {
      dispatchAction(
        getVendorsList({
          doctor_id: safeParseInt(userId),
        })
      )
    }

    return () => {
      dispatchAction(clearOrder())
      dispatchAction(resetFilesUploadStatus())
      dispatchAction(resetPatientDetails())
      dispatchAction(resetOrderId)
      dispatchAction(resetCaseRecordState())
      dispatchAction(updateCurrentStep(0))
    }
  }, [])

  useEffect(() => {
    const postData = {
      doctor_id: safeParseInt(userId),
    }
    dispatchAction(getApiDataDoctorProfile(postData))
  }, [userId])

  const steps = useMemo(
    () => getCreateOrderSteps({isPlanningOrder: isAlignerOrder}),
    [isAlignerOrder]
  )

  useEffect(() => {
    if (currentStep > steps.length - 1) {
      dispatchAction(updateCurrentStep(Math.max(steps.length - 1, 0)))
    }
  }, [currentStep, dispatchAction, steps.length])

  const stepItems = useMemo(
    () =>
      getStepItems({
        order,
        isEditOrder,
        currentStep,
        isLabSelected,
        isPractice,
        steps,
        isPlanningOrder: isAlignerOrder,
      }),
    [order, isEditOrder, currentStep, isLabSelected, isPractice, steps, isAlignerOrder]
  )

  const [isInfoCardVisible, setIsInfoCardVisible] = useState(state?.isClone || false)

  return (
    <div className='h-screen bg-gray-50/50 overflow-hidden'>
      {/* Header */}
      <div
        className='w-full flex justify-between items-center px-6 bg-white border-b border-mediumGray/40 shadow-sm shrink-0'
        style={{height: HEADER_HEIGHT}}
      >
        <div className='flex items-center gap-4'>
          <img src={IMAGE_APP_LOGO} alt='logo' className='md:w-[140px] w-[100px]' />
          <div className='hidden md:block h-6 w-px bg-mediumGray' />
        </div>

        <div className='md:hidden text-xs font-medium bg-primarySupport text-primaryColor px-3 py-1 rounded-full'>
          Step {currentStep + 1} of {steps.length}
        </div>
      </div>

      {/* Page body */}
      <div
        className='overflow-hidden flex flex-col'
        style={{height: `calc(100vh - ${HEADER_HEIGHT}px)`}}
      >
        <When isTrue={isInfoCardVisible}>
          <div className='mx-4 md:mx-auto md:w-3/4 mt-4 shrink-0'>
            <div className='flex items-start gap-3 bg-primarySupport border border-primaryColor/30 rounded-xl p-4'>
              <div className='w-8 h-8 rounded-lg bg-primaryColor/10 flex items-center justify-center shrink-0 mt-0.5'>
                <Copy className='w-4 h-4 text-primaryColor' />
              </div>
              <div className='flex-1'>
                <p className='text-sm font-semibold text-black'>Cloned order</p>
                <p className='text-sm text-textColor mt-0.5'>
                  This order has been cloned with the same details. Review and edit if needed before
                  sending.
                </p>
              </div>
              <button
                type='button'
                onClick={() => setIsInfoCardVisible(false)}
                className='w-8 h-8 rounded-lg hover:bg-primaryColor/10 flex items-center justify-center transition-colors shrink-0'
              >
                <X className='w-4 h-4 text-primaryColor' />
              </button>
            </div>
          </div>
        </When>

        <div className='flex-1 min-h-0 flex flex-col md:flex-row mx-auto w-full gap-4 md:w-[90%] lg:w-4/5 xl:w-3/4 px-4 md:px-0 mt-6 pb-4'>
          <div className='hidden md:block w-[220px] shrink-0 h-full'>
            <div className='h-full bg-white rounded-2xl border border-mediumGray/40 shadow-sm p-5 flex flex-col'>
              <p className='text-xs font-semibold text-textColor uppercase tracking-wider mb-4'>
                Progress
              </p>
              <CustomStepper
                direction='vertical'
                current={currentStep}
                onChange={(v) => dispatchAction(updateCurrentStep(v))}
                items={stepItems.map((item: any, index: number) => ({
                  ...item,
                  id: item.id ?? index,
                }))}
              />
            </div>
          </div>

          {/* Mobile stepper */}
          <div className='block md:hidden bg-white rounded-xl border border-mediumGray/40 shadow-sm p-3 mb-2 overflow-x-auto shrink-0'>
            <CustomStepper
              direction='horizontal'
              current={currentStep}
              onChange={(v) => dispatchAction(updateCurrentStep(v))}
              items={stepItems.map((item: any, index: number) => ({
                ...item,
                id: item.id ?? index,
              }))}
            />
          </div>

          {/* Right content area */}
          <div className='flex-1 min-h-0 flex flex-col overflow-hidden rounded-2xl'>
            {/* Scrollable step content */}
            <div className='flex-1 min-h-0 overflow-y-auto pr-1'>
              <When isTrue={isPractice || isGrowthPlanUser || isAlignerCompanyOrg || isCustomer}>
                {steps[currentStep]?.content}
              </When>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateOrderPage
