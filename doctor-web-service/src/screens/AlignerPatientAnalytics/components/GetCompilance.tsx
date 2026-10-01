import filterAlignerPatientAnalyticsConstants from '@constants/filterAlignerPatientAnalyticsConstants'
import clsx from 'clsx'

type StatusKey =
  | 'NEED_ATTENTION'
  | typeof filterAlignerPatientAnalyticsConstants.AT_RISK
  | typeof filterAlignerPatientAnalyticsConstants.ON_TRACK

const statusStyles: Record<StatusKey, {text: string; color: string}> = {
  ['NEED_ATTENTION']: {
    text: 'Need Attention',
    color: 'red',
  },
  [filterAlignerPatientAnalyticsConstants.AT_RISK]: {
    text: 'At Risk',
    color: 'orange',
  },
  [filterAlignerPatientAnalyticsConstants.ON_TRACK]: {
    text: 'On Track',
    color: 'tertiaryColor',
  },
}

const GetCompilance = ({app_invite_status}: {app_invite_status: string}) => {
  const status = statusStyles[app_invite_status as StatusKey]

  if (!status) return null

  return (
    <div className='flex gap-1 items-center justify-start'>
      <div className={clsx('w-2 h-2 rounded-full', `bg-${status.color}`)}></div>
      <span className={clsx('font-semibold text-sm', `text-${status.color}`)}>{status.text}</span>
    </div>
  )
}

export default GetCompilance
