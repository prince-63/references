import React from 'react'
import getColorPalette from 'utils/getColorPalette'

const TabMetricItem = ({
  label,
  count,
  onClick,
  tone = 'info',
  subLabel,
  subLabelColor,
  showLabel = true,
}: {
  label: string
  count: number
  onClick?: () => void
  tone?: 'success' | 'warning' | 'error' | 'info'
  subLabel?: string
  subLabelColor?: string
  showLabel?: boolean
}) => {
  const pal = getColorPalette()
  const toneMap = {
    success: {bg: pal.tertiarySupport, fg: pal.tertiaryColor, border: pal.lighterGray},
    warning: {bg: pal.orangeSupport, fg: pal.orange, border: pal.lighterGray},
    error: {bg: pal.redSupport, fg: pal.red, border: pal.lighterGray},
    info: {bg: 'rgb(255, 255, 255)', fg: pal.neutralBlack, border: pal.lighterGray},
  } as const
  const t = toneMap[tone]
  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className={`flex items-center justify-between w-full rounded-xl px-3 py-3 border transition text-left ${
        onClick ? 'hover:shadow-sm cursor-pointer' : 'cursor-default'
      }`}
      style={{
        backgroundColor: t.bg as string,
        color: pal.neutralBlack,
        borderColor: t.border ?? pal.lighterGray,
      }}
    >
      <span className='flex flex-col'>
        {showLabel ? (
          <span className='text-xs md:text-sm font-semibold'>{String(label).toUpperCase()}</span>
        ) : null}
        {subLabel ? (
          <span className='text-[11px] md:text-xs' style={{color: subLabelColor ?? pal.textColor}}>
            {subLabel}
          </span>
        ) : null}
      </span>
      <span
        className='inline-flex items-center justify-center text-xs font-bold rounded-full px-2 py-0.5'
        style={{backgroundColor: pal.primarySupport, color: pal.primaryColor}}
      >
        {count}
      </span>
    </button>
  )
}

export default TabMetricItem
