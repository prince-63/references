import React from 'react'
import getColorPalette from 'utils/getColorPalette'

const TabButton = ({
  active,
  label,
  count,
  onClick,
}: {
  active: boolean
  label: string
  count: number
  onClick: () => void
}) => {
  const pal = getColorPalette()
  const btnStyle = active
    ? {backgroundColor: pal.primarySupport, color: 'black'}
    : {backgroundColor: '#fff', color: '#666666', borderColor: pal.lighterGray}
  const badgeStyle = active
    ? {backgroundColor: pal.primaryColor, color: pal.white, border: '1px solid rgba(0,0,0,0.06)'}
    : {backgroundColor: '#EFEFEF', color: '#666666', border: `1px solid ${pal.lighterGray}`}
  return (
    <button
      onClick={onClick}
      className={
        'inline-flex items-center gap-2 px-3 py-1.5 md:px-3 md:py-1.5 text-sm font-semibold rounded-full border transition shrink-0'
      }
      style={btnStyle}
    >
      <span className='uppercase tracking-wide'>{label}</span>
      <span
        className='inline-flex items-center justify-center text-xs font-bold rounded-full px-2 py-0.5'
        style={badgeStyle}
      >
        {count}
      </span>
    </button>
  )
}

export default TabButton
