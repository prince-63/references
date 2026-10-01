import {useContext, useState} from 'react'
import {useParams} from 'react-router-dom'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import {AuthContext} from 'context/AuthContext'
import useDispatchAction from '@hooks/useDispatchAction'
import {safeParseInt} from 'utils/ConstFunctions'
import {updateOrder} from 'redux/Slices/AppSlice/orders/orders.slice'
import {getPatientPlanningStepper} from 'redux/Slices/AppSlice/CustomerPatientProfile/CustomerPatientProfile.slice'
import {CheckCircle2, File, Inbox} from 'lucide-react'
import {Button} from 'antd'
import SuccessToast from 'components/modal/Alert/SuccessToast'

interface RequestStlFilesSectionProps {
  orderId: string | null
  variant?: 'default' | 'customerSummary'
  treatmentPlanId: number
}

const RequestStlFilesSection: React.FC<RequestStlFilesSectionProps> = ({
  orderId,
  variant = 'default',
  treatmentPlanId,
}) => {
  const {patientId} = useParams()
  const {userId} = useContext(AuthContext)
  const {dispatchAction} = useDispatchAction()
  const {planning_stepper, selectedOrderId} = useSelector(
    (state: RootState) => state.customerPatientProfile
  )
  const [requestLoading, setRequestLoading] = useState(false)

  const orderStatus = planning_stepper?.actual_order_status ?? null
  const isFilesRequested = orderStatus === 'STL_FILES_REQUESTED'
  const isFilesUploaded = orderStatus === 'STL_FILES_UPLOADED'

  const handleRequestFiles = async () => {
    const targetOrderId = orderId ?? selectedOrderId
    if (!targetOrderId || !userId) return

    setRequestLoading(true)
    try {
      await dispatchAction(
        updateOrder({
          order_id: targetOrderId,
          status: 'STL_FILES_REQUESTED',
          doctor_id: safeParseInt(userId),
          treatment_plan_id: treatmentPlanId,
        })
      ).unwrap()

      SuccessToast('STL files requested successfully')

      dispatchAction(
        getPatientPlanningStepper({
          order_id: targetOrderId,
          patient_id: safeParseInt(patientId),
          doctor_id: safeParseInt(userId),
        })
      )
    } catch {
      // error handled by redux
    } finally {
      setRequestLoading(false)
    }
  }

  // Already requested — show info banner
  if (isFilesRequested) {
    return (
      <div className='rounded-2xl border border-dashed border-blue-200 bg-blue-50/50 p-6'>
        <div className='flex flex-col items-center text-center gap-3'>
          <div className='flex items-center justify-center w-12 h-12 rounded-full bg-blue-100'>
            <CheckCircle2 size={24} className='text-blue-500' />
          </div>
          <div>
            <p className='text-sm font-semibold text-gray-800'>Files Have Been Requested</p>
            <p className='text-xs text-gray-500 mt-1'>
              The lab has been notified. Files will appear here once uploaded.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Files already uploaded — nothing to show
  if (isFilesUploaded) {
    return null
  }

  // Default — show request button
  if (variant === 'customerSummary') {
    return (
      <div className='rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 px-6 py-10'>
        <div className='flex flex-col items-center text-center gap-2'>
          <div className='flex h-14 w-14 items-center justify-center rounded-full bg-white border border-neutral-100 shadow-sm mb-1'>
            <File size={26} className='text-neutral-300' />
          </div>
          <p className='text-sm font-semibold text-textColor'>No files have been shared yet.</p>
          <p className='text-xs text-textColor/60 max-w-[34ch]'>
            You can request specific files from the lab if needed.
          </p>
          <div className='text-[10px] font-semibold uppercase tracking-[0.16em] text-primaryColor cursor-pointer'>
            * Send a message to request specific files
          </div>
          <Button
            type='primary'
            className='mt-4 !bg-primaryColor !border-primaryColor !px-10 !h-10 !rounded-xl text-[10px] font-semibold uppercase tracking-[0.16em] !shadow-sm'
            loading={requestLoading}
            onClick={(e) => {
              e.stopPropagation()
              handleRequestFiles()
            }}
          >
            Request STL Files
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className='rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 p-6'>
      <div className='flex flex-col items-center text-center gap-3'>
        <div className='flex items-center justify-center w-12 h-12 rounded-full bg-lightGray'>
          <Inbox size={24} className='text-gray-400' />
        </div>
        <div>
          <p className='text-sm font-medium text-gray-600'>No files have been shared yet.</p>
          <p className='text-xs text-gray-400 mt-1'>
            You can request specific files from the lab if needed.
          </p>
        </div>
        <Button
          type='primary'
          className='mt-1 !bg-primaryColor'
          loading={requestLoading}
          onClick={(e) => {
            e.stopPropagation()
            handleRequestFiles()
          }}
        >
          Request Files
        </Button>
      </div>
    </div>
  )
}

export default RequestStlFilesSection
