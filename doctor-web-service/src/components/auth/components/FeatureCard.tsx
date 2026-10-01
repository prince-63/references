import CommonSVG from 'components/atom/SVG/CommonSVG'
import BackGroundSVG from '../../atom/SVG/BackGroundSVG'
import When from '../../when/When'
import {SVG_CORRECT_PRIMARY} from 'utils/SvgConstants'
import clsx from 'clsx'
interface props {
  active: boolean
  icon: any
  iconDisabled: any
  iconStyle?: string
  title?: string
  subTitle?: string
  showComingSoon: boolean
  iconHeight: string
  iconWidth: string
}
export const FeatureCard = (props: props) => {
  const {
    active,
    icon,
    iconDisabled,
    iconHeight,
    iconWidth,
    iconStyle,
    title,
    subTitle,
    showComingSoon,
  } = props
  return (
    <div className='w-full'>
      {/* for web */}
      <div className='w-full  md:w-fit md:flex md:order-1 hidden '>
        <When isTrue={showComingSoon}>
          <div className='relative'>
            <div className='absolute left-72 top-[-12px] mr-4 w-24 h-7 px-1.5 py-1 bg-primarySupport rounded-lg flex items-center justify-center '>
              <div className='text-primaryColor text-xs font-semibold'>Coming soon</div>
            </div>
          </div>
        </When>
        <div
          className={clsx(
            'flex items-center gap-2 w-[405px] h-[95px] rounded-[8px] shadow-second p-3 border ',
            active ? 'bg-primarySupport border-primaryColor' : 'bg-white border-grayDisabled',
            showComingSoon && 'border-mediumGray '
          )}
        >
          <div className='flex items-center mt-[10px]'>
            <BackGroundSVG
              width={iconWidth}
              height={iconHeight}
              color='red'
              svg={active ? icon : iconDisabled}
              className={clsx(
                'rounded-full w-[57px] h-[57px] ',
                active ? 'bg-white' : 'bg-lightGray',
                showComingSoon && 'opacity-50',
                iconStyle
              )}
            />
          </div>

          <div className=''>
            <div
              className={clsx(
                'text-black text-[18px] font-bold leading-none',
                showComingSoon && 'text-mediumGray'
              )}
            >
              {title}
            </div>

            <div
              className={clsx(
                'font-medium text-[14px] mt-2  leading-tight',
                showComingSoon ? 'text-mediumGray' : 'text-textColor '
              )}
            >
              {subTitle}
            </div>
          </div>
          <When isTrue={!showComingSoon}>
            <When isTrue={!active}>
              <div className='min-w-[22px] h-[22px] border border-textColor rounded-full'></div>
            </When>
            <When isTrue={active}>
              <div className='min-w-[22px] h-[22px] border border-primaryColor rounded-full flex items-center justify-center'>
                <CommonSVG svg={SVG_CORRECT_PRIMARY} width='11px' height='8px' />
              </div>
            </When>
          </When>
        </div>
      </div>

      {/* for Mobile */}
      <div className='md:hidden relative'>
        <When isTrue={showComingSoon}>
          <div className='absolute right-0 top-[-12px] mr-4 w-auto h-7 px-1.5 py-1 bg-primarySupport rounded-lg flex items-center '>
            <div className='text-primaryColor text-xs font-semibold'>Coming soon</div>
          </div>
        </When>
        <div
          className={clsx(
            'w-full flex flex-col mt-4 justify-start items-center min-h-[95px] rounded-lg border',
            active ? 'bg-primarySupport border-primaryColor' : 'bg-white border-grayDisabled',
            showComingSoon && 'border-mediumGray'
          )}
        >
          <div className='w-full min-h-[95px]  flex gap-2 justify-start items-center p-3'>
            <BackGroundSVG
              width='20'
              height='20'
              svg={active ? icon : iconDisabled}
              className={clsx('max-w-10 max-h-10 ', showComingSoon && 'opacity-50', iconStyle)}
            />
            <div className='w-full'>
              <div
                className={clsx(
                  'w-auto text-black text-base font-semibold',
                  showComingSoon && 'text-mediumGray'
                )}
              >
                {title}
              </div>
              <div
                className={clsx(
                  'w-full text-sm font-medium pe-2',
                  showComingSoon ? 'text-mediumGray' : 'text-textColor '
                )}
              >
                {subTitle}
              </div>
            </div>
            <When isTrue={!active}>
              <div
                className={clsx(
                  'min-w-[22px] h-[22px] border border-textColor rounded-full',
                  showComingSoon && 'border-transparent'
                )}
              ></div>
            </When>
            <When isTrue={active}>
              <div className='min-w-[22px] h-[22px] border border-primaryColor rounded-full flex items-center justify-center'>
                <CommonSVG svg={SVG_CORRECT_PRIMARY} width='11px' height='8px' />
              </div>
            </When>
          </div>
        </div>
      </div>
    </div>
  )
}
