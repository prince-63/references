import cn from '@utils/cn'
import {Send} from 'lucide-react'

interface ExternalLinkConfirmationModalProps {
  open: boolean
  title?: string
  confirmText?: string
  loading?: boolean
  onCancel: () => void
  onConfirm: () => void
}

const ExternalLinkConfirmationModal = ({
  open,
  title = 'Confirm send',
  confirmText = 'Confirm',
  loading = false,
  onCancel,
  onConfirm,
}: ExternalLinkConfirmationModalProps) => {
  if (!open) return null

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px]'>
      <div className='mx-4 w-full max-w-md rounded-2xl bg-white px-8 py-8 shadow-xl'>
        <div className='flex flex-col items-center text-center'>
          <div className='mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#CAD7FF] bg-[#EEF2FF]'>
            <Send className='h-6 w-6 text-[#4A62E8]' />
          </div>
          <h3 className='mb-2 text-xl font-bold text-gray-900'>{title}</h3>
          <p className='text-sm leading-relaxed text-gray-500'>
            Before sending the files via Google Drive, please confirm that access has been provided
            to{' '}
            <a
              href={`mailto:${process.env.REACT_APP_VSP_CASES_EMAIL}`}
              className='font-semibold text-[#4A62E8] underline'
            >
              {process.env.REACT_APP_VSP_CASES_EMAIL}
            </a>{' '}
            for smooth processing &amp; next steps.
          </p>
        </div>

        <div className='mt-8 flex gap-3'>
          <button
            type='button'
            onClick={onCancel}
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
            onClick={onConfirm}
            disabled={loading}
            className={cn(
              'h-11 flex-1 rounded-xl border border-[#4462EA] bg-[#4A62E8] text-sm font-semibold text-white',
              'shadow-[0_8px_18px_-10px_rgba(74,98,232,0.75)] transition-all',
              'hover:bg-[#3E57DD] disabled:cursor-not-allowed disabled:opacity-50'
            )}
          >
            {loading ? 'Submitting...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ExternalLinkConfirmationModal
