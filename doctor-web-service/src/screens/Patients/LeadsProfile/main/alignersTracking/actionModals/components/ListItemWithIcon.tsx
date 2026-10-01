import cn from '@utils/cn'
import CommonSVG from 'components/atom/SVG/CommonSVG'
import When from 'components/when/When'
import {SVG_CROSS_RED, SVG_TICK_GREEN} from 'utils/SvgConstants'

const ListItemWithIcon = ({
  value,
  checked,
  className,
  title,
}: {
  value?: string
  title?: string
  checked: boolean | undefined
  className?: string
}) => {
  return (
    <div className={cn('flex text-textColor gap-3 items-start font-medium text-sm', className)}>
      <div className='w-3  mt-[2px]'>
        <When isTrue={checked}>
          <CommonSVG svg={SVG_TICK_GREEN} width='15' height='15' />
        </When>
        <When isTrue={!checked}>
          <div className=' mt-[2px]'>
            <CommonSVG svg={SVG_CROSS_RED} width='12' height='12' />
          </div>
        </When>
      </div>
      <p>{value ? value : title}</p>
    </div>
  )
}

export default ListItemWithIcon
