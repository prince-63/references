import InfoIcon from 'assets/icons/InfoIcon'
import When from 'components/when/When'
import {ReactNode} from 'react'
import hasValue from 'utils/hasValue'
import cn from '@utils/cn'
import clsx from 'clsx'
import getColorPalette from 'utils/getColorPalette'

const JustifiedBetweenDetails = ({
  label,
  value,
  className = 'text-base',
  classNameLabel,
  valueClassName = 'md:text-textColor md:font-normal text-black font-semibold',
  showToPatients = false,
}: {
  label: string
  value?: ReactNode
  className?: string
  classNameLabel?: string
  valueClassName?: string
  showToPatients?: boolean
}) => {
  return (
    <div
      className={cn(
        'flex flex-col md:flex-row md:justify-between text-textColor w-full gap-2',
        className
      )}
    >
      <p className={clsx('font-medium ', classNameLabel)}>
        {label}
        <When isTrue={showToPatients}>
          <div className='flex gap-1 items-start  text-lg text-textColor'>
            <div className='md:mt-[3px] mt-2'>
              <InfoIcon color={getColorPalette().secondaryColor} width='16' height='16' />
            </div>
            <div className='md:mt-0 mt-1 text-sm text-secondaryColor'> Showing to patient</div>
          </div>
        </When>
      </p>
      <div
        className={`${
          hasValue(value)
            ? cn('text-black font-semibold break-words ', valueClassName)
            : valueClassName
        }`}
      >
        {hasValue(value) ? value : 'Not Added'}
      </div>
    </div>
  )
}

export default JustifiedBetweenDetails
