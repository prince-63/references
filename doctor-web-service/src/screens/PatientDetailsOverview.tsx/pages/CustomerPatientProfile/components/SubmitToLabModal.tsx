import {Modal} from 'antd'
import {FileText} from 'lucide-react'
import AntdButton from 'components/atom/Buttons/AntdButton'

const SubmitToLabModal = ({
  open,
  onClose,
  onConfirm,
  loading = false,
}: {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  loading?: boolean
}) => {
  return (
    <Modal
      open={open}
      onCancel={onClose}
      destroyOnClose
      centered
      width={480}
      footer={null}
      title={null}
      closable
    >
      <div className='flex flex-col items-center gap-4 px-6 py-2 text-center'>
        <div className='flex h-12 w-12 items-center justify-center rounded-full bg-primarySupport text-primaryColor'>
          <FileText className='h-6 w-6' />
        </div>

        <div className='space-y-2'>
          <h2 className='text-lg font-semibold text-black'>Ready to submit?</h2>
          <p className='text-sm text-textColor'>
            Once submitted, your case will be sent to the lab for review and processing. You’ll be
            notified of any updates.
          </p>
        </div>

        <div className='flex w-full gap-3 pt-2'>
          <button
            type='button'
            className='flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50'
            onClick={onClose}
          >
            Review again
          </button>
          <AntdButton
            onClick={onConfirm}
            className='flex-1 border border-primaryColor h-10 text-sm font-semibold bg-primaryColor'
            isLoading={loading}
            text='Submit Case'
            disabled={loading}
          />
        </div>
      </div>
    </Modal>
  )
}

export default SubmitToLabModal
