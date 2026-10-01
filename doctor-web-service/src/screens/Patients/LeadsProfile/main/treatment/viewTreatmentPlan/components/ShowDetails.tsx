import InfoIcon from 'assets/icons/InfoIcon'
import When from 'components/when/When'
import {ReactNode} from 'react'
import hasValue from 'utils/hasValue'
import cn from '@utils/cn'
import clsx from 'clsx'
import getColorPalette from 'utils/getColorPalette'

const ShowDetails = ({
  label,
  value,
  className = 'text-base',
  classNameLabel,
  showToPatients = false,
  valueClassName,
}: {
  label: string
  value?: ReactNode
  className?: string
  classNameLabel?: string
  showToPatients?: boolean
  valueClassName?: string
}) => {
  return (
    <div className={cn('flex flex-col text-textColor', className)}>
      <div className={clsx('font-medium text-sm', classNameLabel)}>{label}</div>
      <When isTrue={showToPatients}>
        <div className='flex gap-1 items-start  text-lg text-textColor'>
          <div className='md:mt-[3px] mt-2'>
            <InfoIcon color={getColorPalette().secondaryColor} width='16' height='16' />
          </div>
          <div className='md:mt-0 mt-1 text-sm text-secondaryColor'> Showing to patient</div>
        </div>
      </When>
      <div
        className={clsx(
          'flex items-start break-words justify-start ',
          hasValue(value) ? 'text-black font-medium ' : 'font-medium text-textColor',
          valueClassName
        )}
      >
        {hasValue(value) ? value : 'Not Added'}
      </div>
    </div>
  )
}

export default ShowDetails
