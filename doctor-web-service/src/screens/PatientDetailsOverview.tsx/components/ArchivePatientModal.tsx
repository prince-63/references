import AntdButton from 'components/atom/Buttons/AntdButton'
import ModalLayout from 'components/modal/ModalLayout'
import getColorPalette from 'utils/getColorPalette'

interface ArchivePatientModalProps {
  patientName?: string
  isModalVisible: boolean
  onClose: () => void
  onConfirm: () => void
  onClickSolidButton?: () => void
  loading?: boolean
}

const ArchivePatientModal = ({
  isModalVisible,
  onClose,
  onConfirm,
  onClickSolidButton,
  loading = false,
}: ArchivePatientModalProps) => {
  if (!isModalVisible) return null
  const palette = getColorPalette()

  return (
    <ModalLayout>
      <div className='mt-4'>
        <div className='text-black text-2xl font-bold text-center'>Archive the patient?</div>
        <div className='mt-2 mb-7 text-textColor text-base font-normal'>
          If you archive this patient, all related orders, tasks and activities will also be
          archived or cancelled.
        </div>
      </div>
      <div className='mt-7 flex justify-end gap-8'>
        <AntdButton
          text='Cancel'
          className='h-12 w-full bg-white hover:!bg-white font-medium'
          style={{borderColor: palette.mediumGray, color: 'black', borderWidth: '1px'}}
          onClick={onClose}
          loading={loading}
        />
        <AntdButton
          text='Archive'
          className='h-12 w-full bg-orange hover:!bg-orange font-medium'
          style={{borderColor: palette.mediumGray, borderWidth: '1px'}}
          onClick={onClickSolidButton ?? onConfirm}
          loading={loading}
        />
      </div>
    </ModalLayout>
  )
}

export default ArchivePatientModal
