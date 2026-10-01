import clsx from 'clsx'
import When from 'components/when/When'
import {ReactNode} from 'react'
import hasValue from 'utils/hasValue'

export const DataWrapper = ({
  children,
  showBorder = true,
  className,
  title,
  isShow,
}: {
  children: ReactNode
  showBorder?: boolean
  className?: string
  title?: ReactNode
  isShow: boolean
}) => {
  return (
    <When isTrue={isShow}>
      <div className='flex flex-col gap-2 pb-4'>
        <When isTrue={hasValue(title)}>
          <div className={clsx('text-[14px] font-semibold', className)}>{title}</div>
        </When>
        {children}
        <When isTrue={showBorder}>
          <div className=' border-b border-mediumGray mt-1'></div>
        </When>
      </div>
    </When>
  )
}
