import useDispatchAction from '@hooks/useDispatchAction'
import CustomerPatientHeader from './screens/header/CustomerPatientHeader'
import CaseActionBanner from './screens/actionBanners/CaseActionBanner'
import {useContext, useEffect, useRef, useState} from 'react'
import {AuthContext} from 'context/AuthContext'
import {Outlet, useLocation, useNavigate, useParams, useSearchParams} from 'react-router-dom'
import {safeParseInt} from 'utils/ConstFunctions'
import {
  getCustomerPatientProfile,
  getPatientPlanningStepper,
  resetCustomerPatientState,
  setSelectedOrderId,
} from 'redux/Slices/AppSlice/CustomerPatientProfile/CustomerPatientProfile.slice'
import {getAuditLogs} from 'redux/Slices/AppSlice/workflow/workflow.slice'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import {Drawer} from 'antd'
import {MessageSquare} from 'lucide-react'
import LabCustomerChat from './components/LabCustomerChat'
import {useFeatureAccess} from '@hooks/useFeatureAccess'
import useProfileBasePath from '@hooks/useProfileBasePath'
import {getActiveUsers, resetOrderFilters} from 'redux/Slices/AppSlice/orders/orders.slice'

const CustomerPatientProfile = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const {userId} = useContext(AuthContext)
  const {patientId} = useParams<{patientId: string}>()
  const profileBasePath = useProfileBasePath()
  const [searchParams] = useSearchParams()
  const {dispatchAction} = useDispatchAction()
  const {chatId, selectedOrderId, active_order_id} = useSelector(
    (state: RootState) => state.customerPatientProfile
  )
  const prevPatientIdRef = useRef<string | null>(null)
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false)
  const {permissionChecks} = useFeatureAccess()
  const assigneePermissions = permissionChecks?.patientProfileActions?.assignee
  const canEditAssignee = assigneePermissions?.isEditable ?? false
  const urlOrderId = searchParams.get('order_id')

  // const nextActionInfo = useMemo(() => {
  //   if (planning_stepper?.next_action) {
  //     return planning_stepper.next_action
  //   }
  //   return null
  // }, [planning_stepper])

  useEffect(() => {
    if (!patientId || !userId) return
    if (prevPatientIdRef.current !== patientId) {
      dispatchAction(resetCustomerPatientState())
      prevPatientIdRef.current = patientId
    }
    const payload = {
      patient_id: safeParseInt(patientId),
      doctor_id: safeParseInt(userId),
    }
    const urlOrderId = searchParams.get('order_id')
    const baseProfilePath = `${profileBasePath}/${patientId}`
    const isAtProfileRoot =
      location.pathname === baseProfilePath || location.pathname === `${baseProfilePath}/`
    // Case History
    dispatchAction(getAuditLogs({patient_id: safeParseInt(patientId)}))

    // Case Profile
    dispatchAction(getCustomerPatientProfile(payload))
      .unwrap()
      .then((res: {active_order_id?: string | null; orderList?: string[]}) => {
        const activeOrderId = res.active_order_id ?? null
        const orderList = res.orderList ?? []
        const isOrderIdValid = urlOrderId ? orderList.includes(urlOrderId) : false
        const effectiveOrderId = isAtProfileRoot
          ? activeOrderId
          : isOrderIdValid
            ? urlOrderId
            : activeOrderId

        if (isAtProfileRoot) {
          if (activeOrderId) {
            navigate(`${profileBasePath}/${patientId}/plans?order_id=${activeOrderId}`, {
              replace: true,
            })
          } else {
            navigate(`${profileBasePath}/${patientId}/plans`, {replace: true})
          }
        } else if (urlOrderId && isOrderIdValid) {
          dispatchAction(setSelectedOrderId(urlOrderId))
        } else if (activeOrderId) {
          const queryParams = new URLSearchParams(searchParams)
          queryParams.set('order_id', String(activeOrderId))
          navigate(`${location.pathname}?${queryParams.toString()}`, {
            replace: true,
            state: location.state,
          })
        }

        // Case Order Status
        dispatchAction(getPatientPlanningStepper({order_id: effectiveOrderId, ...payload}))
      })
  }, [dispatchAction, location.pathname, navigate, patientId, searchParams, userId])

  useEffect(() => {
    const baseProfilePath = `${profileBasePath}/${patientId}`
    if (!location.pathname.startsWith(baseProfilePath)) return

    const hasOrderParam = searchParams.get('order_id')
    if (hasOrderParam) return

    const effectiveOrderId = selectedOrderId ?? active_order_id
    if (!effectiveOrderId) return

    const queryParams = new URLSearchParams(searchParams)
    queryParams.set('order_id', String(effectiveOrderId))
    navigate(`${location.pathname}?${queryParams.toString()}`, {
      replace: true,
      state: location.state,
    })

    return () => {
      dispatchAction(resetOrderFilters)
    }
  }, [selectedOrderId, location.pathname, navigate, patientId, searchParams, active_order_id])

  useEffect(() => {
    if (!canEditAssignee || !userId) return
    dispatchAction(
      getActiveUsers({
        data: {
          sort_order: 'PRACTICE_NAME_ASC',
          page_number: 0,
          page_size: 0,
          search: '',
          doctor_id: safeParseInt(userId),
          invitation_status: 'ACCEPTED',
          invitation_roles: ['LAB_STAFF', 'INTERNAL_USER'],
        },
      })
    )
  }, [canEditAssignee, dispatchAction, userId])

  return (
    <div className='w-full flex flex-col md:flex-row gap-4 h-full min-h-0 overflow-hidden'>
      <div className='w-full md:w-3/4 flex flex-col gap-3 md:gap-4 overflow-y-auto min-h-0 scrollbar-hide'>
        <CustomerPatientHeader />
        {active_order_id === urlOrderId && <CaseActionBanner />}

        <div className='w-full rounded-2xl border border-gray-100 bg-transparent p-3 md:p-5 shadow-sm flex flex-col gap-4'>
          <Outlet />
        </div>
      </div>
      <div className='flex md:hidden justify-end'>
        <button
          type='button'
          aria-label='Open case chat and history'
          onClick={() => setIsMobileChatOpen(true)}
          className='inline-flex h-10 w-10 items-center justify-center rounded-xl border border-primaryColor/20 bg-primarySupport text-primaryColor shadow-sm'
        >
          <MessageSquare className='h-5 w-5' />
        </button>
      </div>
      <div className='hidden md:flex md:w-1/4 flex-col min-h-0 h-full'>
        <LabCustomerChat chatId={chatId} />
      </div>
      <Drawer
        title='Case Chat & History'
        placement='right'
        open={isMobileChatOpen}
        onClose={() => setIsMobileChatOpen(false)}
        width='100%'
        destroyOnClose
        rootClassName='md:hidden'
        styles={{
          body: {
            padding: 12,
            height: 'calc(100% - 56px)',
          },
        }}
      >
        <div className='h-full min-h-0'>
          <LabCustomerChat chatId={chatId} />
        </div>
      </Drawer>
    </div>
  )
}

export default CustomerPatientProfile

//  {nextActionInfo && (
//                 <InfoCard
//                   title={nextActionInfo}
//                   className='w-full text-orange border-orange bg-orangeSupport mb-4 !py-2'
//                   color='#be8901'
//                 />
//               )}
