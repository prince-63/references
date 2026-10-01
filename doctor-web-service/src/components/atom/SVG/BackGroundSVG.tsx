import React from 'react'

interface props {
  width?: string
  height?: string
  color?: string
  className?: string
  svg?: any
  stroke?: string
  onClick?: () => void
}

const BackGroundSVG: React.FC<props> = (props) => {
  const {width, height, svg, onClick, className, stroke = '', ...rest} = props
  const SvgComponent = svg
  const style = `flex  flex-shrink-0 justify-center items-center  ${className}`
  return (
    <div className={style} onClick={onClick}>
      <SvgComponent height={height} width={width} fill='transparent' stroke={stroke} {...rest} />
    </div>
  )
}

export default BackGroundSVG
