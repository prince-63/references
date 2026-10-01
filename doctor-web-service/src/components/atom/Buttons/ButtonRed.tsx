import {FC} from 'react'
import {clsx} from 'yet-another-react-lightbox'

interface Props {
  className?: string
  onClick?: () => void
  text?: string
}

const ButtonRed: FC<Props> = ({className, onClick, text}) => {
  return (
    <button
      type='submit'
      className={clsx(
        className,
        ' w-full h-14 px-2.5 py-4 bg-red rounded-lg justify-center items-center gap-2.5 inline-flex'
      )}
      onClick={onClick}
    >
      <span className='text-center text-white text-base font-semibold leading-normal'>{text}</span>
    </button>
  )
}

export default ButtonRed
