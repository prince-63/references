import moment from 'moment'
import AntdButton from 'components/atom/Buttons/AntdButton'
import When from 'components/when/When'
import {SVG_RIGHT_ARROW_ICON} from 'utils/SvgConstants'
import hasValue from 'utils/hasValue'
import {IProductionOrder} from 'screens/Production/types/productionOrders.interface'
import ModalViewReminder from 'components/modal/Production/Reminder/ModalViewReminder'
import ModalViewNotes from 'components/modal/Production/Notes/ModalViewNotes'
import {useContext, useState} from 'react'
import ModalCreateNote from 'components/modal/Production/Notes/ModalCreateNotes'
import ModalDeleteNote from 'components/modal/Production/Notes/ModalDeleteNotes'
import {useNavigate} from 'react-router-dom'
import {AuthContext} from 'context/AuthContext'
import {identifyUser, safeParseInt} from 'utils/ConstFunctions'
import AddReminderModal from 'components/AddReminder/AddReminderModal'
import DeleteEvent from 'components/deleteEvent/DeleteEvent'
import useDispatchAction from '@hooks/useDispatchAction'
import {deleteEvent} from 'redux/Slices/AppSlice/Calendar/calendar.slice'
import SuccessToast from 'components/modal/Alert/SuccessToast'
import {postApiDataProductionSlice} from 'redux/Slices/AppSlice/production/production.slice'

