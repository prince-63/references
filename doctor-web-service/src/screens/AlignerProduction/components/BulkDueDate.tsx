import {useState} from 'react'
import {DatePicker} from 'antd'
import dayjs, {Dayjs} from 'dayjs'
import clsx from 'clsx'
import getColorPalette from 'utils/getColorPalette'
import CaretRightIcon from 'assets/icons/CaretRightIcon'

type Props = {
  onApply: (isoDate: string | '') => void
  className?: string
  disabled?: boolean
  label?: string
}

const BulkDueDate: React.FC<Props> = ({onApply, className, disabled, label = 'Set due date'}) => {
  const [open, setOpen] = useState(false)

  const handleChange = (d: Dayjs | null) => {
    // midnight UTC ISO like your single-item AddDueDate
    const iso = d ? new Date(Date.UTC(d.year(), d.month(), d.date(), 0, 0, 0, 0)).toISOString() : ''
    setOpen(false)
    onApply(iso)
  }

  return (
    <div className={clsx('relative inline-block', className)}>
      <button
        type='button'
        disabled={disabled}
        onClick={() => setOpen(true)}
        className={clsx(
          'flex items-center gap-1 h-10 px-3 rounded-md border',
          disabled
            ? 'cursor-not-allowed opacity-60 border-gray-300 text-gray-400'
            : 'border-primaryColor text-primaryColor'
        )}
      >
        <span className='text-sm font-medium'>{label}</span>
        <CaretRightIcon color={getColorPalette().primaryColor} />
      </button>

      {/* Invisible DatePicker popover (same pattern as row component) */}
      <div className='absolute' onClick={(e) => e.stopPropagation()}>
        <DatePicker
          open={open}
          onOpenChange={setOpen}
          onChange={handleChange}
          inputReadOnly
          // You can tweak this like your single AddDueDate (disallow past)
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

export default BulkDueDate
