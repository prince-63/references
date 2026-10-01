import React, {FC} from 'react'
import './InputStyle.css'
import {FormikProps} from 'formik'
import {InputNumber, Select} from 'antd'
const {Option} = Select

interface Option {
  value: string
  label: string
}

interface Props {
  classNameLabel?: string
  label?: string
  className?: string
  name: string
  formik?: FormikProps<any>
  required?: boolean
  defaultValue?: string
  setData?: any
  disable?: boolean
  minLength?: number
  maxLength?: number
  placeholder?: string
  onChange?: (e: any) => void
  options?: Option[]
}

const InputDropdownFormik: FC<Props> = ({
  classNameLabel,
  label,
  name,
  formik,
  required,
  disable,
  minLength,
  maxLength = 7,
  placeholder,
  onChange = formik?.handleChange,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const input = e.currentTarget as HTMLInputElement
    const currentValue = input.value

    const allowedKeys = [
      'Backspace',
      'Delete',
      'ArrowLeft',
      'ArrowRight',
      'ArrowUp',
      'ArrowDown',
      'Tab',
    ]
    if (allowedKeys.includes(e.key)) {
      return
    }

    if (currentValue.length >= maxLength) {
      e.preventDefault()
    }

    // Prevent input of non-numeric characters
    if (!/^\d$/.test(e.key)) {
      e.preventDefault()
    }
  }

  const labelStyle = `text-bold ${classNameLabel}`

  const optionsMenuList = (
    <Select defaultValue='INR' className='bg-white'>
      <Option value='INR'>INR</Option>
    </Select>
  )

  return (
    <div className='flex flex-col'>
      <div className='mb-2'>
        <label className={labelStyle} style={{color: '#666666'}}>
          {label}
          {required ? <span className='text-red ml-1'>*</span> : ''}
        </label>
      </div>
      <InputNumber
        addonBefore={optionsMenuList}
        type='number'
        id={name}
        name={name}
        size='large'
        controls={false}
        placeholder={placeholder}
        onChange={onChange}
        onBlur={formik?.handleBlur}
        onKeyDown={handleKeyDown}
        value={formik?.values[name]}
        minLength={minLength}
        maxLength={maxLength}
        disabled={disable}
        variant='outlined'
        required={required}
      />
      <div className='text-xs text-red mt-1'>
        {formik?.touched[name] && formik?.errors[name] && (
          <div className='text-red'>{String(formik?.errors[name])}</div>
        )}
      </div>
    </div>
  )
}

export default InputDropdownFormik
