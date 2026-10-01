import clsx from 'clsx'
import {Feature} from '@constants/treatmentSelectionList'
import When from 'components/when/When'
import BackGroundSVG from 'components/atom/SVG/BackGroundSVG'
interface props {
  onOptionChange: (option: Feature) => void
  options: Feature[]
  className?: string
}
export const AppointmentActionsCard = (props: props) => {
  const {onOptionChange, options} = props
  return (
    <div className='w-full'>
      {/* for Web */}
      <div className='w-full md:w-fit md:flex md:order-1 hidden gap-4'>
        {options.map((option: Feature, index) => (
          <div
            key={index}
            className={clsx(
              option.active
                ? 'bg-primarySupport text-primaryColor border border-primaryColor p-4'
                : 'bg-white text-textColor border border-mediumGray p-4',
              'flex flex-col justify-between w-[249px] h-[180px] p-2.5 rounded-2xl font-medium text-xs cursor-pointer',
              option.className
            )}
            onClick={() => onOptionChange(option)}
          >
            <div className='flex justify-between items-center mt-[10px]'>
              <BackGroundSVG
                width={option.iconWidth}
                height={option.iconHeight}
                color='transparent'
                svg={option.active ? option.icon : option.iconDisabled}
                className={clsx(
                  'w-[57px] h-[57px] rounded-full',
                  option.active ? 'bg-white' : 'bg-lightGray',
                  option.iconStyle
                )}
              />

              <When isTrue={option.showComingSoon}>
                <div className='w-auto h-5 px-1.5 py-1 bg-secondarySupport rounded-2xl flex items-center'>
                  <div className='text-secondaryColor text-xs font-semibold'>Coming soon</div>
                </div>
              </When>
            </div>

            <div>
              <div className='text-black text-xl font-semibold leading-7'>{option.title}</div>

              <div className=' text-textColor font-base text-[14px] mt-2  leading-tight'>
                {option.subTitle}
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* for Mobile */}
      <div className='md:hidden'>
        {options.map((option, index) => (
          <div
            key={index}
            className={clsx(
              option.active
                ? 'bg-primarySupport text-primaryColor border border-primaryColor'
                : 'bg-white text-textColor border border-mediumGray',
              'p-2.5 font-medium text-xs mt-4 rounded-lg',
              option.className
            )}
            onClick={() => onOptionChange(option)}
          >
            <div className='w-full min-h-16 flex gap-2 justify-start items-center pl-3'>
              <BackGroundSVG
                width={option.iconWidth}
                height={option.iconHeight}
                color='transparent'
                svg={option.active ? option.icon : option.iconDisabled}
                className={clsx(
                  'w-[57px] h-[57px] rounded-full',
                  option.active ? 'bg-white' : 'bg-lightGray',
                  option.iconStyle
                )}
              />
              <div className='w-full h-auto'>
                <div className='w-full flex justify-between items-center '>
                  <div className='w-auto text-black text-base font-semibold'>{option.title}</div>
                  <When isTrue={option.showComingSoon}>
                    <div className='w-auto h-5 px-1.5 py-1 bg-secondarySupport rounded-2xl flex items-center mr-3'>
                      <div className='text-secondaryColor text-xs font-semibold'>Coming soon</div>
                    </div>
                  </When>
                </div>
                <div className='w-full text-textColor text-sm font-medium pe-2'>
                  {option.subTitle}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
