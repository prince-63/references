import useDispatchAction from '@hooks/useDispatchAction'
import {DatePicker} from 'antd'
import CaretRightIcon from 'assets/icons/CaretRightIcon'
import clsx from 'clsx'
import {useState} from 'react'
import getColorPalette from 'utils/getColorPalette'
import hasValue from 'utils/hasValue'
import dayjs, {Dayjs} from 'dayjs'
import SuccessToast from 'components/modal/Alert/SuccessToast'
import {addDueDateTask} from 'redux/Slices/AppSlice/Kanban/Kanban.slice'

const AddDueDate = ({
  date,
  id,
  refreshData,
}: {
  date: string | null
  id: number
  refreshData: () => void
}) => {
  const [open, setOpen] = useState(false)
  const {dispatchAction} = useDispatchAction()

  const handleChange = async (date: Dayjs | null) => {
    const formattedDate = date
      ? new Date(Date.UTC(date.year(), date.month(), date.date(), 0, 0, 0, 0)).toISOString()
      : ''
    setOpen(false)
    dispatchAction(
      addDueDateTask({
        task_id: id,
        estimated_completion_date: formattedDate,
      })
    )
      .unwrap()
      .then(() => {
        SuccessToast('Due date added successfully!')
        refreshData()
      })
  }
  return (
    <div>
      {hasValue(date) ? (
        <div className='flex gap-1 items-center'>
          <div className='text-sm font-medium text-black'>{dayjs(date).format('DD-MMM-YYYY')}</div>
          {/* <button
            onClick={(e) => {
              e.stopPropagation()
              setOpen(true)
            }}
            className={clsx('flex gap-2 items-center')}
          >
            <PencilIcon />
          </button> */}
        </div>
      ) : (
        <>
          <button
            type='button'
            className={clsx('flex gap-1 items-center text-primaryColor text-sm font-semibold')}
            onClick={(e) => {
              e.stopPropagation()
              setOpen(true)
            }}
          >
            <div>Add</div>
            <CaretRightIcon color={getColorPalette().primaryColor} />
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

export default AddDueDate
