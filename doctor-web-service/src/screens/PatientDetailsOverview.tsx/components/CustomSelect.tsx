import React, {useEffect, useMemo, useRef, useState} from 'react'

export type Option = {label: React.ReactNode; value: string | number}
type Props = {
  options: Option[]
  value?: string | number
  onChange?: (value: string | number, option?: Option) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

const CustomSelect: React.FC<Props> = ({
  options,
  value,
  onChange,
  placeholder = 'Select…',
  disabled = false,
  className = '',
}) => {
  const [open, setOpen] = useState(false)
  const [hoverIdx, setHoverIdx] = useState<number>(-1)
  const wrapRef = useRef<HTMLDivElement>(null)

  const selected = useMemo(() => options?.find((o) => o.value === value), [options, value])

  // Close on outside click
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  // Keyboard navigation
  const onKeyDown: React.KeyboardEventHandler<HTMLButtonElement> = (e) => {
    if (disabled) return
    const max = options.length - 1
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setOpen(true)
      setHoverIdx((i) => Math.min((i < 0 ? -1 : i) + 1, max))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setOpen(true)
      setHoverIdx((i) => Math.max((i < 0 ? options.length : i) - 1, 0))
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      if (!open) {
        setOpen(true)
        setHoverIdx(
          Math.max(
            0,
            options?.findIndex((o) => o.value === value)
          )
        )
      } else if (hoverIdx >= 0) {
        const opt = options[hoverIdx]
        onChange?.(opt.value, opt)
        setOpen(false)
      }
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <div ref={wrapRef} className={`relative inline-block ${className}`}>
      {/* Trigger */}
      <button
        type='button'
        aria-haspopup='listbox'
        aria-expanded={open}
        disabled={disabled}
        onClick={() => !disabled && setOpen((o) => !o)}
        onKeyDown={onKeyDown}
        className={[
          'min-w-[200px] h-10 px-3 rounded-lg border',
          'flex items-center justify-between gap-2',
          disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer',
          // pill style you wanted:
          'bg-[#E6F0FF] border-[#D6E4FF] text-[#1A5DCC] font-semibold',
          'focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-[#BED8FF]',
        ].join(' ')}
      >
        <span className='truncate'>
          {selected ? (
            selected.label
          ) : (
            <span className='text-[#6B7280] font-normal'>{placeholder}</span>
          )}
        </span>
        <svg width='16' height='16' viewBox='0 0 24 24' className='shrink-0'>
          <path d='M7 10l5 5 5-5H7z' fill='currentColor' />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div
          role='listbox'
          tabIndex={-1}
          className={[
            'absolute z-50 mt-2 w-full max-h-64 overflow-auto rounded-lg border bg-white shadow-lg',
            'border-[#E5E7EB]',
          ].join(' ')}
        >
          {options.length === 0 && (
            <div className='px-3 py-2 text-sm text-gray-500'>No options</div>
          )}

          {options.map((opt, idx) => {
            const isSelected = opt.value === value
            const isHover = idx === hoverIdx
            return (
              <div
                key={String(opt.value)}
                role='option'
                aria-selected={isSelected}
                onMouseEnter={() => setHoverIdx(idx)}
                onMouseLeave={() => setHoverIdx(-1)}
                onMouseDown={(e) => {
                  // prevent blur before click
                  e.preventDefault()
                  onChange?.(opt.value, opt)
                  setOpen(false)
                }}
                className={[
                  'px-3 py-2 text-sm flex items-center justify-between',
                  isSelected ? 'bg-[#E6F0FF] text-[#1A5DCC] font-semibold' : 'text-gray-800',
                  isHover && !isSelected ? 'bg-[#F3F8FF]' : '',
                  'cursor-pointer',
                ].join(' ')}
              >
                <span className='truncate'>{opt.label}</span>
                {isSelected && (
                  <svg width='16' height='16' viewBox='0 0 24 24'>
                    <path d='M9 16.2l-3.5-3.6L4 14.1l5 5 11-11-1.4-1.4z' fill='#1A5DCC' />
                  </svg>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default CustomSelect
