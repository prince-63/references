import React, {FC, CSSProperties} from 'react'
import arrowRight from '../../assets/icons/arrowright.png'
import getColorPalette from 'utils/getColorPalette'

interface IconButtonProps {
  className?: CSSProperties
  onClick?: () => void
  text?: string
}

const IconButton: FC<IconButtonProps> = ({className, onClick, text}) => {
  const style = `w-full h-12 flex items-center px-4 py-2 border rounded-md text-white text-sm bg-#735BF2 hover:bg-lightGray focus:outline-none focus:ring focus:ring-mediumGray ${className}`

  return (
    <button
      className={style}
      onClick={onClick}
      style={{background: getColorPalette().primaryColor}}
    >
      <span className='flex justify-center flex-grow'>
        {text}
        <span className='mx-2 flex justify-center items-center pt-1 w-3'>
          {<img src={arrowRight} />}
        </span>
      </span>
    </button>
  )
}

export default IconButton
