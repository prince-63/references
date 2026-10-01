import {Modal} from 'antd'
import ButtonOutlined from 'components/atom/Buttons/ButtonOutlined'
import When from 'components/when/When'
import hasValue from 'utils/hasValue'

const AppointmentCreatedSuccessfully = ({
  visible,
  setQuitModalVisible,
  onOkClick,
  onViewAppointmentClick,
  isAlignerOrLeadPatient,
  bracesJourneyId,
  onClose,
}: {
  visible: boolean
  setQuitModalVisible: (value: boolean) => void
  onOkClick: () => void
  onViewAppointmentClick: () => void
  isAlignerOrLeadPatient?: boolean
  bracesJourneyId?: number | null
  onClose?: () => void
}) => {
  return (
    <Modal
      open={visible}
      onCancel={() => {
        if (onClose) onClose()
        setQuitModalVisible(false)
      }}
      destroyOnClose={true}
      style={{fontFamily: 'figtree', top: '25%'}}
      title={
        <p className='text-black text-2xl font-bold text-start'>Appointment created successfully</p>
      }
      transitionName=''
      footer={
        <div className='flex flex-row h-auto justify-between gap-6 mt-4'>
          <ButtonOutlined
            onClick={() => {
              setQuitModalVisible(false)
              onViewAppointmentClick()
            }}
            text='View appointment'
            className={
              'h-14  !text-primaryColor hover:bg-white hover:drop-shadow-none font-semibold'
            }
          />
          <When isTrue={!isAlignerOrLeadPatient && hasValue(bracesJourneyId)}>
            <ButtonOutlined
              text='Attach braces notes'
              className='h-14 hover:drop-shadow-none hover:bg-white text-white !bg-primaryColor font-semibold'
              onClick={() => {
                setQuitModalVisible(false)
                onOkClick()
              }}
            />
          </When>
        </div>
      }
    >
      <div className='w-auto h-auto mt-3 text-textColor text-base font-normal leading-snug text-start'>
        You can now attach detailed Braces notes about the patient's treatment to the appointment,
        making it easier to keep track of important information.
      </div>
    </Modal>
  )
}

export default AppointmentCreatedSuccessfully
