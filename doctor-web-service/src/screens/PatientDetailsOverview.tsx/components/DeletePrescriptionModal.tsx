import AntdButton from 'components/atom/Buttons/AntdButton'
import ModalLayout from 'components/modal/ModalLayout'

interface DeletePrescriptionModalProps {
  prescriptionId: number
  isModalVisible: boolean
  onClose: () => void
  onConfirm: (id: number) => void
  loading: boolean
}

export const DeletePrescriptionModal = ({
  prescriptionId,
  isModalVisible,
  onClose,
  onConfirm,
  loading,
}: DeletePrescriptionModalProps) => {
  if (!isModalVisible) return null
  return (
    <ModalLayout>
      <div className='mt-4'>
        <div className='text-black text-2xl font-bold'>
          Are you sure you want to delete this Prescription?
        </div>
        <div className='mt-2 mb-7 text-textColor text-base font-normal'>
          This Prescription will be permanently deleted. You can create a new Prescription later.
        </div>
      </div>
      <div className='mt-7 flex justify-end gap-8'>
        <AntdButton
          text='Cancel'
          className='h-12 w-full bg-white text-red border-red hover:!bg-white hover:!text-red'
          onClick={onClose}
          loading={loading}
        />
        <AntdButton
          text='Delete'
          className='h-12 !bg-red w-full hover:!bg-red'
          onClick={() => onConfirm(prescriptionId)}
          loading={loading}
        />
      </div>
    </ModalLayout>
  )
}
