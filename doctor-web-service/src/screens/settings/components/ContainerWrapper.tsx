import clsx from 'clsx'
import AntdButton from 'components/atom/Buttons/AntdButton'
import EditButton from 'components/atom/Buttons/EditButton'
import React from 'react'

const ContainerWrapper = ({
  title,
  subTitle,
  children,
  onClickEdit,
  isEditClicked,
  onClickCancel,
  isSubmitting,
  onClickSave,
  buttonText,
  onClickButton,
  extraButtonDisable,
  showEditButton,

  // Custom styles (optional)
  containerClassName,
  headerClassName,
  titleClassName,
  subTitleClassName,
  buttonWrapperClassName,
  borderClassName,
  childrenWrapperClassName,
  showButton,
}: {
  title: string
  subTitle?: string
  children: React.ReactNode
  onClickEdit?: () => void
  onClickCancel?: () => void
  isEditClicked?: boolean
  onClickSave?: () => void
  onClickButton?: () => void
  isSubmitting?: boolean
  buttonText?: string
  extraButtonDisable?: boolean
  containerClassName?: string
  headerClassName?: string
  titleClassName?: string
  subTitleClassName?: string
  buttonWrapperClassName?: string
  borderClassName?: string
  childrenWrapperClassName?: string
  showEditButton?: boolean
  showButton?: boolean
}) => {
  return (
    <div className={clsx('flex flex-col gap-3', containerClassName)}>
      <div className={clsx('flex flex-col gap-2', headerClassName)}>
        <div>
          <div className='flex justify-between'>
            <div className={clsx('font-semibold text-lg', titleClassName)}>{title}</div>
            {onClickEdit && !isEditClicked && (showEditButton === undefined || showEditButton) && (
              <EditButton
                onClick={onClickEdit}
                className='flex gap-2 items-center w-fit text-textColor text-base font-semibold px-2 py-1'
              >
                {'Edit'}
              </EditButton>
            )}
            {isEditClicked && onClickCancel && onClickSave && (
              <div className={clsx('flex gap-3', buttonWrapperClassName)}>
                <button
                  className='flex gap-2 items-center w-fit text-textColor text-base font-semibold px-2 py-1'
                  type='button'
                  onClick={onClickCancel}
                >
                  Cancel
                </button>
                <AntdButton
                  text={'Save'}
                  htmlType='submit'
                  className='text-base bg-primarySupport border border-primaryColor text-primaryColor hover:!bg-primarySupport hover:!text-primaryColor font-semibold'
                  onClick={onClickSave}
                  loading={isSubmitting}
                  disabled={isSubmitting}
                />
              </div>
            )}
            {onClickButton && buttonText && showButton && (
              <AntdButton
                text={buttonText}
                htmlType='submit'
                className={clsx(
                  'text-base bg-primarySupport font-semibold',
                  extraButtonDisable
                    ? 'border border-mediumGray text-mediumGray hover:!bg-lightGray hover:!text-mediumGray'
                    : 'border border-primaryColor text-primaryColor hover:!bg-primarySupport hover:!text-primaryColor'
                )}
                onClick={onClickButton}
                loading={isSubmitting}
                disabled={isSubmitting || extraButtonDisable}
              />
            )}
          </div>
          {subTitle && (
            <div className={clsx('text-sm text-textColor', subTitleClassName)}>{subTitle}</div>
          )}
        </div>
        <div className={clsx('w-full border border-mediumGray', borderClassName)} />
      </div>
      <div className={clsx(childrenWrapperClassName)}>{children}</div>
    </div>
  )
}

export default ContainerWrapper
