// components/formWrapper/DivWrapper.tsx
import React, {useLayoutEffect, useRef, useState} from 'react'
import AntdButton from 'components/atom/Buttons/AntdButton'
import leftArrow from '../../assets/icons/iconArrowLeft.svg'
import {useNavigate as useCustomNavigate} from 'context/CustomNavigationContext'
import {useSearchParams} from 'react-router-dom'

type DivWrapperProps = {
  title: string
  subTitle?: string
  children: React.ReactNode
  onClickCancel?: () => void
  onClickSave?: () => void
  buttonText?: string
  isDisabled?: boolean
  isSubmitting?: boolean
  showBackButton?: boolean
  onClickBack?: () => void
  showFooterBackButton?: boolean
  backButtonText?: string
}

/**
 * ✅ Features:
 * - Fixed footer that exactly matches the container width
 * - Scrollable content area with auto-calculated height
 * - Works inside any layout (no need to modify MainLayout)
 */
const DivWrapper: React.FC<DivWrapperProps> = ({
  title,
  subTitle,
  children,
  onClickCancel,
  onClickSave,
  buttonText,
  isDisabled = false,
  isSubmitting = false,
  showBackButton = false,
  onClickBack,
  showFooterBackButton = false,
  backButtonText = 'Back',
}) => {
  const [searchParams] = useSearchParams()
  const isEdit = searchParams.get('edit') === 'true'
  const {navigate} = useCustomNavigate()

  const containerRef = useRef<HTMLDivElement | null>(null)
  const bodyRef = useRef<HTMLDivElement | null>(null)
  const footerInnerRef = useRef<HTMLDivElement | null>(null)

  const [footerBox, setFooterBox] = useState<{
    left: number
    right: number
    height: number
  }>({
    left: 0,
    right: 0,
    height: 0,
  })

  // Recalculate layout to align footer and scrollable body
  const recalc = () => {
    const el = containerRef.current
    const body = bodyRef.current
    const footerInner = footerInnerRef.current
    if (!el || !body || !footerInner) return

    const r = el.getBoundingClientRect()
    const footerH = footerInner.getBoundingClientRect().height || 0

    // align footer to container width
    setFooterBox({
      left: r.left + window.scrollX,
      right: Math.max(0, window.innerWidth - (r.right + window.scrollX)),
      height: footerH,
    })

    // make body scrollable and auto-fit viewport height
    const available = Math.max(0, window.innerHeight - r.top - footerH)
    body.style.maxHeight = `${available}px`
    body.style.overflow = 'auto'
    body.style.paddingBottom = '8px'
  }

  useLayoutEffect(() => {
    recalc()
    const ro = new ResizeObserver(recalc)
    if (containerRef.current) ro.observe(containerRef.current)
    if (footerInnerRef.current) ro.observe(footerInnerRef.current)
    window.addEventListener('resize', recalc)
    window.addEventListener('scroll', recalc, {passive: true})
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', recalc)
      window.removeEventListener('scroll', recalc)
    }
  }, [])

  return (
    <div ref={containerRef} className='bg-white border border-gray-200 box-border max-w-full'>
      {/* Header */}
      <div className='p-4 pb-2'>
        <div className='flex items-start gap-2'>
          {showBackButton && (
            <button
              type='button'
              onClick={() => (onClickBack ? onClickBack() : navigate(-1 as unknown as any))}
              className='rounded-full bg-lightGray w-8 h-8 flex items-center justify-center'
            >
              <img src={leftArrow} alt='' width={16} />
            </button>
          )}
          <div>
            <div className='font-semibold text-2xl'>{title}</div>
            {subTitle && <div className='text-base text-textColor'>{subTitle}</div>}
          </div>
        </div>
      </div>

      {/* Body (scrollable section) */}
      <div ref={bodyRef} className='px-4'>
        {children}
      </div>

      {/* Fixed Footer aligned to container width */}
      <div
        className='p-4 z-30 bg-white border-t border-mediumGray'
        style={{
          position: 'fixed',
          bottom: 0,
          left: `${footerBox.left}px`,
          right: `${footerBox.right}px`,
        }}
      >
        <div ref={footerInnerRef}>
          <div className='w-full flex gap-2 justify-end items-center me-4'>
            {(onClickCancel || onClickSave) && (
              <div className='flex flex-wrap gap-3 pt-6 pb-28 px-4'>
                {onClickCancel && (
                  <button
                    className='flex gap-2 items-center w-fit text-textColor border border-mediumGray text-base font-semibold px-4 py-3 rounded-lg'
                    type='button'
                    onClick={onClickCancel}
                  >
                    Cancel
                  </button>
                )}

                {showFooterBackButton && onClickBack && (
                  <button
                    className='flex gap-2 items-center w-fit text-textColor border border-mediumGray text-base font-semibold px-4 py-3 rounded-lg'
                    type='button'
                    onClick={onClickBack}
                  >
                    {backButtonText}
                  </button>
                )}

                <AntdButton
                  text={isEdit ? 'Save changes' : buttonText || 'Verify and add'}
                  htmlType='button'
                  className='md:w-fit w-full text-base bg-primaryColor text-white hover:!bg-primarySupport hover:!text-primaryColor font-semibold px-6 py-3 min-h-12'
                  onClick={onClickSave}
                  loading={isSubmitting}
                  disabled={isSubmitting || isDisabled}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DivWrapper
