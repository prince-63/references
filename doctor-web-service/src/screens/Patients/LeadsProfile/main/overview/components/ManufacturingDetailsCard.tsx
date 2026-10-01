import cn from '@utils/cn'
import {ManufacturingStatus} from '../types/GettingStarted.types'
import {Tag} from 'antd'

/* ---------- 1. Types ---------------------------------------------------- */

type MaybeValue = string | number | null | undefined

type JawRange = {
  start: MaybeValue
  end: MaybeValue
}

interface ManufacturingDetailsCardProps {
  totalAligners: MaybeValue
  upperJaw?: JawRange
  lowerJaw?: JawRange
  title?: string
  containerClassName?: string
  borderBottomOnly?: boolean
  status?: ManufacturingStatus
  children?: React.ReactNode
}

/* ---------- 2. Utils ---------------------------------------------------- */

const isEmpty = (v: MaybeValue) => v === null || v === undefined || v === '' || v === 0 || v === '0'

const shouldShowJaw = (jaw?: JawRange) => jaw && !(isEmpty(jaw.start) && isEmpty(jaw.end))

// const isEditable = (title?: string, status?: ManufacturingStatus) =>
//   title === 'IN MANUFACTURING' && status === manufacturingConstants.MANUFACTURING_STARTED

/* ---------- 3. Component ------------------------------------------------ */

export const ManufacturingDetailsCard = ({
  totalAligners,
  upperJaw = {start: null, end: null},
  lowerJaw = {start: null, end: null},
  title,
  containerClassName,
  borderBottomOnly = false,
  status,
  children,
}: ManufacturingDetailsCardProps) => {
  const wrapperClass = cn(
    'w-full flex flex-col p-3 sm:p-4',
    borderBottomOnly ? 'border-b border-mediumGray' : 'border border-mediumGray rounded-lg',
    containerClassName
  )

  const allValuesEmpty =
    isEmpty(totalAligners) &&
    isEmpty(upperJaw.start) &&
    isEmpty(upperJaw.end) &&
    isEmpty(lowerJaw.start) &&
    isEmpty(lowerJaw.end)

  /* ---- 3a. Empty‑state shortcut --------------------------------------- */
  if (allValuesEmpty) {
    return (
      <div className={wrapperClass}>
        <div className='flex justify-between text-sm sm:text-base font-medium'>
          <div className='text-textColor'>{title}</div>
        </div>
        <div className='text-black text-sm sm:text-base font-medium mt-2'>—</div>
        {/* Actions slot also for empty state */}
        {children && <div className='mt-3'>{children}</div>}
      </div>
    )
  }

  /* ---- 3b. Normal card ------------------------------------------------- */
  return (
    <div className={wrapperClass}>
      <div className='flex flex-col text-sm sm:text-base font-medium'>
        {/* Header row */}
        <div className='flex justify-between'>
          {title && <div className='text-textColor'>{title} </div>}
        </div>

        {/* Total + status */}
        <div className='flex items-center gap-2 mt-1'>
          <span>{isEmpty(totalAligners) ? '—' : totalAligners + ' Aligners'}</span>
          {title === 'IN MANUFACTURING' && status && (
            <Tag
              color={status === 'COMPLETED' ? 'green' : 'gold'}
              className='m-0 text-xs md:text-sm font-medium'
            >
              {status === 'MANUFACTURING_STARTED'
                ? 'In Production'
                : status === 'IN_PROGRESS'
                  ? 'In Progress'
                  : status === 'COMPLETED'
                    ? 'Completed'
                    : status === 'PENDING'
                      ? 'Pending'
                      : status}
            </Tag>
          )}
        </div>

        {/* Upper jaw */}
        {shouldShowJaw(upperJaw) && (
          <div className='flex gap-4 items-center mt-1'>
            <div className='text-textColor text-xs sm:text-sm'>Upper jaw</div>
            <div className='text-black text-xs sm:text-sm'>{`${upperJaw.start ?? '—'} to ${
              upperJaw.end ?? '—'
            }`}</div>
          </div>
        )}

        {/* Lower jaw */}
        {shouldShowJaw(lowerJaw) && (
          <div className='flex gap-4 items-center mt-1'>
            <div className='text-textColor text-xs sm:text-sm'>Lower jaw</div>
            <div className='text-black text-xs sm:text-sm'>{`${lowerJaw.start ?? '—'} to ${
              lowerJaw.end ?? '—'
            }`}</div>
          </div>
        )}
      </div>
      {/* Actions slot */}
      {children && <div className='mt-2 sm:mt-3'>{children}</div>}
    </div>
  )
}
