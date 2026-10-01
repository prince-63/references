import {FC} from 'react'
import {SVG_CROSS_WHITE, SVG_SEARCH} from '../../../utils/SvgConstants'
import CommonSVG from '../SVG/CommonSVG'
import clsx from 'clsx'
import BackGroundSVG from '../SVG/BackGroundSVG'
import When from 'components/when/When'

interface InputSearchProps {
  className?: string
  placeholder?: string
  onChange?: React.ChangeEventHandler<HTMLInputElement>
  value?: string
  onClick?: () => void
  showClearButton?: boolean
  onClear?: () => void
  autoFocus?: boolean
  maxLength?: number
  handlePaste?: React.ClipboardEventHandler<HTMLInputElement>
  disabled?: boolean
}

const InputSearchGray: FC<InputSearchProps> = ({
  placeholder,
  onChange,
  value,
  className,
  onClick,
  showClearButton,
  onClear,
  autoFocus,
  maxLength,
  handlePaste,
  disabled,
}) => {
  return (
    <div
      onClick={onClick}
      className={clsx(
        'w-full relative px-4 py-2 rounded-lg bg-lightGray justify-start items-center flex ',
        className
      )}
    >
      <div className='absolute left-3 top-1/2 transform -translate-y-1/2 focus:outline-none'>
        <CommonSVG svg={SVG_SEARCH} width='18px' height='18px' />
      </div>
      <input
        type='text'
        className={'w-full pl-8 bottom-0 bg-transparent !outline-0 !border-none'}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onPaste={handlePaste}
        autoFocus={autoFocus}
        maxLength={maxLength}
        disabled={disabled}
        readOnly={disabled}
      />
      <When isTrue={showClearButton}>
        <BackGroundSVG
          svg={SVG_CROSS_WHITE}
          height='12'
          width='12'
          className='rounded-full bg-textColor h-[16px] w-[16px] cursor-pointer'
          onClick={onClear}
        />
      </When>
    </div>
  )
}

export default InputSearchGray
