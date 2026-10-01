const OptionRow = ({
  label,
  description,
  checked,
  onChange,
  children,
}: {
  label: string
  description?: string
  checked: boolean
  onChange: () => void
  children?: React.ReactNode
}) => {
  return (
    <label
      className={`flex w-full cursor-pointer flex-col gap-2 rounded-xl border  ${
        checked ? 'border-violet-300 ring-2 ring-violet-200' : 'border-neutral-200'
      } bg-white p-4 shadow-sm transition-shadow`}
    >
      <div className='flex items-start justify-between gap-3'>
        <div className='min-w-0'>
          <div className='text-sm font-semibold'>{label}</div>
          {description && <div className='mt-0.5 text-sm text-neutral-500'>{description}</div>}
        </div>
        <input
          type='radio'
          className='h-4 w-4 accent-violet-600'
          checked={checked}
          onChange={onChange}
        />
      </div>
      {children}
    </label>
  )
}

export default OptionRow
