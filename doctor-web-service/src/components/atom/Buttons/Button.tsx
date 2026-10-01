import clsx from 'clsx'
import {FC} from 'react'

interface ButtonProps {
  className?: string
  onClick?: () => void
  text?: string
  textStyle?: string
  isDisabled?: boolean
  SvgRight?: any
}

const Button: FC<ButtonProps> = ({className, onClick, text, isDisabled, textStyle, SvgRight}) => {
  const style =
    'w-full h-12 px-2.5 py-4 bg-primaryColor rounded-lg justify-center items-center gap-2.5 inline-flex'
  const defaultTextStyle =
    'flex justify-center flex-grow text-center text-white text-base font-semibold'

  return (
    <button
      type='submit'
      className={clsx(className, style, isDisabled && 'opacity-30 cursor-not-allowed')}
      onClick={onClick}
      disabled={isDisabled}
    >
      <span className={clsx(defaultTextStyle, textStyle)}>{text}</span>
      {SvgRight}
    </button>
  )
}

export default Button
