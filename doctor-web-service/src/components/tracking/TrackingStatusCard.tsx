import {Switch} from 'antd'
import clsx from 'clsx'
import When from 'components/when/When'
import {FiCheck} from 'react-icons/fi'
import {useLocation} from 'react-router-dom'

type Feature = {
  label: string
}

type TrackingStatusCardProps = {
  enabled: boolean
  onToggle?: (next: boolean) => void
  titleEnabled?: string
  titleDisabled?: string
  descriptionEnabled?: string
  descriptionDisabled?: string
  unavailableFeatures?: Feature[]
  benefits?: Feature[]
  enableLabel?: string
  disableLabel?: string
  className?: string
}

const defaultFeatures: Feature[] = [
  {label: "Patients can't track aligner wear time, progress, or check-ins."},
  {label: 'Email invitations for patient onboarding are disabled.'},
  {label: 'In-app chat and issue reporting are turned off.'},
  {label: 'No patient activity, wear-time, or compliance insights.'},
  {label: 'Automated notifications and reminders will not be sent.'},
]

const defaultBenefits: Feature[] = [
  {label: 'Patients track aligner stages, wear time, and check-ins in real time.'},
  {label: 'Review patient updates, monitor daily wear, and address reported issues.'},
  {label: 'Automatic reminders and notifications keep patients on schedule.'},
  {label: 'In-app chat keeps communication direct and effortless.'},
  {label: 'Email invitations make onboarding patients quick and simple.'},
  {label: 'Gain visibility into engagement, compliance, and treatment progress in one place.'},
]

const TrackingStatusCard = ({
  enabled,
  onToggle,
  titleEnabled = 'Tracking is enabled',
  titleDisabled = 'Tracking is disabled',
  descriptionEnabled = 'Tracking and communication features are active.',
  descriptionDisabled = 'Currently, your customers and their patients cannot use the tracking or communication features.',
  unavailableFeatures = defaultFeatures,
  benefits = defaultBenefits,
  className,
}: TrackingStatusCardProps) => {
  const title = enabled ? titleEnabled : titleDisabled
  const description = enabled ? descriptionEnabled : descriptionDisabled
  const location = useLocation()
  const practice_lab_profile = location.pathname.includes('practice-lab-profile')

  return (
    <div
      className={clsx(
        'border border-lightGray rounded-lg overflow-hidden bg-white shadow-sm',
        className
      )}
    >
      <div
        className={clsx(
          'flex flex-col md:flex-row md:items-center justify-between gap-4 px-4 py-4 border-b border-lightGray',
          enabled ? 'bg-[#e6f6f1]' : 'bg-[#fef6e7]'
        )}
      >
        <div className='flex items-start gap-3'>
          <span className={clsx('mt-1', enabled ? 'text-emerald-600' : 'text-yellow-600')}>◎</span>
          <div>
            <div className='text-lg font-semibold text-neutralBlack'>{title}</div>
            <div className='text-sm text-textColor mt-1'>{description}</div>
          </div>
        </div>
        <When isTrue={!practice_lab_profile}>
          <Switch
            checked={enabled}
            onChange={(checked) => onToggle?.(checked)}
            style={{
              backgroundColor: enabled ? '#16a34a' : '#d1d5db',
            }}
          />
        </When>
      </div>

      <div className='px-4 py-4 space-y-2'>
        <div className='text-sm font-medium text-textColor'>
          {enabled ? 'Benefits' : 'Unavailable features'}
        </div>
        <ul className='space-y-2'>
          {(enabled ? benefits : unavailableFeatures).map((feature) => (
            <li
              key={feature.label}
              className='flex items-start gap-3 text-sm text-neutralBlack leading-relaxed'
            >
              <span
                className={clsx(
                  'flex items-center justify-center w-5 h-5 mt-0.5',
                  enabled ? 'text-emerald-600' : 'text-yellow-600'
                )}
              >
                {enabled ? <FiCheck size={18} color='#00b383' /> : '✕'}
              </span>
              <span>{feature.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default TrackingStatusCard
