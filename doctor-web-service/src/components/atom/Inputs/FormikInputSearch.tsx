import React from 'react'
import {useField, ErrorMessage} from 'formik'
import {Input, ConfigProvider} from 'antd'
import cn from '@utils/cn'
import {SearchProps} from 'antd/es/input'

interface FormikInputProps extends SearchProps {
  name: string
  label?: string
  required?: boolean
  className?: string
}

const FormikInputSearch: React.FC<FormikInputProps> = ({className, label, required, ...props}) => {
  const [field, meta] = useField(props.name)
  const {Search} = Input

  return (
    <ConfigProvider theme={{token: {fontFamily: 'figtree'}}}>
      <div>
        {label && (
          <label htmlFor={props.name} className='block text-base font-medium text-textColor mb-1'>
            {label}
            {required && <span className='text-red ml-1'>*</span>}
          </label>
        )}
        <Search
          {...field}
          {...props}
          id={props.name}
          className={cn(
            'w-full rounded-md ant-custom',
            className,
            props.readOnly && 'text-grayDisabled'
          )}
          status={meta.touched && meta.error ? 'error' : ''}
        />
        <ErrorMessage name={props.name} component='div' className='text-xs text-red mt-1' />
      </div>
    </ConfigProvider>
  )
}

export default FormikInputSearch
