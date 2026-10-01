import {FC} from 'react'

interface Props {
  className?: string
  onClick?: () => void
  text?: string
}

const ButtonOutlinedRound: FC<Props> = ({className, onClick, text}) => {
  return (
    <button
      type='submit'
      className={`${className} h-10 px-2.5 py-4 bg-primarySupport rounded-3xl border border-primaryColor justify-center items-center gap-2.5 inline-flex`}
      onClick={onClick}
    >
      <span className='text-center text-primaryColor text-base font-semibold leading-normal'>
        {text}
      </span>
    </button>
  )
}

export default ButtonOutlinedRound
