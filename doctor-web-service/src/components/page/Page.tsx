import React, {useEffect} from 'react'
import leftArrow from '../../assets/icons/iconArrowLeft.svg'
import When from 'components/when/When'
import hasValue from 'utils/hasValue'
import Spinner from 'components/spinner/Spinner'
import {useNavigate} from 'context/CustomNavigationContext'
import cn from '@utils/cn'
type PageProps = {
  title?: React.ReactNode
  children: React.ReactNode
  showBorder?: boolean
  extraHeader?: React.ReactNode
  headerClassName?: string
  containerClassName?: string // ✅ Add this
  loading?: boolean
  exitConfirmPredicate?: boolean
  loaderText?: string | null
} & (
  | {showBackButton?: false; backNavigationRoute?: never}
  | {showBackButton: true | boolean; backNavigationRoute: string}
)

const Page: React.FC<PageProps> = ({
  title = '',
  children,
  showBorder = false,
  extraHeader,
  loading = false,
  showBackButton,
  backNavigationRoute,
  exitConfirmPredicate = false,
  headerClassName = '',
  loaderText = '',
  containerClassName,
}) => {
  const {navigate, setShouldBlock} = useNavigate()
  useEffect(() => {
    if (exitConfirmPredicate) {
      setShouldBlock(true)
    } else {
      setShouldBlock(false)
    }
  }, [exitConfirmPredicate])

  return (
    <div className={cn('flex flex-col md:gap-3 gap-4 w-full', containerClassName)}>
      <When isTrue={hasValue(title) || showBackButton || hasValue(extraHeader)}>
        <div
          className={cn('w-full flex justify-between md:flex-row flex-col gap-2', headerClassName)}
        >
          <div className='flex gap-3 items-center'>
            <When isTrue={showBackButton}>
              <button
                type='button'
                onClick={() => {
                  navigate(String(backNavigationRoute))
                }}
                className='rounded-full bg-lightGray w-8 h-8 flex items-center justify-center '
              >
                <img src={leftArrow} alt='' width={16} />
              </button>
            </When>
            <When isTrue={hasValue(title)}>
              <div className='font-semibold text-xl text-neutralBlack'>{title}</div>
            </When>
          </div>
          <When isTrue={hasValue(extraHeader)}>{extraHeader}</When>
        </div>
      </When>
      <When isTrue={showBorder}>
        <div className='w-full border border-lightGray my-2 hidden md:block'></div>
      </When>

      {loading && (
        <div className='flex flex-col justify-center items-center gap-5 min-h-[40vh] w-full'>
          <Spinner loading />
          <span className='font-medium text-[14px] leading-[20px] tracking-[0.01em] text-center'>
            {loaderText}
          </span>
        </div>
      )}
      {!loading && children}
    </div>
  )
}
export default Page
