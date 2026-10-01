import clsx from 'clsx'
import CommonSVG from 'components/atom/SVG/CommonSVG'
import Tag from 'components/tags/Tag'
import When from 'components/when/When'
import {SVG_ARROW_RIGHT_GRAY} from 'utils/SvgConstants'
import hasValue from 'utils/hasValue'

const TaskToDo = ({
  status,
  title,
  text,
  Icon,
  onClick,
}: {
  status?: 'NEW' | 'CRITICAL' | 'COMPLETED' | 'NORMAL' | undefined
  title: string
  text: string
  Icon: any
  onClick?: () => void
}) => {
  return (
    <div
      className='w-full cursor-pointer p-4 rounded-lg border border-lightGray flex items-center md:justify-between'
      onClick={onClick}
    >
      <div className='flex flex-col gap-2 w-full'>
        <div className='w-full flex items-center md:gap-[10px] gap-2'>
          <Icon color='#000000' width='24' />
          <span className='md:text-lg text-[16px] font-semibold'>{title}</span>
          <When isTrue={hasValue(status) && status !== 'NORMAL'}>
            <Tag
              value={status}
              className={clsx(
                'text-xs font-semibold',
                status === 'NEW' && '!bg-tertiarySupport !text-tertiaryColor',
                status === 'CRITICAL' && '!bg-redSupport !text-red'
              )}
            />
          </When>
        </div>
        <div className='flex items-center gap-2 ml-8 w-[90%]'>
          <span className='text-textColor text-sm w-full text-wrap'>{text}</span>
        </div>
      </div>
      <div className='md:flex hidden'>
        <CommonSVG svg={SVG_ARROW_RIGHT_GRAY} width='20' />
      </div>
    </div>
  )
}

export default TaskToDo
