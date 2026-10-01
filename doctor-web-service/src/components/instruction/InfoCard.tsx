import useDispatchAction from '@hooks/useDispatchAction'
import cn from '@utils/cn'
import CaretRightIcon from 'assets/icons/CaretRightIcon'
import InfoIcon from 'assets/icons/InfoIcon'
import When from 'components/when/When'
import {ReactNode} from 'react'
import {setOpenConfirmShippedModal} from 'redux/Slices/AppSlice/LeadsProfile/GettingStartedOverview/GettingStartedOverview.slice'

const InfoCard = ({
  title,
  subTitle = null,
  color = '#735bf2',
  className,
  buttonText,
  onClick,
  onSecondaryClick,
  classNameButton,
  hideIcon,
  Icon = <InfoIcon color={color} />,
  secondaryButtonText,
  classNameSecondaryButton,
  iconColor = 'white',
  contentClassName,
}: {
  title: string
  subTitle?: string | null
  color?: string
  className?: string
  buttonText?: string
  onClick?: () => void
  onSecondaryClick?: () => void
  classNameButton?: string
  Icon?: ReactNode
  hideIcon?: boolean
  secondaryButtonText?: string
  classNameSecondaryButton?: string
  iconColor?: string
  contentClassName?: string
}) => {
  const {dispatchAction} = useDispatchAction()
  return (
    <div
      className={cn(
        'bg-primarySupport border border-primaryColor p-4 flex flex-col md:flex-row gap-3 md:items-center items-start justify-between rounded-lg',
        className
      )}
    >
      <div className={cn('flex gap-3 md:items-center items-start', contentClassName)}>
        {Icon}
        <div>
          <div className='font-semibold'>{title}</div>
          {subTitle && (
            <div className='font-medium text-textColor text-sm leading-tight line-clamp-2 mt-1'>
              {subTitle}
            </div>
          )}
        </div>
      </div>
      {buttonText && (
        <div className='flex gap-2 items-center'>
          {buttonText === 'Ship order' && (
            <button
              className={cn(
                'text-secondaryColor bg-secondarySupport border border-secondaryColor px-3 py-2 rounded-lg font-semibold',
                classNameButton
              )}
              onClick={() => dispatchAction(setOpenConfirmShippedModal(true))}
            >
              <div>Already delivered?</div>
            </button>
          )}

          {!!secondaryButtonText && (
            <button
              className={cn(
                'text-secondaryColor bg-secondarySupport border border-secondaryColor px-3 py-2 rounded-lg font-semi',
                classNameSecondaryButton
              )}
              onClick={onSecondaryClick}
            >
              <div>{secondaryButtonText}</div>
            </button>
          )}

          <button
            className={cn(
              'bg-primaryColor text-white py-2 px-4 flex items-center gap-2 rounded-lg font-semibold',
              classNameButton
            )}
            onClick={onClick}
          >
            <div>{buttonText}</div>
            <When isTrue={!hideIcon}>
              <CaretRightIcon color={iconColor} />
            </When>
          </button>
        </div>
      )}
    </div>
  )
}

export default InfoCard
