import React from 'react'
import getColorPalette from 'utils/getColorPalette'

const MetricCard = ({
  label,
  description,
  value,
  onClick,
  variant = 'normal',
  icon,
  bgColor = '#F5F5F5',
}: {
  label: string
  description?: string
  value: number | string
  onClick?: () => void
  variant?: 'normal' | 'header'
  icon?: React.ReactNode
  bgColor?: string
}) => {
  const pal = getColorPalette()
  const labelCls =
    variant === 'header'
      ? 'text-[12px] md:text-[12px] tracking-wide font-semibold uppercase'
      : 'text-[14px] md:text-[14px] tracking-wide font-semibold text-textColor'
  const descCls = 'text-[12px] md:text-[12px] text-textColor'
  const valueCls = 'text-[18px]'
  const Wrapper: any = onClick ? 'button' : 'div'
  return (
    <Wrapper
      onClick={onClick}
      className={`text-left rounded-lg p-4 transition ${
        onClick ? 'hover:shadow-sm cursor-pointer' : ''
      } ${
        variant === 'header' ? 'min-h-[80px] md:min-h-[96px] flex flex-col justify-between' : ''
      }`}
      style={{
        backgroundColor: bgColor,
        border: '1px solid rgba(0,0,0,0.06)',
        borderRadius: '12px',
      }}
    >
      <div className='flex items-start gap-3'>
        {icon ? <div className='text-textColor'>{icon}</div> : null}
        <div>
          <div className={`${labelCls} font-semibold  `}>{label}</div>
          {description ? <div className={`${descCls} mt-1`}>{description}</div> : null}
        </div>
      </div>
      <div className={`${valueCls} font-bold mt-2`} style={{color: pal.neutralBlack}}>
        {value}
      </div>
    </Wrapper>
  )
}

export default MetricCard
