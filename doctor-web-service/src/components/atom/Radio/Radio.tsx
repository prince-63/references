import React from 'react'

interface InputRadioProps {
  value?: string
  label?: string
  checked?: boolean
  name?: string
  onChange?: ((value: string) => void) | undefined
}

const Radio: React.FC<InputRadioProps> = ({label, value, checked, onChange, name}) => {
  const handleRadioChange = () => {
    if (onChange && value !== undefined) {
      onChange(value)
    }
  }

  return (
    <label className='flex items-center space-x-2 cursor-pointer'>
      <input
        type='radio'
        className='form-radio h-5 w-5 text-secondaryColor'
        value={value}
        checked={checked}
        onChange={handleRadioChange}
        name={name}
      />
      <span>{label}</span>
    </label>
  )
}

export default Radio
