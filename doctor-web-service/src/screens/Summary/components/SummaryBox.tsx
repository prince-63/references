import clsx from 'clsx'
import When from 'components/when/When'
import {ReactNode} from 'react'
import hasValue from 'utils/hasValue'

interface SummaryBoxProps {
  title: string
  id: string
  className?: string
  children: ReactNode
  isShow?: boolean
}
const SummaryBox = (props: SummaryBoxProps) => {
  const {title, id, children, className, isShow} = props
  return (
    <When isTrue={isShow}>
      <div className='flex flex-col gap-2 max-w-[904px] mb-6 ' id={id}>
        <When isTrue={hasValue(title)}>
          <div
            className={clsx(
              'h-[42px] flex justify-center items-center rounded-lg text-base md:text-lg font-semibold px-2 md:px-4',
              className
            )}
          >
            {title}
          </div>
        </When>
        <div className='border border-mediumGray rounded-lg p-4 md:p-6 text-sm md:text-base'>
          {children}
        </div>
      </div>
    </When>
  )
}

export default SummaryBox
