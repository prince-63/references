import {useCallback, useState} from 'react'
import {useParams} from 'react-router-dom'
import {CalendarCheck, Minus, Plus} from 'lucide-react'
import type {UploadFile} from 'antd'
import cn from '@utils/cn'
import {safeParseInt} from 'utils/ConstFunctions'
import VspProductionOrderFileUploader from './components/VspProductionOrderFileUploader'

interface OrderItem {
  id: string
  label: string
  quantity: number
}

const DEFAULT_ORDER_ITEMS: OrderItem[] = [
  {id: 'intermediate_splint', label: 'Intermediate Splint', quantity: 0},
  {id: 'final_splint', label: 'Final Splint', quantity: 0},
  {id: 'dental_arches_upper', label: 'Dental Arches (Upper)', quantity: 0},
  {id: 'dental_arches_lower', label: 'Dental Arches (Lower)', quantity: 0},
  {id: 'others_custom', label: 'Others / Custom', quantity: 0},
]

export interface CreateVspProductionOrderData {
  items: OrderItem[]
  files: UploadFile[]
  uploadedFileIds: number[]
  notes: string
  totalItems: number
}

interface CreateVspProductionOrderProps {
  onCancel?: () => void
  onSubmit?: (data: CreateVspProductionOrderData) => void
  loading?: boolean
}

