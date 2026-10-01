import {FC} from 'react'
import CommonSVG from '../SVG/CommonSVG'
import {SVG_ARROW_RIGHT_GRAY} from 'utils/SvgConstants'

interface Props {
  className?: string
  onClick: () => void
  text: string
  svg: any
}

const ButtonWord: FC<Props> = ({className, onClick, text}) => {
  return (
    <button
      type='submit'
      className={`${className} flex gap-2 justify-center items-center`}
      onClick={onClick}
    >
      <span className='text-center text-textColor text-[14px] font-semibold leading-normal '>
        {text}
      </span>
      <CommonSVG svg={SVG_ARROW_RIGHT_GRAY} width='18' height='12' />
    </button>
  )
}

export default ButtonWord
