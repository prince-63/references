import useDispatchAction from '@hooks/useDispatchAction'
import VspPatientHeader from './screens/header/VspPatientHeader'
import {ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react'
import {AuthContext} from 'context/AuthContext'
import {Outlet, useLocation, useNavigate, useParams, useSearchParams} from 'react-router-dom'
import {safeParseInt} from 'utils/ConstFunctions'
import {
  getVspPatientProfile,
  getVspPatientPlanningStepper,
  setSelectedOrderId,
  getPatientPlanningStepper,
} from 'redux/Slices/AppSlice/CustomerPatientProfile/CustomerPatientProfile.slice'
import {getAuditLogs} from 'redux/Slices/AppSlice/workflow/workflow.slice'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import {Drawer, Modal, Spin} from 'antd'
import {useFeatureAccess} from '@hooks/useFeatureAccess'
import {getActiveUsers} from 'redux/Slices/AppSlice/orders/orders.slice'
import VspLabCustomerChat from './components/VspLabCustomerChat'
import {ClipboardList, FileText, FolderOpen, Layers3, MessageSquare, Package2} from 'lucide-react'
import StatusStepper from './screens/header/components/StatusStepper'
import useAllUserPlan from '@hooks/useAllUserPlan'
import CaseActionBanner from './screens/actionBanners/CaseActionBanner'
import apiHelper from '@utils/apiHelper'
import HttpMethod from '@constants/httpMethods.constants'
import {URL_VSP_PRODUCTION_ORDER} from 'redux/Endpoints/apiEndpoints'
import ErrorToast from 'components/modal/Alert/ErrorToast'
import ShippingDetailsContainerTask from '../../components/ShippingDetailsContainerTask'
import {setOpenShippingDetailsModal} from 'redux/Slices/AppSlice/LeadsProfile/GettingStartedOverview/GettingStartedOverview.slice'
import {getVspOrderById} from 'redux/Slices/AppSlice/VSP/orders.slice'
import cn from '@utils/cn'
import Spinner from 'components/spinner/Spinner'

type TabChip = {
  key: string
  label: string
  icon?: ReactNode
}

const buildPathWithParams = (pathname: string, params: URLSearchParams) =>
  params.toString() ? `${pathname}?${params.toString()}` : pathname

const VspPatientProfile = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const {userId} = useContext(AuthContext)
  const {isEnterprisePlanUser} = useAllUserPlan()
  const {patientId} = useParams<{patientId: string}>()
  const [searchParams] = useSearchParams()
  const {dispatchAction} = useDispatchAction()
  const {selectedOrderId, active_order_id, loadingVspStatus, loadingPatient} = useSelector(
    (state: RootState) => state.customerPatientProfile
  )
  const {openShippingDetailsModal} = useSelector((state: RootState) => state.GettingStartedOverview)
  const {serviceConfig} = useSelector((state: RootState) => state.serviceConfiguration)
  const {chatId} = useSelector((state: RootState) => state.customerPatientProfile)
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false)
  const [shippingDetailsManufacturingId, setShippingDetailsManufacturingId] = useState<
    string | number | null
  >(null)
  const prevPatientIdRef = useRef<string | null>(null)
  const {permissionChecks} = useFeatureAccess()
  const assigneePermissions = permissionChecks?.patientProfileActions?.assignee
  const canEditAssignee = assigneePermissions?.isEditable ?? false
  const patientDetailsTabs = permissionChecks?.patientProfileActions
  const isPlanningSectionPath =
    !location.pathname.includes('/production') &&
    !location.pathname.includes('/tracking') &&
    !location.pathname.includes('/retention')

  useEffect(() => {
    if (!patientId || !userId) return
    if (prevPatientIdRef.current !== patientId) {
      dispatchAction(setSelectedOrderId(null))
      prevPatientIdRef.current = patientId
    }
    const payload = {
      patient_id: safeParseInt(patientId),
      doctor_id: safeParseInt(userId),
    }
    const urlOrderId = searchParams.get('order_id')
    const baseProfilePath = `/vsp-profile/${patientId}`
    const isAtProfileRoot =
      location.pathname === baseProfilePath || location.pathname === `${baseProfilePath}/`

    // Case History
    dispatchAction(getAuditLogs({patient_id: safeParseInt(patientId)}))

    // Case Profile
    dispatchAction(getVspPatientProfile(payload))
      .unwrap()
      .then((res: {active_order_id?: string | null; orderList?: string[]}) => {
        const activeOrderId = res.active_order_id ?? null
        const orderList = res.orderList ?? []
        const isOrderIdValid = urlOrderId ? orderList.includes(urlOrderId) : false

        if (isAtProfileRoot) {
          if (activeOrderId) {
            navigate(`/vsp-profile/${patientId}/plans?order_id=${activeOrderId}`, {replace: true})
          } else {
            navigate(`/vsp-profile/${patientId}/plans`, {replace: true})
          }
        } else if (isPlanningSectionPath && urlOrderId && isOrderIdValid) {
          dispatchAction(setSelectedOrderId(urlOrderId))
        } else if (isPlanningSectionPath && activeOrderId) {
          const queryParams = new URLSearchParams(searchParams)
          queryParams.set('order_id', String(activeOrderId))
          navigate(`${location.pathname}?${queryParams.toString()}`, {replace: true})
        }
      })
  }, [
    dispatchAction,
    isPlanningSectionPath,
    location.pathname,
    navigate,
    patientId,
    searchParams,
    userId,
  ])

  useEffect(() => {
    const baseProfilePath = `/vsp-profile/${patientId}`
    if (!location.pathname.startsWith(baseProfilePath)) return

    if (!isPlanningSectionPath) return

    const hasOrderParam = searchParams.get('order_id')
    if (hasOrderParam) return

    const effectiveOrderId = selectedOrderId ?? active_order_id
    if (!effectiveOrderId) return

    const queryParams = new URLSearchParams(searchParams)
    queryParams.set('order_id', String(effectiveOrderId))
    navigate(`${location.pathname}?${queryParams.toString()}`, {replace: true})
  }, [
    selectedOrderId,
    isPlanningSectionPath,
    location.pathname,
    navigate,
    patientId,
    searchParams,
    active_order_id,
  ])

  const effectiveOrderId = searchParams.get('order_id') ?? null

  useEffect(() => {
    const parsedPatientId = safeParseInt(patientId)
    const parsedDoctorId = safeParseInt(userId)
    if (!parsedPatientId || !parsedDoctorId) return

    // Always call this to get patient stepper status (including DRAFT)
    dispatchAction(getVspPatientPlanningStepper({order_id: effectiveOrderId}))

    // Only call these if we have an order ID
    if (effectiveOrderId) {
      dispatchAction(
        getPatientPlanningStepper({
          order_id: effectiveOrderId,
          patient_id: parsedPatientId,
          doctor_id: parsedDoctorId,
        })
      )
      dispatchAction(getVspOrderById({order_id: String(effectiveOrderId)}))
    }
  }, [dispatchAction, effectiveOrderId, patientId, userId])

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

  const getMainTabKey = () => {
    const pathname = location.pathname
    if (pathname.includes('/production')) return 'production'
    if (pathname.includes('/tracking')) return 'tracking'
    if (pathname.includes('/retention')) return 'retention'
    return 'planning'
  }

  const handleMainTabChange = (key: string) => {
    switch (key) {
      case 'production':
        navigateToPathWithOrder(`/vsp-profile/${patientId}/production`, effectiveOrderId)
        break

      default: {
        const params = new URLSearchParams(searchParams)
        if (effectiveOrderId) {
          params.set('order_id', String(effectiveOrderId))
        }
        navigate(buildPathWithParams(`/vsp-profile/${patientId}/plans`, params))
      }
    }
  }

  const getPlanningSubTabKey = () => {
    const pathname = location.pathname
    if (pathname.includes('/case-details')) return 'case-details'
    if (pathname.includes('/records')) return 'records'
    if (pathname.includes('/prescriptions')) return 'prescriptions'
    return 'plans'
  }

  const handlePlanningSubTabChange = (key: string) => {
    const params = new URLSearchParams(searchParams)
    const orderPath = (path: string) => buildPathWithParams(path, params)

    switch (key) {
      case 'case-details':
        navigate(orderPath(`/vsp-profile/${patientId}/case-details`))
        break
      case 'records':
        navigate(orderPath(`/vsp-profile/${patientId}/records`))
        break
      case 'prescriptions':
        navigate(orderPath(`/vsp-profile/${patientId}/prescriptions`))
        break
      default:
        navigate(orderPath(`/vsp-profile/${patientId}/plans`))
    }
  }

  const isPlanningTab = getMainTabKey() === 'planning'
  const mainTabs: TabChip[] = useMemo(
    () => [
      {
        key: 'planning',
        label: 'Planning Phase',
        icon: <Layers3 className='h-4 w-4' />,
      },
      {
        key: 'production',
        label: 'Production Phase',
        icon: <Package2 className='h-4 w-4' />,
      },
    ],
    []
  )

  const planningSubTabs = useMemo(() => {
    const tabs: TabChip[] = [
      {
        key: 'plans',
        label: 'Plans',
        icon: <Layers3 className='h-4 w-4' />,
      },
      {
        key: 'case-details',
        label: 'Case details',
        icon: <FileText className='h-4 w-4' />,
      },
      {
        key: 'records',
        label: 'Records',
        icon: <FolderOpen className='h-4 w-4' />,
      },
      {
        key: 'prescriptions',
        label: 'Prescription',
        icon: <ClipboardList className='h-4 w-4' />,
      },
    ]

    return tabs.filter((tab) => {
      if (tab.key === 'records') return patientDetailsTabs?.caseFiles?.isViewable !== false
      if (tab.key === 'prescriptions') {
        return patientDetailsTabs?.prescriptions?.isViewable !== false
      }
      return true
    })
  }, [patientDetailsTabs?.caseFiles?.isViewable, patientDetailsTabs?.prescriptions?.isViewable])

  const navigateToPathWithOrder = useCallback(
    (pathname: string, orderId?: string | null) => {
      const params = new URLSearchParams(searchParams)
      if (orderId) {
        params.set('order_id', String(orderId))
      } else {
        params.delete('order_id')
      }
      navigate(buildPathWithParams(pathname, params))
    },
    [navigate, searchParams]
  )

  const handleOpenShippingDetails = async () => {
    if (!effectiveOrderId) {
      ErrorToast('Unable to find shipping details for this case.')
      return
    }

    try {
      const response = await apiHelper(
        `${URL_VSP_PRODUCTION_ORDER}/${effectiveOrderId}`,
        HttpMethod.GET,
        undefined,
        false
      )
      const manufacturingId = serviceConfig?.VSP_PLANNING
        ? (response?.data?.production_id ?? null)
        : safeParseInt(response?.data?.production_id)

      if (!manufacturingId) {
        ErrorToast('Shipping details are not available yet.')
        return
      }

      setShippingDetailsManufacturingId(manufacturingId)
      dispatchAction(setOpenShippingDetailsModal(true))
    } catch {
      ErrorToast('Unable to open shipping details.')
    }
  }

  const handleCloseShippingDetails = () => {
    dispatchAction(setOpenShippingDetailsModal(false))
  }

  return (
    <Spin indicator={<Spinner loading />} spinning={loadingVspStatus || loadingPatient}>
      <div className='w-full flex flex-col md:flex-row gap-4 h-full min-h-0 overflow-hidden'>
        <div
          className={`w-full flex flex-col gap-3 md:gap-4 overflow-y-auto min-h-0 scrollbar-hide ${
            isPlanningTab ? 'md:w-3/4' : ''
          }`}
        >
          <VspPatientHeader />
          <div className='flex flex-col gap-3 md:gap-4'>
            {isEnterprisePlanUser && (
              <div className='w-full rounded-2xl border border-lightGray bg-white p-1.5 shadow-sm md:w-fit'>
                <div className='flex flex-wrap items-center gap-2'>
                  {mainTabs.map((tab) => {
                    const isActive = getMainTabKey() === tab.key

                    return (
                      <button
                        key={tab.key}
                        type='button'
                        onClick={() => handleMainTabChange(tab.key)}
                        className={cn(
                          'flex min-w-[180px] items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition-colors',
                          isActive
                            ? 'border-primaryColor bg-white text-primaryColor shadow-sm'
                            : 'border-transparent bg-lightGray text-textColor hover:bg-primarySupport hover:text-primaryColor'
                        )}
                      >
                        {tab.icon}
                        {tab.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {isPlanningTab && (
              <CaseActionBanner onViewShippingDetails={handleOpenShippingDetails} />
            )}

            {!!effectiveOrderId && <StatusStepper />}

            {isPlanningTab ? (
              <div className='w-full overflow-hidden rounded-2xl border border-lightGray bg-white shadow-sm'>
                <div className='flex items-center gap-1 overflow-x-auto border-b border-lightGray px-3 pt-3 scrollbar-hide md:px-4'>
                  {planningSubTabs.map((tab) => {
                    const isActive = getPlanningSubTabKey() === tab.key

                    return (
                      <button
                        key={tab.key}
                        type='button'
                        onClick={() => handlePlanningSubTabChange(tab.key)}
                        className={cn(
                          'flex shrink-0 items-center gap-2 border-b-2 px-3 py-3 text-sm font-semibold transition-colors',
                          isActive
                            ? 'border-primaryColor text-primaryColor'
                            : 'border-transparent text-textColor hover:text-primaryColor'
                        )}
                      >
                        <span className={cn(isActive ? 'text-primaryColor' : 'text-textColor')}>
                          {tab.icon}
                        </span>
                        {tab.label}
                      </button>
                    )
                  })}
                </div>

                <div className='min-h-0 overflow-y-auto p-3 md:p-5'>
                  <Outlet />
                </div>
              </div>
            ) : (
              <div className='w-full rounded-2xl border border-lightGray bg-white p-3 shadow-sm md:p-5'>
                <Outlet />
              </div>
            )}
          </div>
        </div>

        {isPlanningTab && (
          <>
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
              <VspLabCustomerChat chatId={chatId} />
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
                <VspLabCustomerChat chatId={chatId} />
              </div>
            </Drawer>
          </>
        )}

        <Modal
          open={openShippingDetailsModal}
          onCancel={handleCloseShippingDetails}
          footer={null}
          width={640}
          destroyOnClose
          centered
        >
          <div className='p-5'>
            <div className='mb-3 text-2xl font-semibold'>Shipping details</div>
            <ShippingDetailsContainerTask
              manufacturingId={shippingDetailsManufacturingId}
              onClose={handleCloseShippingDetails}
            />
          </div>
        </Modal>
      </div>
    </Spin>
  )
}

export default VspPatientProfile
