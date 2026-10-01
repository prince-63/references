import {DatePicker} from 'antd'
import CaretRightIcon from 'assets/icons/CaretRightIcon'
import PencilIcon from 'assets/icons/PencilIcon'
import clsx from 'clsx'
import dayjs, {Dayjs} from 'dayjs'
import {useContext, useState} from 'react'
import getColorPalette from 'utils/getColorPalette'
import hasValue from 'utils/hasValue'
import useDispatchAction from '@hooks/useDispatchAction'
import {updateOrder} from 'redux/Slices/AppSlice/orders/orders.slice'
import {safeParseInt} from 'utils/ConstFunctions'
import {AuthContext} from 'context/AuthContext'
import reminderTypeConstants from '@constants/reminderType.constants'
import moment from 'moment'
import {addReminderEvent, updateReminderEvent} from 'redux/Slices/AppSlice/Calendar/calendar.slice'
import SuccessToast from 'components/modal/Alert/SuccessToast'

const AddDueDateContainer = ({
  order_id,
  order_due_by,
  refreshData,
  isReminder = false,
  patient_id = null,
  reminder_id,
  treatment_plan_id,
  buttonText = null,
  buttonClassName,
}: {
  order_due_by: string | null
  order_id?: string | null
  refreshData: () => void
  isReminder?: boolean
  patient_id?: number | null
  reminder_id?: number | null
  treatment_plan_id?: number | null
  buttonText?: string | null
  buttonClassName?: string
}) => {
  const {userId} = useContext(AuthContext)
  const [open, setOpen] = useState(false)
  const {dispatchAction} = useDispatchAction()

  const handleChange = async (date: Dayjs | null) => {
    const formattedDate = date ? dayjs(date).format('YYYY-MM-DD') : ''
    setOpen(false)
    if (isReminder) {
      handleRemind(date)
    } else {
      dispatchAction(
        updateOrder({
          due_by: formattedDate,
          order_id: order_id ?? '0',
          doctor_id: safeParseInt(userId),
        })
      )
        .unwrap()
        .then(() => {
          refreshData()
        })
    }
  }

  const handleRemind = (date: Dayjs | null) => {
    const reminderDetails = {
      reminder_category: reminderTypeConstants.UNPROCESSED_ALIGNER_REMINDER,
      doctor_id: Number(userId),
      patient_id: Number(patient_id ?? 0),
      date: dayjs(date).format('YYYY-MM-DD'),
      time: moment().format('HH:mm:ss'),
      treatment_plan_id: treatment_plan_id,
    }
    if (reminder_id !== null) {
      const updatePayload = {...reminderDetails, reminder_id: Number(reminder_id)}
      dispatchAction(updateReminderEvent(updatePayload))
        .unwrap()
        .then(() => {
          SuccessToast('Reminder added successfully!')
          refreshData()
        })
    } else {
      dispatchAction(addReminderEvent(reminderDetails))
        .unwrap()
        .then(() => {
          SuccessToast('Reminder updated successfully!')
          refreshData()
        })
    }
  }

  return (
    <div>
      {hasValue(order_due_by) ? (
        <div className='flex gap-1 items-center'>
          <div className={clsx('text-sm font-medium text-black', buttonClassName)}>
            {dayjs(order_due_by).format('DD-MMM-YYYY')}
          </div>
          {!buttonText && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                setOpen(true)
              }}
              className={clsx('flex gap-2 items-center')}
            >
              <PencilIcon />
            </button>
          )}
        </div>
      ) : (
        <>
          <button
            type='button'
            className={clsx(
              'flex gap-1 items-center text-primaryColor text-sm font-semibold',
              buttonClassName
            )}
            onClick={(e) => {
              e.stopPropagation()
              setOpen(true)
            }}
          >
            {buttonText ? buttonText : <div>Add</div>}
            {!buttonText && <CaretRightIcon color={getColorPalette().primaryColor} />}
          </button>
        </>
      )}
      <div className='absolute' onClick={(e) => e.stopPropagation()}>
        <DatePicker
          open={open}
          onOpenChange={setOpen}
          onChange={handleChange}
          inputReadOnly
          disabledDate={(current) => current && current <= dayjs().startOf('day')}
          style={{
            opacity: 0,
            position: 'absolute',
            pointerEvents: 'none',
            height: 0,
            width: 0,
          }}
        />
      </div>
    </div>
  )
}

export default AddDueDateContainer
