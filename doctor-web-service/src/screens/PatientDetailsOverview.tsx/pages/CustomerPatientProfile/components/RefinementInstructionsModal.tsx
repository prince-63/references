import {Modal} from 'antd'
import clsx from 'clsx'

const instructions = [
  'Keep the patient on their current or best-fitting aligners.',
  'Decide whether to retain the existing attachments in the new plan or if new/different attachments are required.',
  'Provide new photos and scan files as applicable.',
  'If continuing Phase 1 to Phase 2 treatment, an updated OPG X-ray is required.',
]

const RefinementInstructionsModal = ({
  open,
  onClose,
  onContinue,
  loading = false,
}: {
  open: boolean
  onClose: () => void
  onContinue: () => void
  loading?: boolean
}) => {
  return (
    <Modal
      open={open}
      onCancel={onClose}
      destroyOnClose
      centered
      width={520}
      footer={null}
      title={null}
      closable
    >
      <div className='flex flex-col gap-5 p-2'>
        <h2 className='text-xl font-semibold text-black'>Refinement Instructions</h2>

        <ul className='list-disc pl-5 flex flex-col gap-2 text-sm text-textColor'>
          {instructions.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>

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
            onClick={onContinue}
          >
            {loading ? 'Creating order...' : 'Continue'}
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default RefinementInstructionsModal
