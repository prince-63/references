import {FC} from 'react'
import cn from '@utils/cn'

interface Props {
  className?: string
  letter: string
}

export const DefaultImage: FC<Props> = (props) => {
  const {className, letter} = props

  return (
    <div
      className={cn(
        'bg-primarySupport text-primaryColor text-xl rounded-full flex justify-center items-center border border-primaryColor min-w-11 min-h-11',
        className
      )}
    >
      {letter}
    </div>
  )
}
