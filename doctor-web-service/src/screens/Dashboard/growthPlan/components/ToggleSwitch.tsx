import React from 'react'
import getColorPalette from 'utils/getColorPalette'

const ToggleSwitch = ({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (next: boolean) => void
  label: string
}) => {
  const pal = getColorPalette()
  return (
    <div className='flex items-center gap-3'>
      <span className='text-sm' style={{color: pal.textColor}}>
        {label}
      </span>
      <button
        type='button'
        role='switch'
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className='relative inline-flex h-7 w-12 items-center rounded-full border transition shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2'
        style={{
          backgroundColor: checked ? pal.primaryColor : pal.secondarySupport,
          borderColor: checked ? pal.primaryColor : pal.lighterGray,
          boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.03)',
        }}
      >
        <span className='sr-only'>{label}</span>
        <span
          className='inline-block h-5 w-5 transform rounded-full bg-white transition'
          style={{
            translate: checked ? 'calc(100% - 20px) 0' : '0 0',
            marginLeft: checked ? '20px' : '2px',
          }}
        />
      </button>
    </div>
  )
}

export default ToggleSwitch
