import {FC} from 'react'
import {SVG_FILTER_SEARCH, SVG_SEARCH} from '../../../utils/SvgConstants'
import CommonSVG from '../SVG/CommonSVG'
import When from 'components/when/When'
import clsx from 'clsx'

interface props {
  className?: string
  field?: any
  placeholder?: string
  onChange?: any
  value?: string
  name?: string
  maxLength?: number
  minLength?: number
  showFilter?: boolean
  wrapperClassName?: string
  onFilterClick?: () => void
}

const InputSearch: FC<props> = ({
  className,
  placeholder,
  onChange,
  value,
  name,
  maxLength,
  minLength,
  showFilter,
  onFilterClick,
  wrapperClassName,
}) => {
  const style = `w-full font-family: Figtree  ${className} outline-none`

  return (
    <div
      className={clsx(
        'relative flex px-4 py-1 gap-2 border border-0.50-#D9D9D9 rounded h-10 w-full items-center justify-center',
        wrapperClassName
      )}
    >
      <input
        style={{height: 24, borderRightWidth: 1}}
        type='text'
        className={style}
        placeholder={placeholder}
        value={value}
        name={name}
        onChange={onChange}
        maxLength={maxLength}
        minLength={minLength}
      />
      <div className='focus:outline-none'>
        <CommonSVG svg={SVG_SEARCH} width='18' height='18' />
      </div>
      <When isTrue={showFilter}>
        <div className='cursor-pointer' onClick={onFilterClick}>
          <CommonSVG svg={SVG_FILTER_SEARCH} width='20' />
        </div>
      </When>
    </div>
  )
}

export default InputSearch
