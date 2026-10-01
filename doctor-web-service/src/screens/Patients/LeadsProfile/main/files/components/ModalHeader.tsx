import clsx from 'clsx'
import BackGroundSVG from 'components/atom/SVG/BackGroundSVG'
import CommonSVG from 'components/atom/SVG/CommonSVG'
import React from 'react'
import {SVG_CROSS} from 'utils/SvgConstants'

const ModalHeader = ({
  svg,
  onClose,
  className = 'bg-primarySupport',
  color,
  showCloseIcon = true,
  iconHeight = '30',
  iconWidth = '30',
}: {
  svg: any
  onClose: () => void
  className?: string
  color?: string
  showCloseIcon?: boolean
  iconHeight?: string
  iconWidth?: string
}) => {
  return (
    <div className='flex justify-between items-center'>
      <BackGroundSVG
        svg={svg}
        width={iconWidth}
        height={iconHeight}
        stroke={color}
        className={clsx('w-16 h-16  rounded-full ', className)}
      />
      {showCloseIcon && (
        <div className='cursor-pointer' onClick={onClose}>
          <CommonSVG svg={SVG_CROSS} width='47' height='47' />
        </div>
      )}
    </div>
  )
}

export default ModalHeader
