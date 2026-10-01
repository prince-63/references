import {FC} from 'react'
import {clsx} from 'yet-another-react-lightbox'

interface ButtonOutlinedProps {
  className?: string
  onClick?: () => void
  text?: string
  disabled?: boolean
}

const ButtonOutlined: FC<ButtonOutlinedProps> = ({className, onClick, text, disabled}) => {
  return (
    <button
      disabled={disabled}
      type='submit'
      className={clsx(
        className,
        'w-full h-10 flex items-center color px-4 py-2 border border-primaryColor rounded-md text-sm bg-transparent text-primaryColor  hover:bg-lightGray hover:drop-shadow-lg focus:outline-none focus:ring focus:ring-mediumGray'
      )}
      onClick={onClick}
    >
      <span className='flex justify-center flex-grow'>{text}</span>
    </button>
  )
}

export default ButtonOutlined
