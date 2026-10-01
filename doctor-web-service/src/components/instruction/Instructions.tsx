import React, {useState} from 'react'
import CommonSVG from 'components/atom/SVG/CommonSVG'
import {SVG_INFO_PRIMARY, SVG_CROSS} from 'utils/SvgConstants'

const Instructions = ({info, closable = false}: {info: string; closable?: boolean}) => {
  const [show, setShow] = useState(true)

  if (!show) return null

  return (
    <div className='w-full px-3.5 py-2.5 bg-primarySupport rounded-lg justify-between md:items-center items-start inline-flex'>
      <div className='min-w-6 flex justify-center items-center gap-2'>
        <CommonSVG svg={SVG_INFO_PRIMARY} width='24' height='24' />
        <div className='text-primaryColor text-base font-medium'>{info}</div>
      </div>

      {closable && (
        <button onClick={() => setShow(false)} className='ml-4 p-1 hover:opacity-80'>
          <CommonSVG svg={SVG_CROSS} width='30' height='30' />
        </button>
      )}
    </div>
  )
}

export default Instructions
