import SubscriptionIcon from 'assets/icons/SubscriptionIcon'
import ModalLayout from 'components/modal/ModalLayout'
import CloseIcon from 'assets/icons/CloseIcon'
import AntdButton from 'components/atom/Buttons/AntdButton'
import clsx from 'clsx'
import {ReactNode} from 'react'

const SubscriptionInfoModal = ({
  title,
  subTitle,
  featuresList,
  featuresHeader,
  iconClassName,
  iconColor,
  onClick,
  HeaderIcon = SubscriptionIcon,
  onClose,
  footerInfo,
  buttonText,
  buttonClassName,
}: {
  title: string
  subTitle: string
  buttonText: string
  onClick: () => void
  onClose: () => void
  featuresHeader: string
  buttonClassName?: string
  iconColor?: string
  featuresList: {icon: React.FC; title: ReactNode}[]
  iconClassName?: string
  showRequestForExtension?: boolean
  onClickRequestForExtension?: () => void
  HeaderIcon?: React.FC<any>
  footerInfo?: string
}) => {
  return (
    <ModalLayout className='md:w-[566px] !rounded-xl' isResponsive={true}>
      <div className='w-full'>
        <div className='flex justify-between items-start mb-4'>
          <div
            className={clsx(
              'w-12 h-12 bg-primarySupport rounded-full flex justify-center items-center',
              iconClassName
            )}
          >
            <HeaderIcon color={iconColor} />
          </div>
          <div className='cursor-pointer' onClick={onClose}>
            <CloseIcon />
          </div>
        </div>
        <div className='max-h-[75vh] flex flex-col gap-4  overflow-scroll'>
          <div>
            <p className='font-semibold text-2xl '>{title}</p>
            <p className=' text-textColor text-base font-normal'>{subTitle}</p>
          </div>
          <div className='flex flex-col gap-3'>
            <p className='font-medium text-base text-textColor'>{featuresHeader}</p>
            <div className='flex flex-col gap-3'>
              {featuresList.map((feature, index) => {
                const Icon = feature.icon
                return (
                  <div key={index} className='flex gap-3 text-sm'>
                    <Icon />
                    <p>{feature.title}</p>
                  </div>
                )
              })}
            </div>
            <p className='font-normal text-base text-textColor'>{footerInfo}</p>
          </div>
          <div className='flex gap-6  items-center'>
            <AntdButton
              className={clsx(
                'w-full bg-primaryColor text-white font-semibold text-base hover:!text-white hover:!bg-primaryColor h-12',
                buttonClassName
              )}
              onClick={onClick}
              text={buttonText}
            />
          </div>
        </div>
      </div>
    </ModalLayout>
  )
}

export default SubscriptionInfoModal
