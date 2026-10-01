import {Drawer, Modal} from 'antd'
import {DrawerProps} from 'antd/lib'
import CrossIcon from 'assets/icons/CrossIcon'
import clsx from 'clsx'
import React from 'react'
import {useMediaQuery} from 'react-responsive'

interface ModalCardProps extends DrawerProps {
  subTitle?: React.ReactNode
  title: string
  subTitleClassName?: string
  className?: string
  open: boolean
  showCrossButton: boolean
  showFooter?: boolean
  HeaderIcon?: React.ReactNode
  cancelText?: string
  okText: string
  classNameTitle?: string
  classNameFooter?: string
  drawerHeight?: string
  onClick: () => void
  onClose?: () => void
  onCloseFromCrossButton?: () => void
  children?: React.ReactNode
  classNameForCancelButton?: string
  classNameForOkButton?: string
  width?: string
  classNameForBox?: string
}

const ModalCard = ({
  subTitle,
  title,
  open,
  subTitleClassName,
  className,
  showCrossButton,
  HeaderIcon,
  cancelText,
  okText,
  onClick,
  onClose,
  onCloseFromCrossButton,
  children,
  classNameTitle,
  classNameFooter,
  drawerHeight,
  showFooter,
  classNameForCancelButton,
  classNameForOkButton,
  classNameForBox,
  width,
  ...props
}: ModalCardProps) => {
  const isMobile = useMediaQuery({query: '(max-width: 768px)'})

  return (
    <>
      {/* Web Modal */}
      <Modal
        closable={showCrossButton}
        destroyOnClose={true}
        open={open && !isMobile}
        className={clsx('md:w-[566px] w-full', className)}
        maskClosable={showCrossButton}
        closeIcon={showCrossButton}
        onCancel={onCloseFromCrossButton || onClose}
        width={width}
        footer={
          showFooter ? (
            <div className={clsx('flex gap-2 mt-2', classNameFooter)}>
              {cancelText && (
                <button
                  className={clsx(
                    classNameForCancelButton,
                    'w-full text-textColor border border-mediumGray py-3 px-6 rounded-lg'
                  )}
                  type='button'
                  onClick={onClose}
                >
                  {cancelText}
                </button>
              )}
              <button
                className={clsx(
                  classNameForOkButton,
                  'w-full text-white bg-primaryColor py-3 px-6 rounded-lg'
                )}
                type='button'
                onClick={onClick}
              >
                {okText}
              </button>
            </div>
          ) : (
            ''
          )
        }
      >
        <div className={clsx('flex flex-col gap-3', classNameForBox)}>
          {HeaderIcon && HeaderIcon}
          <div>
            {title && (
              <div className={clsx('text-2xl font-semibold ', classNameTitle)}>{title}</div>
            )}
            {subTitle && (
              <div className={clsx('text-base text-textColor ', subTitleClassName)}>{subTitle}</div>
            )}
          </div>
        </div>
        {children}
      </Modal>
      {/* Mobile Drawer */}
      <Drawer
        open={open && isMobile}
        rootStyle={{fontFamily: 'figtree'}}
        height={drawerHeight || '30%'}
        placement='bottom'
        className='rounded-t-xl'
        extra={
          showCrossButton && (
            <div className='cursor-pointer h-full' onClick={onCloseFromCrossButton || onClose}>
              <CrossIcon />
            </div>
          )
        }
        {...props}
      >
        <div className='flex flex-col gap-3'>
          {HeaderIcon && HeaderIcon}
          <div>
            <div>
              <div className='flex justify-between items-center'>
                {title && (
                  <div className={clsx('text-2xl font-semibold', classNameTitle)}>{title}</div>
                )}
                <div className='cursor-pointer h-full' onClick={onCloseFromCrossButton || onClose}>
                  <CrossIcon color='#666' />
                </div>
              </div>
              {subTitle && (
                <div className={clsx('text-base text-textColor ', subTitleClassName)}>
                  {subTitle}
                </div>
              )}
            </div>
          </div>
        </div>
        {children}
        {showFooter && (
          <div className={clsx('flex gap-2 mt-2', classNameFooter)}>
            {onClose && (
              <button
                className='w-full text-textColor border border-mediumGray py-3 px-6 rounded-lg'
                type='button'
                onClick={onClose}
              >
                {cancelText}
              </button>
            )}
            <button
              className='w-full text-white bg-primaryColor py-3 px-6 rounded-lg'
              type='button'
              onClick={onClick}
            >
              {okText}
            </button>
          </div>
        )}
      </Drawer>
    </>
  )
}

export default ModalCard
