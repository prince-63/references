import {useCallback, useRef, useState} from 'react'
import {CalendarCheck, CloudUpload, Minus, Plus, X} from 'lucide-react'
import cn from '@utils/cn'

interface OrderItem {
  id: string
  label: string
  quantity: number
}

interface PendingFile {
  file: File
  id: string
}

const DEFAULT_ORDER_ITEMS: OrderItem[] = [
  {id: 'intermediate_splint', label: 'Intermediate Splint', quantity: 1},
  {id: 'final_splint', label: 'Final Splint', quantity: 1},
  {id: 'dental_arches_upper', label: 'Dental Arches (Upper)', quantity: 1},
  {id: 'dental_arches_lower', label: 'Dental Arches (Lower)', quantity: 1},
  {id: 'others_custom', label: 'Others / Custom', quantity: 1},
]

interface CreateProductionProps {
  onCancel?: () => void
  onSubmit?: (data: {items: OrderItem[]; files: File[]; notes: string}) => void
  loading?: boolean
}

const CreateProduction = ({onCancel, onSubmit, loading = false}: CreateProductionProps) => {
  const [orderItems, setOrderItems] = useState<OrderItem[]>(DEFAULT_ORDER_ITEMS)
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([])
  const [notes, setNotes] = useState('')
  const [isDragOver, setIsDragOver] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const totalItems = orderItems.reduce((sum, item) => sum + item.quantity, 0)

  const updateQuantity = useCallback((id: string, delta: number) => {
    setOrderItems((prev) =>
      prev.map((item) =>
        item.id === id ? {...item, quantity: Math.max(0, item.quantity + delta)} : item
      )
    )
  }, [])

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return
    const stlFiles = Array.from(files).filter(
      (f) => f.name.toLowerCase().endsWith('.stl') || f.name.toLowerCase().endsWith('.obj')
    )
    setPendingFiles((prev) => {
      const existingKeys = new Set(prev.map((p) => `${p.file.name}-${p.file.size}`))
      const newFiles = stlFiles
        .filter((f) => !existingKeys.has(`${f.name}-${f.size}`))
        .map((file) => ({file, id: `${file.name}-${file.size}-${Date.now()}`}))
      return [...prev, ...newFiles]
    })
  }, [])

  const removeFile = useCallback((id: string) => {
    setPendingFiles((prev) => prev.filter((f) => f.id !== id))
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)
      handleFileSelect(e.dataTransfer.files)
    },
    [handleFileSelect]
  )

  const handleSubmit = () => {
    if (loading) return
    onSubmit?.({
      items: orderItems.filter((item) => item.quantity > 0),
      files: pendingFiles.map((pf) => pf.file),
      notes: notes.trim(),
    })
  }

  return (
    <div className='mx-auto w-full max-w-[980px] pb-28'>
      {/* Header */}
      <div className='mb-6'>
        <h1 className='text-2xl font-bold text-gray-900'>Create Production Order</h1>
        <p className='mt-1 text-sm text-gray-500'>
          Define the splints and models required for 3D printing.
        </p>
      </div>

      {/* Main card */}
      <div className='rounded-2xl border border-gray-200 bg-white p-6'>
        <div className='grid grid-cols-1 gap-8 lg:grid-cols-2'>
          {/* ── Left: Order Items ── */}
          <div>
            <h2 className='mb-4 text-lg font-bold text-gray-900'>Order Items</h2>

            <div className='rounded-xl border border-gray-200'>
              {/* Table header */}
              <div className='flex items-center justify-between border-b border-gray-200 px-4 py-3'>
                <span className='text-sm font-semibold text-gray-600'>Item Description</span>
                <span className='text-sm font-semibold text-gray-600'>Quantity</span>
              </div>

              {/* Item rows */}
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

              {/* Total row */}
              <div className='flex items-center justify-between border-t border-gray-200 bg-gray-50/60 px-4 py-3'>
                <span className='text-xs font-bold uppercase tracking-wider text-gray-500'>
                  Total Items
                </span>
                <span className='text-base font-bold text-[#4A62E8]'>{totalItems}</span>
              </div>
            </div>
          </div>

          {/* ── Right: Print Files + Production Notes ── */}
          <div className='flex flex-col gap-6'>
            {/* Print Files */}
            <div>
              <div className='mb-3 flex items-center justify-between'>
                <h2 className='text-lg font-bold text-gray-900'>Print Files</h2>
                <span className='rounded-full border border-gray-200 bg-gray-50 px-3 py-0.5 text-xs font-medium text-gray-400'>
                  Optional
                </span>
              </div>

              <div
                onDragOver={(e) => {
                  e.preventDefault()
                  setIsDragOver(true)
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  'flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-8 transition-colors',
                  isDragOver
                    ? 'border-[#4A62E8] bg-[#EEF2FF]'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/50'
                )}
              >
                <CloudUpload className='mb-2 h-6 w-6 text-gray-400' />
                <p className='text-sm font-semibold text-[#4A62E8]'>Upload STL Files</p>
                <p className='mt-0.5 text-xs text-gray-400'>
                  Attach specific models for printing if required
                </p>
              </div>

              <input
                ref={fileInputRef}
                type='file'
                accept='.stl,.obj'
                multiple
                onChange={(e) => {
                  handleFileSelect(e.target.files)
                  if (fileInputRef.current) fileInputRef.current.value = ''
                }}
                className='hidden'
              />

              {/* Pending file list */}
              {pendingFiles.length > 0 && (
                <div className='mt-3 flex flex-col gap-2'>
                  {pendingFiles.map((pf) => (
                    <div
                      key={pf.id}
                      className='flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2'
                    >
                      <span className='truncate text-sm text-gray-700'>{pf.file.name}</span>
                      <button
                        type='button'
                        onClick={(e) => {
                          e.stopPropagation()
                          removeFile(pf.id)
                        }}
                        className='ml-2 flex-shrink-0 rounded p-0.5 text-gray-400 hover:bg-gray-200 hover:text-gray-600'
                      >
                        <X className='h-3.5 w-3.5' />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Production Notes */}
            <div>
              <div className='mb-3 flex items-center justify-between'>
                <h2 className='text-lg font-bold text-gray-900'>Production Notes</h2>
                <span className='rounded-full border border-gray-200 bg-gray-50 px-3 py-0.5 text-xs font-medium text-gray-400'>
                  Optional
                </span>
              </div>

              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder='Any specific instructions for the manufacturing lab...'
                rows={4}
                className='w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:border-[#4A62E8] focus:outline-none focus:ring-1 focus:ring-[#4A62E8]/30'
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className='fixed bottom-0 left-0 right-0 z-40 border-t border-[#DFE4F3] bg-white/95 px-4 py-4 backdrop-blur md:left-[280px] md:px-6'>
        <div className='mx-auto flex w-full max-w-[980px] flex-col-reverse gap-3 md:flex-row md:justify-end'>
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
            disabled={loading || totalItems === 0}
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

      {/* Confirmation Modal */}
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
                disabled={loading}
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

export default CreateProduction
