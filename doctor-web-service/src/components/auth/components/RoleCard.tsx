import clsx from 'clsx'
import BackGroundSVG from '../../atom/SVG/BackGroundSVG'
import When from '../../when/When'
import {Feature} from '@constants/treatmentSelectionList'
import {FaCheckCircle} from 'react-icons/fa'
interface props {
  onOptionChange: (option: Feature) => void
  options: Feature[]
  className?: string
}
export const RoleCard = (props: props) => {
  const {onOptionChange, options} = props
  return (
    <div className='w-full'>
      {/* for Web */}
      <div className='w-full md:w-fit md:flex hidden gap-4'>
        {options.map((option: Feature, index) => (
          <div
            key={index}
            className={clsx(
              option.active
                ? 'bg-primarySupport text-primaryColor border border-primaryColor'
                : 'bg-white text-textColor border border-mediumGray',
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

            <div className='mb-2'>
              <div className='text-black text-[24px] font-bold leading-none'>{option.title}</div>

              <div className=' text-textColor font-medium text-[14px] mt-2  leading-tight'>
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
                ? ' text-primaryColor border-2 border-primaryColor'
                : 'bg-white text-textColor border border-mediumGray',
              'p-4 font-medium text-xs mt-4 rounded-lg w-full h-fit flex items-center justify-between',
              option.className
            )}
            onClick={() => onOptionChange(option)}
          >
            <div className='w-full flex gap-2 justify-start items-center'>
              <BackGroundSVG
                width='50%'
                height='40%'
                svg={option.active ? option.icon : option.iconDisabled}
                className={clsx(
                  'w-[40px] h-[40px] rounded-full',
                  option.active ? 'border border-lightGray' : 'bg-lightGray',
                  option.iconStyle
                )}
              />
              <div className='w-full'>
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
            <When isTrue={option.title !== 'Implants'}>
              <FaCheckCircle fontSize={20} />
            </When>
          </div>
        ))}
      </div>
    </div>
  )
}
