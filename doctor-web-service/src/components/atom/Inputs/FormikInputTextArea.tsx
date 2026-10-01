import React from 'react'
import {useField, ErrorMessage} from 'formik'
import {Input, ConfigProvider} from 'antd'
import {TextAreaProps} from 'antd/lib/input/TextArea'
import cn from '@utils/cn'

interface FormikInputTextAreaProps extends TextAreaProps {
  name: string
  label?: string
  required?: boolean
  subLabel?: string
  className?: string
}

const FormikInputTextArea: React.FC<FormikInputTextAreaProps> = ({
  className,
  label,
  subLabel,
  required,
  ...props
}) => {
  const [field, meta, helpers] = useField(props.name)

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    helpers.setValue(value || '')
    props.onChange?.(e)
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
        <Input.TextArea
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
        <ErrorMessage name={props.name} component='div' className='text-xs text-red mt-1' />
      </div>
    </ConfigProvider>
  )
}

export default FormikInputTextArea
