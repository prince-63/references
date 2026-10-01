import {FC} from 'react'

interface ButtonProps {
  className?: string
  text?: string
}

const ButtonDisable: FC<ButtonProps> = ({className, text}) => {
  return (
    <button
      type='submit'
      className={`w-full h-12 px-2.5 py-4 bg-grayDisabled rounded-lg justify-center items-center gap-2.5 inline-flex ${className}`}
      disabled={true}
    >
      <span className='flex justify-center flex-grow text-center text-textColor text-base font-semibold'>
        {text}
      </span>
    </button>
  )
}

export default ButtonDisable
