import cn from '@utils/cn'
import React from 'react'

const RenderTableHeader = ({header, className}: {header: React.ReactNode; className?: string}) => {
  return <div className={cn('text-textColor text-base font-normal ', className)}>{header}</div>
}

export default RenderTableHeader
