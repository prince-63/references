import {Switch} from 'antd'
import CheckRadioIcon from 'assets/icons/CheckRadioIcon'
import clsx from 'clsx'
import {FeatureCardProps} from './types'

const FeatureHeader = ({title, description, is_active, callChangeStatus}: FeatureCardProps) => {
  const backgroundColor = is_active ? 'bg-[#EBF8F4]' : 'bg-[#FDF1DE]'
  const iconColor = is_active ? '#00B383' : '#BE8901'
  const switchText = is_active ? `Disable ${title}` : `Enable ${title}`

  return (
    <div
      className={clsx(
        'flex flex-col sm:flex-row gap-4 sm:gap-6 justify-between items-start sm:items-center p-4',
        backgroundColor
      )}
    >
      <div className='flex gap-3 items-start sm:items-center'>
        <div className='flex-shrink-0 mt-1 sm:mt-0'>
          <CheckRadioIcon color={iconColor} aria-hidden='true' />
        </div>

        <div>
          <h3 className='font-semibold text-lg'>
            {title} {is_active ? 'Enabled' : 'Disabled'}
          </h3>
          <p className='text-sm opacity-90 mt-1'>{description}</p>
        </div>
      </div>

      <div className='flex items-center gap-3 self-stretch sm:self-auto bg-white px-4 py-1 border border-mediumGray rounded-lg'>
        <Switch
          size='small'
          checked={is_active}
          onChange={callChangeStatus}
          aria-label={`Toggle ${title}`}
        />

        <div className=' text-sm font-medium opacity-90'>{switchText}</div>
      </div>
    </div>
  )
}

export default FeatureHeader
