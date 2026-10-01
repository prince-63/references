import React from 'react'

type Props = {
  title?: string
  trayLabel?: string
  timeLabel?: string
  feedbackValue?: string
  otherIssueValue?: string
  jawType?: string
}

const ReportIssueCard: React.FC<Props> = ({
  title = 'ISSUE REPORTED',
  trayLabel = 'Tray #2',
  timeLabel = '06:45 PM',
  feedbackValue = 'Edges feel sharp',
  otherIssueValue = 'None',
  jawType = '',
}) => {
  return (
    <div className='w-full flex justify-end'>
      <div className='bg-slate-50 rounded-tl-2xl rounded-bl-2xl rounded-br-2xl border mr-2 border-slate-200 p-4 w-full max-w-[340px] overflow-hidden'>
        {/* Header */}
        <div className='flex items-center justify-between mb-4'>
          <h3 className='text-red-500 font-extrabold tracking-widest text-sm'>{title}</h3>

          <div className='bg-white border border-slate-200 px-3 py-1.5 rounded-xl'>
            <span className='text-slate-600 font-bold text-sm'>{trayLabel}</span>
          </div>
        </div>

        {/* Feedback blocks */}
        <div className='mt-1'>
          <div className='bg-white rounded-2xl border border-slate-100 p-4 mb-3'>
            <p className='text-slate-400 font-medium tracking-widest text-xs uppercase mb-1'>
              JAW TYPE
            </p>
            <p className='text-black text-sm font-semibold'>{jawType}</p>
          </div>

          <div className='bg-white rounded-2xl border border-slate-100 p-4 mb-3'>
            <p className='text-slate-400 font-medium tracking-widest text-xs uppercase mb-1'>
              FEEDBACK
            </p>
            <p className='text-black text-sm font-semibold'>{feedbackValue}</p>
          </div>

          <div className='bg-white rounded-2xl border border-slate-100 p-4'>
            <p className='text-slate-400 font-medium tracking-widest text-xs uppercase mb-1'>
              OTHER ISSUE
            </p>
            <p className='text-black text-sm font-semibold'>{otherIssueValue}</p>
          </div>

          <p className='text-slate-400 text-right font-bold mt-4 text-sm'>{timeLabel}</p>
        </div>
      </div>
    </div>
  )
}

export default ReportIssueCard
