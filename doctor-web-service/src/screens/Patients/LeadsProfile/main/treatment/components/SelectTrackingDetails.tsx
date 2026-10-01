import clsx from 'clsx'
import BackGroundSVG from 'components/atom/SVG/BackGroundSVG'

const SelectTrackingDetails = (props: any) => {
  const {options, formik, className, onOptionChange} = props
  return (
    <div className='w-full flex flex-wrap gap-4'>
      {options.map((option: any) => (
        <div
          key={option.value}
          className={clsx(
            'md:w-[301px] w-full p-4 rounded-lg border cursor-pointer',
            formik.values.trackingSelectTypes === option.value
              ? '  border-primaryColor'
              : '  border-mediumGray',
            className
          )}
          onClick={() => onOptionChange(option.value)}
        >
          <div className='flex items-center justify-between '>
            <BackGroundSVG
              svg={
                formik.values.trackingSelectTypes === option.value
                  ? option.icon
                  : option.disabledIcon
              }
              width={option.iconWidth}
              height={option.iconHeight}
              className={clsx(
                formik.values.trackingSelectTypes === option.value
                  ? 'bg-primarySupport'
                  : 'bg-lightGray',
                'font-[14px] text-semibold w-[50px] h-[50px] rounded-full'
              )}
            />
          </div>
          <div
            className={clsx(
              formik.values.trackingSelectTypes === option.value
                ? 'text-primaryColor'
                : 'text-textColor',
              'text-[18px] font-semibold mt-2'
            )}
          >
            {option.title}
          </div>
          <div className='text-[14PX] text-textColor mt-1'>{option.SubTitle}</div>
        </div>
      ))}
    </div>
  )
}

export default SelectTrackingDetails
