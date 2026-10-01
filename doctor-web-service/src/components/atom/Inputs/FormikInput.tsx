import React from 'react'
import {useField, ErrorMessage} from 'formik'
import {Input, ConfigProvider} from 'antd'
import {InputProps} from 'antd/lib/input'
import cn from '@utils/cn'

interface FormikInputProps extends InputProps {
  name: string
  label?: string
  required?: boolean
  className?: string
  subLabel?: string
  hideErrorMessage?: boolean
}

const FormikInput: React.FC<FormikInputProps> = ({
  className,
  label,
  subLabel,
  required,
  hideErrorMessage,
  ...props
}) => {
  const [field, meta, helpers] = useField(props.name)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (props.name === 'email') {
      helpers.setValue(value.toLocaleLowerCase() || '')
    } else {
      helpers.setValue(value || '')
    }
  }

  return (
    <ConfigProvider theme={{token: {fontFamily: 'figtree'}}}>
      <div className='w-full'>
        {label && (
          <label htmlFor={props.name} className='text-base font-medium text-textColor mb-1'>
            {label}
            {required && <span className='text-red ml-1'>*</span>}
          </label>
        )}
        {subLabel && <p className='text-sm font-normal text-textColor mb-1'>{subLabel}</p>}
        <Input
          {...field}
          {...props}
          id={props.name}
          className={cn(
            'w-full p-2 border rounded-md',
            className,
            props.readOnly && 'text-grayDisabled'
          )}
          status={meta.touched && meta.error ? 'error' : ''}
          onChange={handleChange}
        />
        {!hideErrorMessage && (
          <ErrorMessage name={props.name} component='div' className='text-xs text-red mt-1' />
        )}
      </div>
    </ConfigProvider>
  )
}

export default FormikInput
