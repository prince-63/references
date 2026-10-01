import React, {useEffect, useState} from 'react'
import {useField, ErrorMessage} from 'formik'
import {Select} from 'antd'
import {SelectProps} from 'antd/lib/select'
import cn from '@utils/cn'
import map from 'ramda/src/map'

interface FormikMultiSelectListProps extends SelectProps {
  name: string
  label?: string
  required?: boolean
  className?: string
  items: {
    value: any
    label: string
    [key: string]: any
  }[]
  onChangeMapperFunc?: (value: any) => any
  loading?: boolean
  onChangeSuccess?: (value: any) => void
  disabled?: boolean
}

const FormikMultiSelectList: React.FC<FormikMultiSelectListProps> = ({
  className,
  label,
  required,
  items,
  onChangeMapperFunc = (value) => value,
  loading,
  onChangeSuccess,
  disabled = false,
  ...props
}) => {
  const [field, meta, helpers] = useField(props.name)
  const [selectedValues, setSelectedValues] = useState(field.value || [])

  const handleOnChange = (valSelected: any) => {
    setSelectedValues(valSelected)
    const values = valSelected.map((val: any) =>
      items.find((item) => item.value === onChangeMapperFunc(val))
    )
    if (onChangeSuccess) {
      onChangeSuccess(values)
    }
    helpers.setValue(values.map((val: any) => val?.value))
  }

  useEffect(() => {
    setSelectedValues(field.value || [])
  }, [field.value])

  const {Option} = Select

  return (
    <div className='w-full'>
      {label && (
        <label htmlFor={props.name} className='text-base font-medium text-textColor mb-1'>
          {label}
          {required && <span className='text-red ml-1'>*</span>}
        </label>
      )}
      <Select
        {...field}
        {...props}
        id={props.name}
        className={cn('w-full rounded-md', className)}
        size='large'
        mode='multiple'
        status={meta.touched && meta.error ? 'error' : ''}
        onChange={handleOnChange}
        value={selectedValues.map((val: any) => onChangeMapperFunc(val))}
        loading={loading}
        showSearch
        filterOption={(input, option) =>
          (option?.children?.toString().toLowerCase() ?? '').indexOf(input.toLowerCase()) >= 0
        }
        getPopupContainer={(triggerNode) => triggerNode.parentNode}
        disabled={disabled}
      >
        {map(
          (item) => (
            <Option key={`${props.name}-${item.value}`} value={item.value}>
              {item.label}
            </Option>
          ),
          items
        )}
      </Select>
      <ErrorMessage name={props.name} component='div' className='text-xs text-red mt-1' />
    </div>
  )
}

export default FormikMultiSelectList
