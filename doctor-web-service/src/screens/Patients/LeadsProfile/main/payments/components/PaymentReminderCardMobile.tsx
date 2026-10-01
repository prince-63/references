import CommonSVG from 'components/atom/SVG/CommonSVG'
import {SVG_EXPAND_RIGHT} from 'utils/SvgConstants'
import moment from 'moment'
import {PaymentRemindersDetail} from '../types/payments.types'
import useDispatchAction from '@hooks/useDispatchAction'
import {setSelectedPaymentReminderId} from 'redux/Slices/AppSlice/Payments/Payments.slice'
import hasValue from 'utils/hasValue'
import CalendarDotsIcon from 'assets/icons/CalendarDotsIcon'
import CreditCardOutline from 'assets/icons/CreditCardOutline'
import NotesOutlineIcon from 'assets/icons/NotesOutlineIcon'

const PaymentReminderCardMobile = ({
  reminder,
  toggleAddReminderFormContainer,
}: {
  reminder: PaymentRemindersDetail
  toggleAddReminderFormContainer: (value: boolean) => void
}) => {
  const {dispatchAction} = useDispatchAction()

  return (
    <div
      className='flex flex-col gap-3 my-5 cursor-pointer border border-lighterGray rounded-lg p-4 font-semibold text-sm md:hidden'
      onClick={() => {
        dispatchAction(setSelectedPaymentReminderId(reminder.reminder_id))
        toggleAddReminderFormContainer(true)
      }}
    >
      <div className='flex justify-between items-center '>
        <div className='flex gap-2 text-base'>
          <CalendarDotsIcon />
          <p>
            {moment(reminder.time, 'HH:mm:ss').format('hh:mm A')},{' '}
            {moment(reminder.date).format('DD MMM YYYY')}
          </p>
        </div>
        <div className='w-8 h-8 rounded-2xl justify-center items-center gap-2 inline-flex'>
          <CommonSVG svg={SVG_EXPAND_RIGHT} height='12' width='12' />
        </div>
      </div>
      <div className='w-full border border-lightGray'></div>
      <div className='flex gap-2 items-start justify-start'>
        <CreditCardOutline />
        <p>
          {hasValue(reminder.amount)
            ? '₹ ' + Number(reminder.amount).toLocaleString('en-IN')
            : '--'}
        </p>
      </div>
      <div className='flex gap-2 items-start justify-start'>
        <NotesOutlineIcon />
        <p className='text-textColor'>{hasValue(reminder.note) ? reminder.note : '--'}</p>
      </div>
    </div>
  )
}

export default PaymentReminderCardMobile
