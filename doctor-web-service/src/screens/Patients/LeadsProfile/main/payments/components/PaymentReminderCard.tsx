import CommonSVG from 'components/atom/SVG/CommonSVG'
import {SVG_EXPAND_RIGHT} from 'utils/SvgConstants'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import moment from 'moment'
import {PaymentRemindersDetail} from '../types/payments.types'
import useDispatchAction from '@hooks/useDispatchAction'
import {getPaymentDetail} from 'redux/Slices/AppSlice/Payments/Payments.slice'
import hasValue from 'utils/hasValue'
import {convertYYYYMMDDTOddddDDMMMMYY} from '../../appointments/utils/DateConversion'
import {useContext, useEffect, useState} from 'react'
import PaymentReminderCardMobile from './PaymentReminderCardMobile'
import When from 'components/when/When'
import TrashOutline from 'assets/icons/TrashOutline'
import {useNavigate, useParams} from 'react-router-dom'
import DeleteEvent from 'components/deleteEvent/DeleteEvent'
import {deleteEvent} from 'redux/Slices/AppSlice/Calendar/calendar.slice'
import SuccessToast from 'components/modal/Alert/SuccessToast'
import {safeParseInt} from 'utils/ConstFunctions'
import {AuthContext} from 'context/AuthContext'

export const PaymentReminderCard = ({
  toggleAddReminderFormContainer,
}: {
  toggleAddReminderFormContainer: (value: boolean) => void
}) => {
  const {dispatchAction} = useDispatchAction()
  const {paymentDetail} = useSelector((state: RootState) => state.payments)
  const {userId} = useContext(AuthContext)
  const {patientId} = useParams()
  const [reminderList, setReminderList] = useState<PaymentRemindersDetail[]>([])
  const [deleteEventModalVisible, setDeleteEventModalVisible] = useState(false)
  const [selectedReminderId, setSelectedReminderId] = useState<number | undefined>()

  useEffect(() => {
    if (paymentDetail && paymentDetail.reminders) {
      const reminderList: PaymentRemindersDetail[] = [...paymentDetail.reminders]
      const sortedReminders = reminderList.sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time}`).getTime()
        const dateB = new Date(`${b.date}T${b.time}`).getTime()
        return dateA - dateB
      })
      setReminderList(sortedReminders)
    }
  }, [paymentDetail.reminders])
  const navigate = useNavigate()
  return (
    <div>
      <div className='text-textColor text-sm font-semibold leading-tight tracking-tight mt-2'>
        Upcoming reminders
      </div>
      <DeleteEvent
        {...{
          eventType: 'PAYMENT_REMINDER',
          onOkClick: async () => {
            if (selectedReminderId) {
              await dispatchAction(
                deleteEvent({
                  reminder_id: selectedReminderId,
                  isAppointment: false,
                  isReminder: true,
                  patient_id: safeParseInt(patientId),
                  reminder_category: 'PAYMENT_REMINDER',
                })
              )
              await dispatchAction(
                getPaymentDetail({
                  doctor_id: safeParseInt(userId),
                  patient_id: safeParseInt(patientId),
                })
              )
              SuccessToast('Reminder deleted successfully.')
            }
          },
          visible: deleteEventModalVisible,
          setDeleteModalVisible: setDeleteEventModalVisible,
        }}
      />
      {reminderList.map((element: PaymentRemindersDetail, index) => (
        <div key={element.reminder_id}>
          <div
            className='md:flex flex-col my-5   cursor-pointer hover:bg-primarySupport hidden'
            onClick={() => {
              const {reminder_id, date} = element
              if (reminder_id && date) {
                navigate('/calendar', {
                  state: {
                    reminderId: reminder_id,
                    eventDate: date,
                  },
                })
              }
            }}
          >
            <div className='h-20 pl-5 pr-4 rounded-lg border border-neutral-200 justify-between items-center inline-flex'>
              <div className='w-[30%] h-20 pl-5 pr-4 justify-start items-center gap-2 inline-flex'>
                <div
                  className={`text-black/opacity-20 text-sm font-semibold leading-tight tracking-tight`}
                >
                  {convertYYYYMMDDTOddddDDMMMMYY(element.date) +
                    ' at ' +
                    moment(element.time, 'HH:mm:ss').format('hh:mm A')}
                </div>
              </div>
              <div className='w-[30%] h-20 pl-5 pr-4 justify-start items-center gap-2 inline-flex'>
                <div className={`text-center text-black/opacity-20 text-sm font-semibold`}>
                  {hasValue(element.amount)
                    ? '₹ ' + Number(element.amount).toLocaleString('en-IN')
                    : '--'}
                </div>
              </div>
              <div className='flex-col w-[60%]'>
                <div className='text-black text-sm font-semibold leading-tight tracking-tight'>
                  {'Notes'}
                </div>
                <div className='w-[500px] mt-1 text-textColor text-sm font-medium leading-tight truncate'>
                  {hasValue(element.note) ? element.note : '--'}
                </div>
              </div>
              <div className='flex-[0.1] flex items-center justify-center'>
                <div className='flex gap-2 items-center'>
                  <button
                    type='button'
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedReminderId(element.reminder_id)
                      setDeleteEventModalVisible(true)
                    }}
                  >
                    <TrashOutline />
                  </button>
                  <div className='w-8 h-8 rounded-2xl justify-center items-center gap-2 inline-flex'>
                    <CommonSVG svg={SVG_EXPAND_RIGHT} height='15' width='15' />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <PaymentReminderCardMobile
            {...{
              reminder: element,
              toggleAddReminderFormContainer,
            }}
          />
          <When isTrue={index !== reminderList.length - 1}>
            <div className='w-full border border-lightGray'></div>
          </When>
        </div>
      ))}
    </div>
  )
}
