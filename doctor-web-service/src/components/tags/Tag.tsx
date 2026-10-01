import cn from '@utils/cn'
import {ReactNode} from 'react'

const Tag = ({
  value,
  className = 'text-base bg-[#e9f3fa] text-[#0095ff]',
}: {
  value: ReactNode
  className?: string
}) => {
  return (
    <div
      className={cn(
        'rounded-[4px]  py-1 px-3 font-semibold flex justify-center items-center',
        className
      )}
    >
      {value}
    </div>
  )
}

export default Tag
