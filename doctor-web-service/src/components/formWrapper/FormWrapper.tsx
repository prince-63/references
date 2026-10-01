// components/formWrapper/FormWrapper.tsx
import React from 'react'
import {Layout} from 'antd'
import {Content, Footer} from 'antd/es/layout/layout'
import {useSearchParams} from 'react-router-dom'
import AntdButton from 'components/atom/Buttons/AntdButton'
import {useNavigate as useCustomNavigate} from 'context/CustomNavigationContext'
import leftArrow from '../../assets/icons/iconArrowLeft.svg'
import {useMediaQuery} from 'react-responsive'

type Props = {
  title: string
  subTitle?: string
  children: React.ReactNode
  onClickCancel?: () => void
  onClickSave?: () => void
  isSubmitting?: boolean
  buttonText?: string
  isDisabled?: boolean
  showBackButton?: boolean
  onClickBack?: () => void
  showFooterBackButton?: boolean
  backButtonText?: string
}

const FormWrapper = ({
  title,
  subTitle,
  children,
  onClickCancel,
  onClickSave,
  isSubmitting,
  buttonText,
  isDisabled = false,
  showBackButton = false,
  onClickBack,
  showFooterBackButton = false,
  backButtonText = 'Back',
}: Props) => {
  const [searchParams] = useSearchParams()
  const isEdit = searchParams.get('edit') === 'true'
  const {navigate} = useCustomNavigate()

  const isMobile = useMediaQuery({query: '(max-width: 768px)'})
  return (
    <Layout className='!h-screen flex flex-col'>
      <Content className='bg-white flex-1 overflow-hidden'>
        <div className='flex flex-col h-full min-h-0'>
          {/* Body with extra padding for mobile footer space */}
          <div className='flex-1 overflow-auto p-4 pb-[130px] md:pb-6'>
            <div className='flex flex-col gap-2 mb-4'>
              <div className='flex items-start gap-2'>
                {showBackButton && (
                  <button
                    type='button'
                    onClick={() => (onClickBack ? onClickBack() : navigate(-1 as unknown as any))}
                    className='rounded-full bg-lightGray w-8 h-8 flex items-center justify-center'
                    aria-label='Go back'
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

            {children}
          </div>
        </div>
      </Content>

      {/* SINGLE CTA Footer */}
      <Footer className='!p-0 bg-transparent md:bg-white md:static'>
        <div
          className={`
      fixed ${isMobile ? 'bottom-16' : 'bottom-0'} left-0 right-0 z-40 bg-white
      border-t border-mediumGray
      md:static
    `}
        >
          <div
            className='
              flex flex-col gap-3
              md:flex-row md:justify-end md:items-center
              px-4 py-4
            '
          >
            {/* Render only if at least one button exists */}
            {(onClickCancel || onClickSave) && (
              <>
                {onClickCancel && (
                  <button
                    type='button'
                    onClick={onClickCancel}
                    className='
                      w-full md:w-auto
                      flex items-center justify-center
                      text-textColor border border-mediumGray
                      text-base font-semibold px-4 py-3 rounded-lg
                    '
                  >
                    Cancel
                  </button>
                )}

                {showFooterBackButton && onClickBack && (
                  <button
                    type='button'
                    onClick={onClickBack}
                    className='
                      w-full md:w-auto
                      flex items-center justify-center
                      text-textColor border border-mediumGray
                      text-base font-semibold px-4 py-3 rounded-lg
                    '
                  >
                    {backButtonText}
                  </button>
                )}

                {onClickSave && (
                  <AntdButton
                    text={isEdit ? 'Save changes' : buttonText || 'Verify and add'}
                    htmlType='submit'
                    onClick={onClickSave}
                    loading={isSubmitting}
                    disabled={isSubmitting || isDisabled}
                    className='
                      w-full md:w-fit
                      text-base font-semibold
                      bg-primaryColor text-white
                      hover:!bg-primarySupport hover:!text-primaryColor
                      px-6 py-3 min-h-[48px]
                    '
                  />
                )}
              </>
            )}
          </div>
        </div>
      </Footer>
    </Layout>
  )
}

export default FormWrapper
