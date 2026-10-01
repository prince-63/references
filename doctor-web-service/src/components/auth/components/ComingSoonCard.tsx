import CommonSVG from '../../atom/SVG/CommonSVG'
interface props {
  icon?: any
  title?: string
}
export const ComingSoonCard = (props: props) => {
  const {icon, title} = props
  return (
    <div className='w-full md:w-fit'>
      {/* for Web */}
      <div className='w-full md:flex md:w-fit md:order-1 hidden'>
        <div
          className={`flex flex-col justify-between  w-[249px] h-[203px] rounded-[16px] shadow-second p-3 pt-5 border bg-white border-grayDisabled   `}
        >
          <CommonSVG width='110' height='75' color='red' svg={icon} />
          <div
            className={`text-black font-bold leading-none mb-2 ${
              title && title.length > 25 ? 'text-[16px]' : 'text-[24px]'
            }`}
          >
            {title}
          </div>
        </div>
      </div>

      {/* for Mobile */}
      <div className='md:hidden w-full'>
        <div className='w-full rounded-lg border border-grayDisabled min-h-16 flex gap-2 justify-start items-center pl-3'>
          <CommonSVG width='45' height='32' color='red' svg={icon} />
          <div className={`w-full text-black text-base font-bold`}>{title}</div>
        </div>
      </div>
    </div>
  )
}
