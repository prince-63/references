import cn from '@utils/cn'
import InfoIcon from 'assets/icons/InfoIcon'
import RightArrowIcon from 'assets/icons/RightArrowIcon'
import When from 'components/when/When'
import {ReactNode} from 'react'
import {IconProps} from 'types/IconProps'
import hasValue from 'utils/hasValue'

const InfoCard = ({
  title,
  content,
  showButton = true,
  titleClassName = 'font-semibold',
  onClick,
  className = 'bg-[#F5F4FE] ',
  infoIconColor = '#735BF2',
  buttonText,
  iconColor,
  infoIconClassName = 'items-center',
  buttonClassName,
  Icon = InfoIcon,
  showArrowIcon = true,
  ButtonIcon = RightArrowIcon,
  contentClassName,
}: {
  title?: string
  content?: ReactNode
  showButton?: boolean
  onClick?: () => void
  titleClassName?: string
  className?: string
  infoIconColor?: string
  buttonText?: React.ReactNode
  iconColor?: string
  buttonClassName?: string
  infoIconClassName?: string
  Icon?: React.FC<IconProps>
  ButtonIcon?: React.FC<IconProps>
  showArrowIcon?: boolean
  contentClassName?: string
}) => {
  return (
    <div
      className={cn(
        'flex flex-col md:flex-row p-4 rounded-lg w-full justify-between item-start gap-3 ',
        className
      )}
    >
      <div
        className={cn('flex gap-3 md:!items-center !items-start justify-start', infoIconClassName)}
      >
        <div className='min-w-7 '>
          <Icon color={infoIconColor} height='24' width='24' />
        </div>
        <div>
          <div className={cn('text-primaryColor text-[16px]', titleClassName)}>{title}</div>
          <When isTrue={hasValue(content)}>
            <div className={cn('text-textColor font-medium text-[14px]', contentClassName)}>
              {content}
            </div>
          </When>
        </div>
      </div>
      <When isTrue={showButton}>
        <div className='flex flex-col md:item-center md:justify-center items-start'>
          <button
            type='button'
            className={cn(
              ' ml-10 sm:ml-0 border border-primaryColor rounded-lg font-semibold px-3 py-1 text-primaryColor flex justify-between items-center gap-2 text-sm',
              buttonClassName
            )}
            onClick={onClick}
          >
            {buttonText}
            <When isTrue={showArrowIcon}>
              <ButtonIcon color={iconColor} />
            </When>
          </button>
        </div>
      </When>
    </div>
  )
}

export default InfoCard
