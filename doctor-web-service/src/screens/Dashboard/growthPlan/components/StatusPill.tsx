import React from 'react'
import getColorPalette from 'utils/getColorPalette'

const StatusPill = ({
  count,
  tone = 'info',
}: {
  count: number | string
  tone?: 'success' | 'warning' | 'error' | 'info'
}) => {
  const pal = getColorPalette()
  const map = {
    success: {bg: pal.tertiarySupport, fg: pal.tertiaryColor},
    warning: {bg: pal.orangeSupport, fg: pal.orange},
    error: {bg: pal.redSupport, fg: pal.red},
    info: {bg: pal.secondarySupport, fg: pal.secondaryColor},
  }
  const c = map[tone]
  return (
    <span
      className='inline-block px-3 py-1 rounded font-medium'
      style={{backgroundColor: c.bg as string, color: c.fg as string}}
    >
      {count}
    </span>
  )
}

export default StatusPill
