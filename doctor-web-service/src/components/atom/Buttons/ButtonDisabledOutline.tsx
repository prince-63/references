import {FC} from 'react'
import {clsx} from 'yet-another-react-lightbox'

interface ButtonDisabledOutlineProps {
  className?: string
  text?: string
}

const ButtonDisabledOutline: FC<ButtonDisabledOutlineProps> = ({
  className,
  text,
}: ButtonDisabledOutlineProps) => {
  return (
    <button
      type='submit'
      className={clsx(
        className,
        'w-full h-10 flex items-center color px-4 py-2 border border-grayDisabled rounded-md text-sm text-grayDisabled  bg-lightGray'
      )}
      disabled={true}
    >
      <span className='flex justify-center flex-grow'>{text}</span>
    </button>
  )
}

export default ButtonDisabledOutline
