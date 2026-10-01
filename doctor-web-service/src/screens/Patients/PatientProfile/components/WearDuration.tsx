import clsx from 'clsx'
import When from '../../../../components/when/When'
import {formatPluralizedStringOnly, removeSign} from '../../../../utils/ConstFunctions'
import {formatDatesForTreatmentPlanTable} from '../../../../utils/DateFunctions'
import hasValue from 'utils/hasValue'

interface WearDurationCellProps {
  startDate?: string
  endDate?: string
  changeDate?: string | null
  changeOffset: number | null
  showDateRange?: boolean
  isManualTracking?: boolean
  showHyphen?: boolean
  disabled?: boolean
}

const WearDuration: React.FC<WearDurationCellProps> = ({
  startDate,
  endDate,
  changeDate,
  changeOffset,
  showDateRange = true,
  isManualTracking,
  showHyphen,
  disabled = false,
}) => {
  const showOffset = hasValue(changeOffset) && !isManualTracking
  const offsetValue = removeSign(changeOffset)

  return (
    <div className='flex justify-start items-center text-textColor text-sm font-medium'>
      <div>
        {showDateRange && !showHyphen ? (
          <p className={clsx(disabled && 'text-grayDisabled')}>
            {formatDatesForTreatmentPlanTable(startDate ?? '', changeDate ?? endDate ?? '')}
          </p>
        ) : (
          showHyphen && <p className='text-grayDisabled'>--</p>
        )}

        <When isTrue={showOffset}>
          <div className='flex gap-1 items-center'>
            <div
              className={clsx(
                'w-2 h-2 rounded-full',
                changeOffset === 0 ? 'bg-tertiaryColor' : 'bg-red'
              )}
            ></div>
            <div className='text-sm font-semibold'>
              {changeOffset! > 0 && (
                <span className='text-red'>
                  Delayed by {offsetValue} {formatPluralizedStringOnly(Number(offsetValue), 'day')}
                </span>
              )}
              {changeOffset! < 0 && (
                <span className='text-red'>
                  Early by {offsetValue} {formatPluralizedStringOnly(Number(offsetValue), 'day')}
                </span>
              )}
              {changeOffset === 0 && <span className='text-tertiaryColor'>On Time</span>}
            </div>
          </div>
        </When>
      </div>
    </div>
  )
}

export default WearDuration
