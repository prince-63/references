import Page from 'components/page/Page'
import {Lock, ArrowRight} from 'lucide-react'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import {logToConsole} from '@utils/logToConsole'
import CreateVspProductionOrder, {CreateVspProductionOrderData} from './CreateVspProductionOrder'
import {useCallback, useContext, useEffect, useState} from 'react'
import apiHelper from '@utils/apiHelper'
import HttpMethod from '@constants/httpMethods.constants'
import {URL_VSP_PRODUCTION, URL_VSP_PRODUCTION_ORDER} from 'redux/Endpoints/apiEndpoints'
import VspProductionTracking, {
  ProductionOrderData,
  VspProductionOrderDetails,
} from './VspProductionTracking'
import {useParams, useSearchParams} from 'react-router-dom'
import {BASE_APP_PATIENT_URL} from 'redux/Endpoints/apiEndpoints'
import useDispatchAction from '@hooks/useDispatchAction'
import {safeParseInt} from 'utils/ConstFunctions'
import {changeWorkFlow} from 'redux/Slices/AppSlice/Kanban/Kanban.slice'
import {AuthContext} from 'context/AuthContext'
import SuccessToast from 'components/modal/Alert/SuccessToast'
import {getVspPatientPlanningStepper} from 'redux/Slices/AppSlice/CustomerPatientProfile/CustomerPatientProfile.slice'
import {getIndividualTask} from 'redux/Slices/AppSlice/workflow/workflow.slice'

const VspProduction = () => {
  const {userId} = useContext(AuthContext)
  const {patientId} = useParams()
  const {vsp_stepper, patientData, loadingVspStatus} = useSelector(
    (state: RootState) => state.customerPatientProfile
  )
  const isCompletedOrderStatus = vsp_stepper?.order_status === 'COMPLETED'
  const [isCreateOrderOpen, setIsCreateOrderOpen] = useState(false)
  const [productionOrder, setProductionOrder] = useState<ProductionOrderData | null>(null)
  const [orderDetails, setOrderDetails] = useState<VspProductionOrderDetails | null>(null)
  const [loadingOrder, setLoadingOrder] = useState(false)
  const [searchParams] = useSearchParams()
  const orderId = searchParams.get('order_id') || patientData?.order_id
  const {dispatchAction} = useDispatchAction()
  const {kanbanCardDetails} = useSelector((state: RootState) => state.customerPatientProfile)

  const fetchProductionOrder = useCallback(async () => {
    if (!orderId) return
    setLoadingOrder(true)
    try {
      const response = await apiHelper(
        `${URL_VSP_PRODUCTION_ORDER}/${orderId}`,
        HttpMethod.GET,
        undefined,
        false
      )
      if (response?.data) {
        setProductionOrder(response.data)

        dispatchAction(
          getIndividualTask({
            doctor_id: safeParseInt(userId),
            patient_id: safeParseInt(patientData.patient_id),
          } as any)
        )
      }
    } catch {
      setProductionOrder(null)
    } finally {
      setLoadingOrder(false)
    }
  }, [orderId])

  const fetchOrderDetails = useCallback(async () => {
    if (!orderId) return
    try {
      const url = `${BASE_APP_PATIENT_URL}/patient/v1/vsp/orders/${orderId}`
      const response = await apiHelper(url, HttpMethod.GET, undefined, false)
      setOrderDetails(response?.data ?? null)
    } catch {
      setOrderDetails(null)
    }
  }, [orderId])

  const refreshProductionView = useCallback(() => {
    fetchProductionOrder()
    fetchOrderDetails()
  }, [fetchOrderDetails, fetchProductionOrder])

  useEffect(() => {
    if (!orderId) return
    dispatchAction(getVspPatientPlanningStepper({order_id: orderId}))
  }, [dispatchAction, orderId])

  useEffect(() => {
    if (isCompletedOrderStatus) {
      refreshProductionView()
    }
  }, [isCompletedOrderStatus, refreshProductionView])

  return (
    <Page loading={loadingOrder || loadingVspStatus}>
      <div className='flex flex-col gap-4'>
        {isCompletedOrderStatus ? (
          productionOrder ? (
            <VspProductionTracking
              data={productionOrder}
              orderDetails={orderDetails}
              shippingAddress={orderDetails?.shipping_address ?? null}
              onStatusUpdate={refreshProductionView}
            />
          ) : isCreateOrderOpen ? (
            <CreateVspProductionOrder
              onCancel={() => setIsCreateOrderOpen(false)}
              onSubmit={async (data: CreateVspProductionOrderData) => {
                const getQty = (id: string) =>
                  data.items.find((item) => item.id === id)?.quantity || 0

                try {
                  const response = await apiHelper(URL_VSP_PRODUCTION, HttpMethod.POST, {
                    vsp_order_id: orderId || '',
                    intermediate_splint_qty: getQty('intermediate_splint'),
                    final_splint_qty: getQty('final_splint'),
                    dental_arches_upper_qty: getQty('dental_arches_upper'),
                    dental_arches_lower_qty: getQty('dental_arches_lower'),
                    others_custom_qty: getQty('others_custom'),
                    production_notes: data.notes,
                    stl_file_ids: data.uploadedFileIds,
                  })

                  if (response?.data) {
                    logToConsole('VSP Production order created successfully')
                    setIsCreateOrderOpen(false)
                    fetchProductionOrder()

                    const payload = {
                      order_type: 'ALIGNER',
                      workflow_name: 'Production In House',
                      workflow_status_name: 'TO DO',
                      order_id: null,
                      patient_id: safeParseInt(patientId),
                      service_products: kanbanCardDetails?.service_products,
                      lab_work_flow_name: null,
                      lab_order_type: null,
                      lab_workflow_status_name: null,
                      case_type: 'IN_HOUSE_MANUFACTURING',
                      lab_profile_id: null,
                      doctor_id: userId,
                      task_id: kanbanCardDetails?.id,
                      service_product_id: kanbanCardDetails?.service_products?.id,
                    }

                    dispatchAction(changeWorkFlow(payload as any))
                      .unwrap()
                      .then(async () => {
                        SuccessToast('Ticket move to Production Board')
                      })
                  }
                } catch (error) {
                  logToConsole('Error creating VSP Production order', error)
                }
              }}
            />
          ) : (
            <StartProduction onStart={() => setIsCreateOrderOpen(true)} />
          )
        ) : (
          <ProductionLocked />
        )}
      </div>
    </Page>
  )
}

