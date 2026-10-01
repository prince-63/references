import calendarEventsConstants from '@constants/calendarEvents.constants'
import calendarEventsHeaderTitle from '@staticData/calendarEventsHeaderTitle'
import calendarReminderTypes from '@staticData/calendarReminderTypes'
import {Modal} from 'antd'
import AntdButton from 'components/atom/Buttons/AntdButton'
import ButtonOutlined from 'components/atom/Buttons/ButtonOutlined'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'

interface DeleteEventProps {
  visible: boolean
  setDeleteModalVisible: (value: boolean) => void
  onOkClick: () => void
  onClose?: () => void
  eventType?: keyof typeof calendarEventsConstants
}

const DeleteEvent = ({
  visible,
  setDeleteModalVisible = () => true,
  onOkClick = () => true,
  onClose,
  eventType,
}: DeleteEventProps) => {
  const {deletingEvent} = useSelector((state: RootState) => state.calendar)
  const getModalContent = () => {
    if (eventType) {
      if (calendarReminderTypes.includes(eventType)) {
        return {
          title: `Do you want to delete ${
            calendarEventsHeaderTitle.find((item) => item.value === eventType)?.label
          }?`,
          subTitle:
            "You can edit a reminder anytime. If you delete it, you won't receive notifications, and you can create a new one whenever you need.",
        }
      } else if (eventType === calendarEventsConstants.APPOINTMENT) {
        return {
          title: `Do you want to delete the Appointment?`,
          subTitle:
            'All notes attached to the appointment will be deleted. Please ensure you have a backup if needed in the future.',
        }
      }
    }
    return {
      title: '',
      subTitle: '',
    }
  }

  const modalContent = getModalContent()

  return (
    <Modal
      open={visible}
      onCancel={() => {
        onClose && onClose()
        setDeleteModalVisible(false)
      }}
      destroyOnClose={true}
      width={600}
      closeIcon={null}
      styles={{
        content: {
          padding: '30px',
          zIndex: 1000,
        },
      }}
      style={{fontFamily: 'figtree', top: '25%'}}
      title={<p className='text-black text-2xl font-bold text-center'>{modalContent.title}</p>}
      transitionName=''
      footer={
        <div className='flex justify-between gap-6 mt-4'>
          <ButtonOutlined
            onClick={() => {
              onClose && onClose()
              setDeleteModalVisible(false)
            }}
            text='Cancel'
            className='h-14 !border-mediumGray !text-textColor hover:bg-white hover:drop-shadow-none font-semibold w-1/2'
          />
          <AntdButton
            text={
              eventType !== calendarEventsConstants.APPOINTMENT
                ? 'Delete reminder'
                : 'Delete appointment'
            }
            loading={deletingEvent}
            disabled={deletingEvent}
            className='h-14 hover:drop-shadow-none text-white !bg-red hover:!bg-red font-semibold w-full'
            onClick={() => {
              setDeleteModalVisible(false)
              onOkClick()
            }}
          />
        </div>
      }
    >
      <div className='w-auto h-auto mt-3 text-textColor text-base font-normal leading-snug text-center'>
        {modalContent.subTitle}
      </div>
    </Modal>
  )
}

export default DeleteEvent
