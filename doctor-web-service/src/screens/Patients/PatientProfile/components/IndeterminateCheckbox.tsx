import clsx from 'clsx'
import {HTMLProps, useEffect, useRef} from 'react'

export const IndeterminateCheckbox = ({
  indeterminate,
  className = 'bg-secondaryColor px-[5px] py-[7px]  rounded-sm flex-col justify-center items-center gap-2.5 inline-flex',
  type = 'checkbox',
  ...rest
}: {indeterminate?: boolean} & HTMLProps<HTMLInputElement>) => {
  const ref = useRef<HTMLInputElement>(null!)

  useEffect(() => {
    if (typeof indeterminate === 'boolean') {
      ref.current.indeterminate = !rest.checked && indeterminate
    }
  }, [ref, indeterminate])

  return (
    <input type={type} ref={ref} className={clsx(className, 'cursor-pointer w-5 h-5 ')} {...rest} />
  )
}
