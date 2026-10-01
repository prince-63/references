import React, {HTMLProps} from 'react'

interface props {
  width?: string
  height?: string
  color?: string
  svg?: any
}

const CommonSVG: React.FC<props & HTMLProps<HTMLOrSVGElement>> = (props) => {
  const {width, height, svg, ...rest} = props
  const SvgComponent = svg
  return <SvgComponent width={width} height={height} {...rest} />
}

export default CommonSVG
