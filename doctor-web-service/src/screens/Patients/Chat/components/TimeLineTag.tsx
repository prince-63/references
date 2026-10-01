import React from 'react'

const TimeLineTag = ({timeline}: {timeline: string}) => {
  return (
    <div className='w-auto px-2 py-1 my-2 bg-lightGray rounded-lg text-center text-textColor text-sm'>
      {timeline}
    </div>
  )
}

export default TimeLineTag