export default VspProduction

function ProductionLocked() {
  return (
    <div className='w-full flex items-center justify-center py-16 bg-gray-50'>
      <div className='text-center max-w-md'>
        {/* Icon Container */}
        <div className='mx-auto mb-6 flex items-center justify-center w-16 h-16 rounded-full bg-gray-100'>
          <Lock className='w-6 h-6 text-gray-500' />
        </div>

        {/* Title */}
        <h2 className='text-xl font-semibold text-gray-900 mb-2'>Production Locked</h2>

        {/* Description */}
        <p className='text-gray-500 text-sm leading-relaxed'>
          Surgical splint production cannot begin until the 3D treatment plan has been finalized and
          approved by the doctor.
        </p>
      </div>
    </div>
  )
}

function StartProduction({onStart}: {onStart: () => void}) {
  return (
    <div className='w-full flex items-center justify-center py-12'>
      <div className='flex max-w-[420px] flex-col items-center text-center'>
        <div className='mb-6 flex h-[74px] w-[74px] items-center justify-center rounded-full bg-[#dff5e7] ring-[8px] ring-[#ebf8ef]'>
          <Lock className='h-7 w-7 text-[#16a34a]' strokeWidth={2.2} />
        </div>

        <h2 className='mb-3 text-[20px] font-semibold leading-none text-[#0f172a]'>
          Plan Approved!
        </h2>

        <p className='mb-8 max-w-[390px] text-[15px] leading-[1.65] text-[#475569]'>
          The treatment plan has been approved by Customer. You can now generate the splint models
          and proceed to production.
        </p>

        <button
          type='button'
          onClick={onStart}
          className='inline-flex h-[46px] min-w-[220px] items-center justify-center gap-2 rounded-xl bg-[#4f46e5] px-6 text-[16px] font-semibold text-white shadow-[0_10px_24px_rgba(79,70,229,0.28)] transition hover:bg-[#4338ca]'
        >
          Start Production Order
          <ArrowRight className='h-4 w-4' strokeWidth={2.5} />
        </button>
      </div>
    </div>
  )
}
