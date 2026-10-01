import React from 'react'
import {useField, ErrorMessage} from 'formik'
import {InputNumber, ConfigProvider} from 'antd'
import {InputNumberProps} from 'antd/lib/input-number'
import cn from '@utils/cn'

interface FormikInputNumberProps extends InputNumberProps<number> {
  name: string
  label?: string
  required?: boolean
  className?: string
}

const FormikInputNumber: React.FC<FormikInputNumberProps> = ({
  className,
  label,
  required,
  ...props
}) => {
  const [field, meta, helpers] = useField<number | null>(props.name)

  const handleChange = (value: number | null) => {
    if (value) {
      helpers.setValue(value)
    } else {
      helpers.setValue(null)
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
        <InputNumber
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

export default FormikInputNumber
