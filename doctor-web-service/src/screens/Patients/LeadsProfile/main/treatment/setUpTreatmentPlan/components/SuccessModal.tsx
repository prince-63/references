import clsx from 'clsx'
import AntdButton from 'components/atom/Buttons/AntdButton'
import CommonSVG from 'components/atom/SVG/CommonSVG'
import ModalLayout from 'components/modal/ModalLayout'
import When from 'components/when/When'
import {ReactNode} from 'react'
import {IMAGE_SETUP_TREATMENT_PLAN} from 'utils/ImageConst'
import {SVG_CROSS} from 'utils/SvgConstants'
import hasValue from 'utils/hasValue'

const SuccessModal = ({
  title,
  subTitle,
  onClickOk,
  onClickCancel,
  okButtonText,
  cancelButtonText,
  imageWidth = 'w-[205px]',
  info,
  closable = false,
  onClose,
  showCancel = true,
  isResponsive = false,
}: {
  title: string
  subTitle?: string
  onClickOk: () => void
  onClickCancel?: () => void
  okButtonText: string
  cancelButtonText?: string
  imageWidth?: string
  info?: ReactNode
  closable?: boolean
  onClose?: (x: boolean) => void
  showCancel?: boolean
  isResponsive?: boolean
}) => {
  return (
    <div>
      <ModalLayout className='md:w-[31rem]' isResponsive={isResponsive}>
        {closable && (
          <div
            className='cursor-pointer flex justify-end'
            onClick={() => {
              onClose && onClose(false)
            }}
          >
            <CommonSVG svg={SVG_CROSS} width='47' height='47' />
          </div>
        )}
        <div className='flex flex-col gap-6'>
          <div className='flex justify-center'>
            <img className={imageWidth} src={IMAGE_SETUP_TREATMENT_PLAN} />
          </div>
          <div className='text-center flex flex-col gap-1'>
            <p className='font-semibold text-2xl text-black'>{title}</p>
            <When isTrue={hasValue(subTitle)}>
              <p className='text-textColor text-base'>{subTitle}</p>
            </When>
          </div>
          <When isTrue={hasValue(info)}>{info}</When>

          <div
            className={clsx(
              'flex gap-3 md:gap-2',
              isResponsive ? 'flex-row' : 'flex-col-reverse md:flex-row'
            )}
          >
            {showCancel && (
              <button
                className='bg-white text-primaryColor border border-primaryColor h-14 font-semibold text-base w-full rounded'
                type='button'
                onClick={onClickCancel}
              >
                {cancelButtonText}
              </button>
            )}
            <AntdButton
              className='bg-primaryColor text-white h-14 font-semibold text-base w-full'
              isLoading={false}
              text={okButtonText}
              onClick={onClickOk}
              disabled={false}
            />
          </div>
        </div>
      </ModalLayout>
    </div>
  )
}

export default SuccessModal
