import ArrowLeft from 'assets/icons/ArrowLeft'
import clsx from 'clsx'
import AntdButton from 'components/atom/Buttons/AntdButton'
import React from 'react'
import {useNavigate} from 'react-router-dom'

const SectionContainer = ({
  title,
  subTitle,
  children,
  onClickSave,
  isSubmitting,
  buttonText = 'Save',
  extraButtonDisable,
  showSubmitButton,

  // Custom styles (optional)
  containerClassName,
  headerClassName,
  titleClassName,
  subTitleClassName,
  borderClassName,
  childrenWrapperClassName,
}: {
  title?: string
  subTitle?: React.ReactNode
  children: React.ReactNode
  onClickSave?: () => void
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
  showSubmitButton?: boolean
}) => {
  const navigate = useNavigate()
  return (
    <div className={clsx('flex flex-col gap-3', containerClassName)}>
      {/* --- Sticky header --- */}
      <div
        className={clsx(
          'sticky top-0 z-50 bg-transparent flex flex-col gap-2', // new classes
          headerClassName
        )}
      >
        <div className='flex flex-col gap-2'>
          <button
            onClick={() => navigate(-1)}
            className='flex gap-2 items-center justify-start font-semibold text-textColor'
          >
            <ArrowLeft />
            <p> Go back</p>
          </button>
          <div className={clsx('font-semibold text-lg', titleClassName)}>{title}</div>

          {subTitle && (
            <div className={clsx('text-sm text-textColor', subTitleClassName)}>{subTitle}</div>
          )}

          {showSubmitButton && onClickSave && (
            <AntdButton
              text={buttonText}
              htmlType='submit'
              className={clsx(
                'w-fit text-base font-semibold', // full‑width button
                extraButtonDisable
                  ? 'border border-mediumGray text-mediumGray bg-lightGray hover:!bg-lightGray hover:!text-mediumGray'
                  : 'border border-primaryColor bg-primaryColor'
              )}
              onClick={onClickSave}
              loading={isSubmitting}
              disabled={isSubmitting || extraButtonDisable}
            />
          )}
        </div>

        <div className={clsx('w-full border border-mediumGray', borderClassName)} />
      </div>

      {/* --- Content --- */}
      <div className={clsx(childrenWrapperClassName)}>{children}</div>
    </div>
  )
}

export default SectionContainer
