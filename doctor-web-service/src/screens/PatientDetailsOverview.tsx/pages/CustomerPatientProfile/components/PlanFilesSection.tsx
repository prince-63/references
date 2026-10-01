import {useContext, useState} from 'react'
import {useParams} from 'react-router-dom'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import {AuthContext} from 'context/AuthContext'
import useDispatchAction from '@hooks/useDispatchAction'
import {openDocument, safeParseInt} from 'utils/ConstFunctions'
import {createOrder} from 'redux/Slices/AppSlice/orders/orders.slice'
import {getPatientPlanningStepper} from 'redux/Slices/AppSlice/CustomerPatientProfile/CustomerPatientProfile.slice'
import {IFile} from 'screens/Patients/LeadsProfile/main/treatment/types/treatmentPlan.types'
import {
  Download,
  ExternalLink,
  FileArchive,
  FileImage,
  FileText,
  File as FileIcon,
  FolderOpen,
  Inbox,
  CheckCircle2,
} from 'lucide-react'
import PdfIconNew from 'assets/icons/PdfIconNew'
import {Button} from 'antd'
import SuccessToast from 'components/modal/Alert/SuccessToast'

interface PlanFilesSectionProps {
  stlFiles: IFile[]
  planningLink: string | null
  planFiles: IFile[]
  orderId: string | null
}

const PlanFilesSection: React.FC<PlanFilesSectionProps> = ({
  stlFiles,
  planningLink,
  planFiles,
  orderId,
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

  const allFiles = [...(stlFiles ?? []), ...(planFiles ?? [])]
  const hasFiles = allFiles.length > 0
  const hasLink = !!planningLink

  const handleRequestFiles = async () => {
    const targetOrderId = orderId ?? selectedOrderId
    if (!targetOrderId || !userId) return

    setRequestLoading(true)
    try {
      await dispatchAction(
        createOrder({
          order_id: targetOrderId,
          status: 'STL_FILES_REQUESTED',
          doctor_id: safeParseInt(userId),
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

  // State: Files Requested (waiting for lab to upload)
  if (isFilesRequested && !hasFiles) {
    return (
      <div className='mt-4 rounded-2xl border border-dashed border-blue-200 bg-blue-50/50 p-6'>
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

  // State: Files uploaded / available
  if (hasFiles || hasLink) {
    return (
      <div className='mt-4 space-y-4'>
        {/* Files Section */}
        {hasFiles && (
          <div className='rounded-2xl border border-gray-100 bg-gray-50/50 overflow-hidden'>
            <div className='flex items-center gap-2 px-4 py-3 bg-gray-100/60 border-b border-gray-100'>
              <FolderOpen size={16} className='text-primaryColor' />
              <span className='text-xs font-semibold text-gray-700 uppercase tracking-wide'>
                Plan Files
              </span>
              <span className='text-[10px] text-gray-400 ml-auto'>{allFiles.length} file(s)</span>
            </div>
            <div className='divide-y divide-gray-100'>
              {allFiles.map((file, index) => (
                <FileRow key={file.file_id ?? index} file={file} />
              ))}
            </div>
          </div>
        )}

        {/* Link Section */}
        {hasLink && (
          <div className='rounded-2xl border border-gray-100 bg-gray-50/50 overflow-hidden'>
            <div className='flex items-center gap-2 px-4 py-3 bg-gray-100/60 border-b border-gray-100'>
              <ExternalLink size={16} className='text-primaryColor' />
              <span className='text-xs font-semibold text-gray-700 uppercase tracking-wide'>
                Shared Link
              </span>
            </div>
            <button
              type='button'
              onClick={() => openDocument(planningLink!)}
              className='flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors group'
            >
              <div className='flex items-center justify-center w-9 h-9 rounded-lg bg-primarySupport'>
                <ExternalLink size={16} className='text-primaryColor' />
              </div>
              <div className='flex-1 min-w-0'>
                <p className='text-sm font-medium text-primaryColor group-hover:underline truncate'>
                  View Shared Resource
                </p>
                <p className='text-[10px] text-gray-400 truncate'>{planningLink}</p>
              </div>
              <ExternalLink size={14} className='text-gray-300 shrink-0' />
            </button>
          </div>
        )}
      </div>
    )
  }

  // State: Empty — no files, no link, not requested
  return (
    <div className='mt-4 rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 p-6'>
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

export default PlanFilesSection

/* ── File Row ── */

const getFileIcon = (extension: string) => {
  const ext = (extension ?? '').toLowerCase()
  if (['pdf'].includes(ext)) return <PdfIconNew />
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(ext))
    return <FileImage size={20} className='text-green-500' />
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext))
    return <FileArchive size={20} className='text-amber-500' />
  if (['stl', 'obj', 'ply'].includes(ext)) return <FileIcon size={20} className='text-purple-500' />
  if (['doc', 'docx', 'txt', 'csv', 'xls', 'xlsx'].includes(ext))
    return <FileText size={20} className='text-blue-500' />
  return <FileIcon size={20} className='text-gray-400' />
}

const FileRow = ({file}: {file: IFile}) => {
  const ext = (file.extension ?? '').toLowerCase()
  const sizeLabel = file.size
    ? file.size > 1024 * 1024
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
      : `${(file.size / 1024).toFixed(0)} KB`
    : ''

  return (
    <div className='flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50/80 transition-colors'>
      <div className='flex items-center justify-center w-9 h-9 rounded-lg bg-white border border-gray-100 shrink-0'>
        {getFileIcon(ext)}
      </div>
      <div className='flex-1 min-w-0'>
        <p className='text-sm font-medium text-gray-700 truncate'>{file.name}</p>
        <p className='text-[10px] text-gray-400 uppercase'>
          {ext || 'FILE'}
          {sizeLabel ? ` • ${sizeLabel}` : ''}
        </p>
      </div>
      {file.url && (
        <button
          type='button'
          onClick={(e) => {
            e.stopPropagation()
            openDocument(file.url!, file.name)
          }}
          className='flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100 transition-colors shrink-0'
        >
          <Download size={16} className='text-gray-400' />
        </button>
      )}
    </div>
  )
}