const OrderListItemHeader = ({orderItem}: {orderItem: IProductionOrder}) => {
  const {userId} = useContext(AuthContext)

  const [isViewReminderModalOpen, setIsViewReminderModalOpen] = useState<boolean>(false)
  const [isDeleteReminderModalOpen, setIsDeleteReminderModalOpen] = useState<boolean>(false)

  const handleDeleteReminderClick = () => {
    setIsViewReminderModalOpen(false)
    setIsDeleteReminderModalOpen(true)
  }

  const navigation = useNavigate()
  const [isModalViewNotesOpen, setIsModalViewNotesOpen] = useState<boolean>(false)
  const [isModalCreateNotesOpen, setIsModalCreateNotesOpen] = useState<boolean>(false)
  const [isModalEditNotesOpen, setIsModalEditNotesOpen] = useState<boolean>(false)
  const [isModalDeleteNotesOpen, setIsModalDeleteNotesOpen] = useState<boolean>(false)
  const [editNoteState, setEditNoteState] = useState({noteId: -1, noteTitle: '', noteText: ''})
  const [noteIdToBeDeleted, setNoteIdToBeDeleted] = useState<number>(-1)

  const handleEditNoteClick = (prevNoteState: {
    noteId: number
    noteTitle: string
    noteText: string
  }) => {
    setIsModalViewNotesOpen(false)
    setEditNoteState(prevNoteState)
    setIsModalEditNotesOpen(true)
  }

  const handleDeleteNoteClick = (note_id: number) => {
    setIsModalViewNotesOpen(false)
    setNoteIdToBeDeleted(note_id)
    setIsModalDeleteNotesOpen(true)
  }

  const reminderDate =
    orderItem.reminders && orderItem.reminders?.length > 0
      ? orderItem.reminders[orderItem.reminders.length - 1].remind_at
      : ''
  const [isModalVisible, setIsModalVisible] = useState(false)
  const toggleModal = (value: boolean) => {
    setIsModalVisible(value)
    if (!value && isEditButtonClicked) {
      setIsEditButtonClicked(false)
    }
  }
  const handleEditReminderClick = () => {
    setIsViewReminderModalOpen(false)
    setIsEditButtonClicked(true)
    toggleModal(true)
  }
  const {dispatchAction} = useDispatchAction()
  const [isEditButtonClicked, setIsEditButtonClicked] = useState(false)
  const reminder =
    orderItem.reminders && orderItem.reminders?.length > 0
      ? orderItem.reminders[orderItem.reminders.length - 1]
      : null

  return (
    <>
      {/* <When isTrue={isCreateReminderModalOpen}>
        <ModalCreateReminder
          setIsModalCreateReminderOpen={setIsCreateReminderModalOpen}
          isNew={true}
          alignerJourneyId={orderItem.aligner_journey.aligner_journey_id}
        />
      </When> */}

      <When isTrue={isViewReminderModalOpen}>
        <ModalViewReminder
          setIsModalViewReminderOpen={setIsViewReminderModalOpen}
          reminderDate={reminderDate}
          onDeleteReminderClick={handleDeleteReminderClick}
          onEditReminderClick={handleEditReminderClick}
          reminderTime={reminder?.time}
        />
      </When>
      <AddReminderModal
        {...{
          isModalVisible,
          toggleModal,
          isOnProductionPage: true,
          ...(isEditButtonClicked && {
            productionOrderReminderDetails: {
              title: reminder?.title,
              date: reminder?.remind_at,
              notes: reminder?.notes,
              time: reminder?.time,
              productionOrderReminderId: reminder?.reminder_id,
            },
          }),
          productionOrderPatientId: orderItem.patient.id,
          productionOrderAlignerJourneyId: orderItem.aligner_journey.aligner_journey_id,
        }}
      />

      <DeleteEvent
        {...{
          eventType: 'PRODUCTION_REMINDER',
          onOkClick: async () => {
            if (reminder) {
              await dispatchAction(
                deleteEvent({
                  reminder_id: reminder.reminder_id,
                  isAppointment: false,
                  isReminder: true,
                  patient_id: safeParseInt(orderItem.patient.id),
                  reminder_category: 'PRODUCTION_REMINDER',
                  aligner_journey_id: orderItem.aligner_journey.aligner_journey_id,
                })
              )
              dispatchAction(
                postApiDataProductionSlice({
                  status: '',
                  doctorId: safeParseInt(userId),
                })
              )
              SuccessToast('Reminder deleted successfully.')
            }
          },
          visible: isDeleteReminderModalOpen,
          setDeleteModalVisible: setIsDeleteReminderModalOpen,
        }}
      />
      <When isTrue={isModalViewNotesOpen}>
        <ModalViewNotes
          setIsModalViewNotesOpen={setIsModalViewNotesOpen}
          notes={orderItem.aligner_journey.notes}
          setIsModalCreateNotesOpen={setIsModalCreateNotesOpen}
          onEditNoteClick={handleEditNoteClick}
          onDeleteNoteClick={handleDeleteNoteClick}
        />
      </When>

      <When isTrue={isModalCreateNotesOpen}>
        <ModalCreateNote
          setIsModalCreateNoteOpen={setIsModalCreateNotesOpen}
          isNew={true}
          alignerJourneyId={orderItem.aligner_journey.aligner_journey_id}
        />
      </When>

      <When isTrue={isModalEditNotesOpen}>
        <ModalCreateNote
          setIsModalCreateNoteOpen={setIsModalEditNotesOpen}
          isNew={false}
          noteId={editNoteState.noteId}
          prevTitle={editNoteState.noteTitle}
          prevText={editNoteState.noteText}
          alignerJourneyId={orderItem.aligner_journey.aligner_journey_id}
        />
      </When>

      <When isTrue={isModalDeleteNotesOpen}>
        <ModalDeleteNote
          setIsModalDeleteNoteOpen={setIsModalDeleteNotesOpen}
          noteId={noteIdToBeDeleted}
          alignerJourneyId={orderItem.aligner_journey.aligner_journey_id}
        />
      </When>
      <div className='flex justify-between text-sm font-medium'>
        <div className='flex gap-3 items-center'>
          <p className='text-black font-bold text-base'>
            {orderItem.patient.first_name}{' '}
            {hasValue(orderItem.patient.last_name) && orderItem.patient.last_name}
          </p>
          <div className='border-r border-mediumGray h-6' />

          <p>Clear aligners treatment</p>
          <div className='border-r border-mediumGray h-6' />

          <div className='px-2.5 py-1.5 bg-lightGray rounded font-semibold'>
            <p>{orderItem.aligner_journey.brand}</p>
          </div>
        </div>
        <div className='flex gap-3 items-center'>
          <div className='flex  items-center'>
            <p className='font-normal'>
              {hasValue(reminderDate) ? 'Next reminder on - ' : 'No reminder set -'}{' '}
            </p>
            <When isTrue={!hasValue(reminderDate)}>
              <AntdButton
                text='Create reminder'
                className='px-2.5 py-2 text-sm h-8 flex items-center bg-primaryColor font-semibold ml-2'
                onClick={() => {
                  identifyUser()

                  toggleModal(true)
                }}
              />
            </When>
            <When isTrue={hasValue(reminderDate)}>
              <div className='edit-reminder'>
                <AntdButton
                  text={
                    <p className='underline text-textColor font-semibold text-base'>
                      {moment(reminderDate).format('DD MMMM YYYY')}
                    </p>
                  }
                  className='hover:bg-white px-1.5 py-2 h-8 flex items-center'
                  onClick={() => {
                    identifyUser()

                    setIsViewReminderModalOpen(true)
                  }}
                  type='text'
                />
              </div>
            </When>
          </div>
          <div className='view-notes'>
            <AntdButton
              text='View notes'
              className='px-2.5 py-2 text-sm h-8 flex items-center border border-secondaryColor hover:!bg-secondaryColor bg-white text-secondaryColor font-semibold'
              onClick={() => {
                identifyUser()

                setIsModalViewNotesOpen(true)
              }}
            />
          </div>
          <div className='show-profile'>
            <AntdButton
              text={
                <div className='flex items-center gap-2'>
                  <p>View profile</p>
                  <SVG_RIGHT_ARROW_ICON />
                </div>
              }
              className='px-2.5 py-2 text-sm h-8 flex items-center font-semibold text-textColor border border-textColor'
              onClick={async () => {
                identifyUser()
                const patientId = orderItem.patient.id

                navigation(`/profile/${patientId}/aligner-tracking`)
              }}
            />
          </div>
        </div>
      </div>
    </>
  )
}

export default OrderListItemHeader
