import AntdButton from 'components/atom/Buttons/AntdButton'
import ModalLayout from 'components/modal/ModalLayout'

interface DeleteWorkflowStatusModalProps {
  workflowName: string
  isModalVisible: boolean
  onClose: () => void
  onConfirm: () => void
  loading: boolean
}

export const DeleteWorkflowStatusModal = ({
  workflowName,
  isModalVisible,
  onClose,
  onConfirm,
  loading,
}: DeleteWorkflowStatusModalProps) => {
  if (!isModalVisible) return null
  return (
    <ModalLayout>
      <div className='mt-4'>
        <div className='text-black text-2xl font-bold text-center'>Delete “{workflowName}”?</div>
        <div className='mt-2 mb-7 text-textColor text-base text-center font-normal'>
          Are you sure you want to delete “{workflowName}” from your workflow ?
        </div>
        <div className='mt-2 mb-7 text-textColor text-center text-base font-normal'>
          All cases currently in this stage will automatically moved to the previous status. This
          action cannot be undone.
        </div>
      </div>

      <div className='mt-7 flex justify-end gap-8'>
        <AntdButton
          text='Cancel'
          className='h-12 w-full bg-white text-red border-red hover:!bg-white hover:!text-red'
          onClick={onClose}
        />
        <AntdButton
          text='Delete Status'
          className='h-12 !bg-red w-full hover:!bg-red'
          onClick={() => {
            if (loading) return
            onConfirm()
          }}
          loading={loading}
          disabled={loading}
        />
      </div>
    </ModalLayout>
  )
}
