import useDispatchAction from '@hooks/useDispatchAction'
import useSubscriptionDetails from '@hooks/useSubscriptionDetails'
import hasValue from 'utils/hasValue'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import {useContext, useEffect, useMemo, useRef} from 'react'
import {useParams, useNavigate} from 'react-router-dom'
import {AuthContext} from 'context/AuthContext'
import {safeParseInt} from 'utils/ConstFunctions'
import {getApiDataDoctorProfile} from 'redux/Slices/AppSlice/DoctorProfile/DoctorProfileGetSlice'
import useAllUserPlan from '@hooks/useAllUserPlan'
import {getVendorsList, updateCurrentStep} from 'redux/Slices/AppSlice/orders/orders.slice'
import {
  getVspOrderById,
  resetCreateVspOrderState,
  resetGetVspOrderByIdState,
  resetOrders,
  resetUpdateVspOrderState,
} from 'redux/Slices/AppSlice/VSP/orders.slice'
import {Check} from 'lucide-react'
import cn from '@utils/cn'
import When from 'components/when/When'
import {getCreateOrderSteps} from './components/CreateOrderSteps'
import RouteToSmileLogo from '../../../assets/images/RtsLogo.svg'

const CreateOrder = () => {
  const {dispatchAction} = useDispatchAction()
  const navigation = useNavigate()
  const {currentStep} = useSelector((state: RootState) => state.orders)
  const {vspOrderDetails, createdVspOrder, getVspOrderByIdLoading} = useSelector(
    (state: RootState) => state.vspOrders
  )
  useSubscriptionDetails(true)
  const {orderId} = useParams()
  const {userId} = useContext(AuthContext)
  const {isPractice, isOrganization, isCustomer, isGrowthPlanUser, isAlignerCompanyOrg} =
    useAllUserPlan()
  const previousOrderIdRef = useRef<string | undefined>(orderId)
  const steps = useMemo(() => getCreateOrderSteps(), [])
  const stepItems = useMemo(() => {
    const hasOrder = hasValue(vspOrderDetails?.order_id)
    const hasCaseRecords = (vspOrderDetails?.case_records?.length ?? 0) > 0
    const hasPrescriptions = (vspOrderDetails?.prescriptions?.length ?? 0) > 0

    return steps.map((step: any, index: number) => {
      const isCurrent = index === currentStep
      const getStatusByValue = (value: boolean) =>
        isCurrent ? 'process' : value ? 'finish' : 'wait'

      const status =
        index === 0
          ? getStatusByValue(hasOrder)
          : index === 1
            ? getStatusByValue(hasCaseRecords)
            : index === 2
              ? getStatusByValue(hasPrescriptions)
              : isCurrent
                ? 'process'
                : 'wait'

      const disabled = index === 0 ? false : !hasOrder

      return {
        ...step,
        status,
        disabled,
      }
    })
  }, [currentStep, steps, vspOrderDetails])

  useEffect(() => {
    if (isOrganization || isCustomer) {
      dispatchAction(
        getVendorsList({
          doctor_id: safeParseInt(userId),
        })
      )
    }
  }, [isCustomer, isOrganization, userId])

  useEffect(() => {
    dispatchAction(
      getApiDataDoctorProfile({
        doctor_id: safeParseInt(userId),
      })
    )
  }, [dispatchAction, userId])

  useEffect(() => {
    const previousOrderId = previousOrderIdRef.current
    const isNewlyCreatedOrderTransition =
      !previousOrderId && !!orderId && String(createdVspOrder?.order_id ?? '') === String(orderId)

    if (isNewlyCreatedOrderTransition) {
      previousOrderIdRef.current = orderId
      return
    }

    // Clear stale VSP order data when loading a different VSP order flow
    dispatchAction(resetOrders())
    dispatchAction(resetGetVspOrderByIdState())
    dispatchAction(resetCreateVspOrderState())
    dispatchAction(resetUpdateVspOrderState())
    dispatchAction(updateCurrentStep(0))

    if (!orderId) {
      previousOrderIdRef.current = orderId
      return
    }
    dispatchAction(updateCurrentStep(1))
    dispatchAction(getVspOrderById({order_id: orderId}))
    previousOrderIdRef.current = orderId
  }, [createdVspOrder?.order_id, dispatchAction, orderId])

  useEffect(() => {
    if (currentStep > steps.length - 1) {
      dispatchAction(updateCurrentStep(Math.max(steps.length - 1, 0)))
    }
  }, [currentStep, dispatchAction, steps.length])

  return (
    <div className='flex min-h-screen flex-col bg-[radial-gradient(circle_at_top_left,#EEF2FF_0%,#F4F6FC_40%,#F7F8FC_100%)]'>
      <header className='flex h-[68px] items-center justify-between border-b border-[#E4E8F3] bg-white px-6'>
        <div className='flex items-center gap-3 cursor-pointer' onClick={() => navigation('/')}>
          <img src={RouteToSmileLogo} alt='brand logo' className='h-9' />
        </div>
      </header>

      <div className='flex flex-1 overflow-hidden'>
        <aside className='hidden w-[280px] shrink-0 border-r border-[#E4E8F3] bg-white md:block'>
          <div className='h-full overflow-y-auto px-6 py-8'>
            <div className='space-y-6'>
              {stepItems.map((step: any, index: number) => {
                const isDone = step?.status === 'finish'
                const isCurrent = step?.status === 'process'
                const isDisabled = Boolean(step?.disabled)
                return (
                  <div key={step?.id ?? index} className='relative'>
                    {index !== stepItems.length - 1 ? (
                      <div
                        className={cn(
                          'absolute left-[14px] top-[28px] h-[54px] w-[2px]',
                          isDone ? 'bg-[#4A62E8]' : 'bg-[#DFE3EE]'
                        )}
                      />
                    ) : null}
                    <button
                      type='button'
                      disabled={isDisabled}
                      onClick={() => dispatchAction(updateCurrentStep(index))}
                      className={cn(
                        'flex w-full items-center gap-3 text-left',
                        isDisabled ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'
                      )}
                    >
                      <div
                        className={cn(
                          'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold',
                          isDone || isCurrent
                            ? 'border-[#4A62E8] bg-[#4A62E8] text-white'
                            : 'border-[#C8CEDA] bg-white text-[#98A2B3]'
                        )}
                      >
                        {isDone ? <Check className='h-4 w-4' /> : index + 1}
                      </div>
                      <p
                        className={cn(
                          'text-[15px] font-semibold tracking-tight',
                          isCurrent ? 'text-[#101828]' : 'text-[#98A2B3]'
                        )}
                      >
                        {step?.title ?? steps[index]?.title ?? `Step ${index + 1}`}
                      </p>
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        </aside>

        <main className='flex flex-1 overflow-hidden'>
          <div className='w-full overflow-y-auto px-4 py-4 pb-28 md:px-8 md:py-6 md:pb-32'>
            <div className='mb-4 rounded-xl border border-[#DDE2F0] bg-white p-2 md:hidden'>
              <div className='flex items-center gap-2 overflow-x-auto'>
                {stepItems.map((step: any, index: number) => {
                  const isCurrent = step?.status === 'process'
                  return (
                    <button
                      key={step?.id ?? index}
                      type='button'
                      disabled={Boolean(step?.disabled)}
                      onClick={() => dispatchAction(updateCurrentStep(index))}
                      className={cn(
                        'shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold',
                        isCurrent
                          ? 'border-[#4A62E8] bg-[#EEF1FF] text-[#3754EB]'
                          : 'border-[#E3E7EF] bg-white text-[#667085]'
                      )}
                    >
                      {step?.title ?? steps[index]?.title ?? `Step ${index + 1}`}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className='mx-auto flex w-full max-w-[980px] flex-col gap-4'>
              <div>
                {getVspOrderByIdLoading ? (
                  <p className='mt-2 text-sm font-medium text-[#667085]'>Loading order...</p>
                ) : null}
              </div>

              <When isTrue={isPractice || isGrowthPlanUser || isAlignerCompanyOrg || isCustomer}>
                {steps[currentStep]?.content}
              </When>
            </div>
          </div>
          <div className='hidden w-[300px] shrink-0 border-[#E4E8F3] bg-[#F7F9FD] xl:block' />
        </main>
      </div>
    </div>
  )
}

export default CreateOrder
