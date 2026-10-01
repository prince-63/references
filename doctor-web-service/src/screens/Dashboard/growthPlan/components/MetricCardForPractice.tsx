import React from 'react'
import getColorPalette from 'utils/getColorPalette'

type Preset = {bg: string; accent: string}

const PRESETS: Record<string, Preset> = {
  'NEW CASE': {bg: '#E9F3F3', accent: '#0B6B6B'},
  'APPROVE PLAN': {bg: '#F2EEF7', accent: '#5B21B6'},
  'NEEDS ATTENTION': {bg: '#F8EDEF', accent: '#8A1538'},
  'AT RISK': {bg: '#F4EEE5', accent: '#9A5B11'},
  'MOVE TO PRODUCTION': {bg: '#F4EEE5', accent: '#9A5B11'},
  'STARTING SOON': {bg: '#E9F3EC', accent: '#166534'},
  'ALIGNER CHANGES & CHECK-INS': {bg: '#E7F1FA', accent: '#1D4ED8'},
  'INVITATIONS PENDING': {bg: '#F3F4F6', accent: '#64748B'},
}

function getPreset(label: string | undefined): Preset | undefined {
  if (!label) return undefined
  const key = String(label).trim().toUpperCase()
  return PRESETS[key]
}

const MetricCardForPractice = ({
  label,
  description,
  value,
  onClick,
  icon,
  bgColor,
}: {
  label: string
  description?: string
  value: number | string
  onClick?: () => void
  icon: React.ReactNode
  bgColor?: string
}) => {
  const pal = getColorPalette()
  const preset = getPreset(label)
  const numericValue = typeof value === 'number' ? value : Number(value)
  const isZero = Number.isFinite(numericValue) && Number(numericValue) === 0
  const ZERO_BG = '#F3F4F6'
  const ZERO_ACCENT = '#9CA3AF'
  const cardBg = isZero ? ZERO_BG : bgColor || preset?.bg || '#F5F5F5'
  const accent = isZero ? ZERO_ACCENT : preset?.accent || pal.primaryColor
  const finalIcon = icon

  const Wrapper: any = onClick ? 'button' : 'div'
  return (
    <Wrapper
      onClick={onClick}
      className={`relative text-left rounded-xl p-4 md:p-5 transition ${
        onClick ? 'hover:shadow-sm cursor-pointer' : ''
      }`}
      style={{
        backgroundColor: cardBg,
        border: '1px solid rgba(0,0,0,0.06)',
      }}
    >
      {/* Count display in top-right */}

      <div
        className='absolute top-3 right-3 px-3 py-1.5 rounded-lg text-white text-sm font-semibold shadow-sm'
        style={{backgroundColor: accent}}
      >
        {value}
      </div>

      {/* Icon + text */}
      <div className='flex flex-col items-start gap-3 md:gap-4'>
        {/* Icon in soft tile */}
        <div
          className='w-9 h-9 md:w-10 md:h-10 rounded-lg flex items-center justify-center shadow-sm border'
          style={{
            backgroundColor: '#FFFFFF',
            borderColor: 'rgba(0,0,0,0.06)',
            color: accent,
            opacity: isZero ? 0.4 : 1,
          }}
        >
          {finalIcon}
        </div>
        <div className='flex-1'>
          <div
            className='text-[12px] md:text-[12px] tracking-wide font-semibold uppercase'
            style={{color: pal.neutralBlack}}
          >
            {label}
          </div>
          {description ? (
            <div className='text-[12px] md:text-[12px] mt-1' style={{color: pal.textColor}}>
              {description}
            </div>
          ) : null}
        </div>
      </div>
    </Wrapper>
  )
}

export default MetricCardForPractice
