import {Modal} from 'antd'
import clsx from 'clsx'

const ResumePlanningModal = ({
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
      <div className='flex flex-col gap-4 p-2'>
        <h2 className='text-xl font-semibold text-black'>Resume Planning?</h2>

        <p className='text-sm text-textColor'>
          Confirm that you've added the requested details and would like the lab to continue
          planning.
        </p>

        <div className='flex gap-3 mt-2'>
          <button
            type='button'
            className={clsx(
              'flex-1 py-2.5 px-4 rounded-lg border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50'
            )}
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type='button'
            className={clsx(
              'flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold text-white bg-primaryColor hover:opacity-90',
              loading && 'opacity-60 cursor-not-allowed'
            )}
            disabled={loading}
            onClick={onConfirm}
          >
            {loading ? 'Resuming...' : 'Confirm & Resume'}
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default ResumePlanningModal
