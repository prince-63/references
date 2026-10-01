import React from 'react'
import moment from 'moment'

type Props = {
  dateLabel?: string
  timeLabel?: string
  trayLabel?: string
  title?: string
  description?: string
  status?: string
  changeStatus?: 'ON_TIME' | 'EARLY' | 'DELAYED'
  metadata?: {
    previous_aligner_change_date?: string
    previous_aligner_end_date?: string
    days_gap_from_end_date_to_change_date?: number
  }
}

const SuccessIcon = ({className = ''}: {className?: string}) => {
  return (
    <div
      className={`w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 ${className}`}
    >
      <svg width='22' height='22' viewBox='0 0 24 24' fill='none'>
        <circle cx='16' cy='16' r='10' fill='#10B981' opacity={0.18} />
        <path
          d='M8.6 12.2l2.2 2.2 4.9-5.1'
          stroke='#10B981'
          strokeWidth={2.6}
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </svg>
    </div>
  )
}

const WarningIcon = ({className = ''}: {className?: string}) => {
  return (
    <svg className={className} width='16' height='16' viewBox='0 0 24 24' fill='none'>
      <path
        d='M12 8v4M12 16h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
        stroke='#EF4444'
        strokeWidth={2}
        strokeLinecap='round'
      />
    </svg>
  )
}

const StatusSuccessIcon = ({className = ''}: {className?: string}) => {
  return (
    <svg className={className} width='16' height='16' viewBox='0 0 24 24' fill='none'>
      <path
        d='M20 6L9 17L4 12'
        stroke='#10B981'
        strokeWidth={2.5}
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  )
}

const AlignerChangedCard: React.FC<Props> = ({
  timeLabel = '09:15 AM',
  trayLabel = 'Aligner #1 - #2',
  title = 'ALIGNER CHANGED',
  description = 'Upper Aligner #2 is now active.',
  changeStatus = 'ON_TIME',
  metadata,
}) => {
  const getStatusColor = () => {
    if (changeStatus === 'ON_TIME') return 'bg-emerald-500'
    if (changeStatus === 'EARLY' || changeStatus === 'DELAYED') return 'bg-red-500'
    return 'bg-emerald-500'
  }

  const getStatusText = () => {
    if (changeStatus === 'ON_TIME') return 'Aligner change on time'
    if (changeStatus === 'EARLY') {
      return `Aligner change early by ${Math.abs(metadata?.days_gap_from_end_date_to_change_date || 0)} days.`
    }
    if (changeStatus === 'DELAYED') {
      return `Aligner change delayed by ${Math.abs(metadata?.days_gap_from_end_date_to_change_date || 0)} days.`
    }
    return ''
  }

  const getStatusBgColor = () => {
    if (changeStatus === 'ON_TIME') return 'bg-emerald-50 border-emerald-500'
    if (changeStatus === 'EARLY' || changeStatus === 'DELAYED')
      return 'bg-redSupport border-red-500'
    return 'bg-emerald-50 border-emerald-500'
  }

  return (
    <div className='w-full flex justify-end'>
      <div className='bg-slate-50 rounded-tl-2xl rounded-bl-2xl rounded-br-2xl mr-2 border border-slate-200 w-full max-w-[340px] overflow-hidden'>
        <div className='flex'>
          <div className={`w-1 ${getStatusColor()}`} />

          <div className='flex-1 p-5'>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-emerald-600 font-extrabold tracking-widest text-sm'>{title}</h3>

              <div className='bg-white border border-slate-200 px-3 py-1.5 rounded-xl'>
                <span className='text-slate-600 font-bold text-sm'>{trayLabel}</span>
              </div>
            </div>

            <div className='flex items-start mt-4 gap-4'>
              <SuccessIcon />
              <p className='text-slate-700 text-[13px] font-bold flex-1'>{description}</p>
            </div>

            {changeStatus && (
              <div className='flex flex-col mt-4'>
                <div
                  className={`px-3 py-2 flex ${getStatusBgColor()} rounded border justify-start items-center gap-2`}
                >
                  {changeStatus !== 'ON_TIME' ? <WarningIcon /> : <StatusSuccessIcon />}

                  <span
                    className={`text-sm font-medium ${
                      changeStatus !== 'ON_TIME' ? 'text-red-500' : 'text-emerald-600'
                    }`}
                  >
                    {getStatusText()}
                  </span>
                </div>

                <div className='flex mt-3 ml-0.5'>
                  <span className='text-textColor text-sm w-[40%]'>Actual</span>
                  <span className='text-black text-sm w-[50%] font-medium'>
                    {metadata?.previous_aligner_change_date
                      ? moment(metadata.previous_aligner_change_date).format('DD MMM YYYY')
                      : '-'}
                  </span>
                </div>

                <div className='flex ml-0.5 mt-2'>
                  <span className='text-textColor text-sm w-[40%]'>Recommended</span>
                  <span className='text-black text-sm w-[50%] font-medium'>
                    {metadata?.previous_aligner_end_date
                      ? moment(metadata.previous_aligner_end_date).format('DD MMM YYYY')
                      : '-'}
                  </span>
                </div>
              </div>
            )}

            <div className='text-slate-400 font-bold mt-3 text-right text-sm'>{timeLabel}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AlignerChangedCard