const CreateVspProductionOrder = ({
  onCancel,
  onSubmit,
  loading = false,
}: CreateVspProductionOrderProps) => {
  const {patientId} = useParams()
  const [orderItems, setOrderItems] = useState<OrderItem[]>(DEFAULT_ORDER_ITEMS)
  const [uploadedFiles, setUploadedFiles] = useState<UploadFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [notes, setNotes] = useState('')
  const planFolderName = '/'

  const totalItems = orderItems.reduce((sum, item) => sum + item.quantity, 0)

  const updateQuantity = useCallback((id: string, delta: number) => {
    setOrderItems((prev) =>
      prev.map((item) =>
        item.id === id ? {...item, quantity: Math.max(0, item.quantity + delta)} : item
      )
    )
  }, [])

  const handleSubmit = () => {
    if (loading || totalItems === 0 || isUploading) return

    const uploadedFileIds = uploadedFiles
      .map((file) => safeParseInt(file.uid))
      .filter((id): id is number => typeof id === 'number')

    onSubmit?.({
      items: orderItems,
      files: uploadedFiles,
      uploadedFileIds,
      notes: notes.trim(),
      totalItems,
    })
  }

  return (
    <div className='mx-auto w-full max-w-[980px] pb-4'>
      <div className='mb-6'>
        <h1 className='text-2xl font-bold text-gray-900'>Create Production Order</h1>
        <p className='mt-1 text-sm text-gray-500'>
          Define the splints and models required for 3D printing.
        </p>
      </div>

      <div className='rounded-2xl border border-gray-200 bg-white p-6'>
        <div className='grid grid-cols-1 gap-8 lg:grid-cols-2'>
          <div>
            <h2 className='mb-4 text-lg font-bold text-gray-900'>Order Items</h2>

            <div className='rounded-xl border border-gray-200'>
              <div className='flex items-center justify-between border-b border-gray-200 px-4 py-3'>
                <span className='text-sm font-semibold text-gray-600'>Item Description</span>
                <span className='text-sm font-semibold text-gray-600'>Quantity</span>
              </div>

              {orderItems.map((item, index) => (
                <div
                  key={item.id}
                  className={cn(
                    'flex items-center justify-between px-4 py-3',
                    index < orderItems.length - 1 && 'border-b border-gray-100'
                  )}
                >
                  <span className='text-sm text-gray-800'>{item.label}</span>

                  <div className='flex items-center gap-2'>
                    <button
                      type='button'
                      onClick={() => updateQuantity(item.id, -1)}
                      disabled={item.quantity <= 0}
                      className='flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40'
                    >
                      <Minus className='h-3.5 w-3.5' />
                    </button>
                    <span className='w-6 text-center text-sm font-medium text-gray-800'>
                      {item.quantity}
                    </span>
                    <button
                      type='button'
                      onClick={() => updateQuantity(item.id, 1)}
                      className='flex h-7 w-7 items-center justify-center rounded-lg border border-[#CAD7FF] bg-[#EEF2FF] text-[#4A62E8] transition-colors hover:bg-[#E6EDFF]'
                    >
                      <Plus className='h-3.5 w-3.5' />
                    </button>
                  </div>
                </div>
              ))}

              <div className='flex items-center justify-between border-t border-gray-200 bg-gray-50/60 px-4 py-3'>
                <span className='text-xs font-bold uppercase tracking-wider text-gray-500'>
                  Total Items
                </span>
                <span className='text-base font-bold text-[#4A62E8]'>{totalItems}</span>
              </div>
            </div>
          </div>

          <div className='flex flex-col gap-6'>
            <div>
              <div className='mb-3 flex items-center justify-between'>
                <h2 className='text-lg font-bold text-gray-900'>Print Files</h2>
                <span className='rounded-full border border-gray-200 bg-gray-50 px-3 py-0.5 text-xs font-medium text-gray-400'>
                  Optional
                </span>
              </div>

              <VspProductionOrderFileUploader
                patientId={safeParseInt(patientId)}
                parentPath={planFolderName}
                uploadedFiles={uploadedFiles}
                setUploadedFiles={setUploadedFiles}
                onUploadingChange={setIsUploading}
                accept='.stl, .obj, .ply , .pdf, .jpeg, .jpg, .png ,.ppt, .pptx, .doc, .docx, .xls, .xlsx , .csv , .zip,'
                maxFileSize={100}
                maxFileCount={10}
                title='Upload Files'
                subTitle='Attach specific models for printing if required'
              />
            </div>

            <div>
              <div className='mb-3 flex items-center justify-between'>
                <h2 className='text-lg font-bold text-gray-900'>Production Notes</h2>
                <span className='rounded-full border border-gray-200 bg-gray-50 px-3 py-0.5 text-xs font-medium text-gray-400'>
                  Optional
                </span>
              </div>

              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder='Any specific instructions for the manufacturing lab...'
                rows={4}
                className='w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:border-[#4A62E8] focus:outline-none focus:ring-1 focus:ring-[#4A62E8]/30'
              />
            </div>
          </div>
        </div>

        <div className='mt-6 border-t border-gray-200 pt-6'>
          <div className='flex flex-col-reverse gap-3 sm:flex-row sm:justify-end'>
            <button
              type='button'
              onClick={onCancel}
              disabled={loading}
              className={cn(
                'h-11 rounded-xl border border-[#D0D5DD] px-5 text-sm font-semibold text-[#344054]',
                'transition-all hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-50'
              )}
            >
              Cancel
            </button>
            <button
              type='button'
              onClick={() => setShowConfirmModal(true)}
              disabled={loading || totalItems === 0 || isUploading}
              className={cn(
                'h-11 rounded-xl border border-[#4462EA] bg-[#4A62E8] px-6 text-sm font-semibold text-white',
                'inline-flex items-center justify-center gap-2 shadow-[0_8px_18px_-10px_rgba(74,98,232,0.75)] transition-all',
                'hover:bg-[#3E57DD] disabled:cursor-not-allowed disabled:opacity-50'
              )}
            >
              <CalendarCheck className='h-4 w-4' />
              Finalize &amp; Create Order
            </button>
          </div>
        </div>
      </div>

      {showConfirmModal && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px]'>
          <div className='mx-4 w-full max-w-md rounded-2xl bg-white px-8 py-8 shadow-xl'>
            <div className='flex flex-col items-center text-center'>
              <div className='mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#CAD7FF] bg-[#EEF2FF]'>
                <CalendarCheck className='h-6 w-6 text-[#4A62E8]' />
              </div>
              <h3 className='mb-2 text-xl font-bold text-gray-900'>Create Production Order?</h3>
              <p className='text-sm text-gray-500'>
                You are about to initiate production for{' '}
                <span className='font-semibold text-gray-800'>{totalItems} item(s)</span>. The case
                will move to the active production queue.
              </p>
            </div>

            <div className='mt-8 flex gap-3'>
              <button
                type='button'
                onClick={() => setShowConfirmModal(false)}
                disabled={loading}
                className={cn(
                  'h-11 flex-1 rounded-xl border border-[#D0D5DD] text-sm font-semibold text-[#344054]',
                  'transition-all hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-50'
                )}
              >
                Cancel
              </button>
              <button
                type='button'
                onClick={() => {
                  setShowConfirmModal(false)
                  handleSubmit()
                }}
                disabled={loading || isUploading}
                className={cn(
                  'h-11 flex-1 rounded-xl border border-[#4462EA] bg-[#4A62E8] text-sm font-semibold text-white',
                  'shadow-[0_8px_18px_-10px_rgba(74,98,232,0.75)] transition-all',
                  'hover:bg-[#3E57DD] disabled:cursor-not-allowed disabled:opacity-50'
                )}
              >
                Confirm Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CreateVspProductionOrder
