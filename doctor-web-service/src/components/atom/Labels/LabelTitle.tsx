import {FC} from 'react'

interface Props {
  className?: string
  title?: string
  required?: boolean
}

const LabelTitle: FC<Props> = ({className, title, required}) => {
  const style = `w-full text-bold font-family: Figtree ${className}`
  return (
    <div className=''>
      <label className={style} style={{color: '#666666'}}>
        {title}
        {required ? <span className='text-red ml-1'>*</span> : ''}
      </label>
    </div>
  )
}

export default LabelTitle
