import React from 'react'
import cn from '@utils/cn'

const ColorIcon = ({color, className}: {color?: string; className?: string}) => {
  return (
    <div
      className={cn('w-2.5 h-2.5  rounded-full', className)}
      style={color ? {backgroundColor: color} : undefined}
    ></div>
  )
}

export default ColorIcon
