import clsx from 'clsx'
import Tag from 'components/tags/Tag'
import When from 'components/when/When'
import {ReactNode} from 'react'
import hasValue from 'utils/hasValue'

export const ConditionalValueDiv = ({
  label,
  value,
  showTag = false,
  className,
  classNameValue,
}: {
  label?: string
  value: string | ReactNode | null
  showTag?: boolean
  className?: string
  classNameValue?: string
}) => {
  return (
    <When isTrue={hasValue(value)}>
      <div className={clsx('w-full flex  justify-start md:items-start flex-row gap-2', className)}>
        {label && (
          <div className='w-1/2 text-[14px] font-medium text-textColor text-start'>{label}</div>
        )}
        {showTag ? (
          <Tag
            value={value}
            className='text-base bg-secondarySupport text-secondaryColor w-8 h-8 mb-1'
          />
        ) : (
          <div
            className={clsx(
              'w-1/2 text-[14px] font-medium text-black break-words ',
              classNameValue
            )}
          >
            {value}
          </div>
        )}
      </div>
    </When>
  )
}
