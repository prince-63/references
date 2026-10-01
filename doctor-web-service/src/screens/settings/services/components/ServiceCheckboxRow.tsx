import React from 'react'

type Props = {
  id?: string
  label: string
  checked: boolean
  disabled?: boolean
  onChange: () => void
}

const ServiceCheckboxRow: React.FC<Props> = ({id, label, checked, disabled, onChange}) => {
  return (
    <label
      className={`flex items-start p-3 border rounded ${
        disabled ? 'opacity-60 cursor-not-allowed' : ''
      }`}
    >
      <input
        id={id}
        type='checkbox'
        className='green-checkbox'
        checked={checked}
        onChange={onChange}
        disabled={disabled}
      />
      <div className='ml-3'>
        <div className='font-medium'>{label}</div>
      </div>
    </label>
  )
}

export default ServiceCheckboxRow
