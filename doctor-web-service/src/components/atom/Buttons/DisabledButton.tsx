import {FC} from 'react'

interface DisabledButtonProps {
  className?: string
  onClick?: () => void
  text?: string
}

const DisabledButton: FC<DisabledButtonProps> = ({className, onClick, text}) => {
  return (
    <button
      disabled={true}
      className={`bg-grayDisabled text-textColor w-full h-12 flex items-center px-4 py-2 border rounded-md text-sm ${className}`}
      onClick={onClick}
      style={{background: '#D9D9D9', color: '#666666'}}
    >
      <span className='flex justify-center flex-grow'>{text}</span>
    </button>
  )
}

export default DisabledButton
