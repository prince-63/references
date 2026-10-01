import React, {useState} from 'react'
import {useField, ErrorMessage} from 'formik'
import {Select} from 'antd'
import {SelectProps} from 'antd/lib/select'
import cn from '@utils/cn'
import map from 'ramda/src/map'
import {safeParseInt} from 'utils/ConstFunctions'

interface FormikSelectListProps extends SelectProps {
  name: string
  label?: string
  required?: boolean
  className?: string
  items: {
    value: any
    label: string
    subLabel?: string
    [key: string]: any
  }[]
  onChangeMapperFunc?: (value: any) => any
  loading?: boolean
  onChangeSuccess?: (value: any) => void
  disabled?: boolean
  showSearch?: boolean
}

const FormikSelectListWithSubText: React.FC<FormikSelectListProps> = ({
  className,
  label,
  required,
  items,
  onChangeMapperFunc = Number,
  loading,
  onChangeSuccess,
  disabled = false,
  showSearch = true,
  ...props
}) => {
  const [field, meta, helpers] = useField(props.name)
  const [selectedValue, setSelectedValue] = useState(
    items.find((item) => item.value === field.value)
  )
  const handleOnChange = (valSelected: any) => {
    const mappedValue = onChangeMapperFunc(valSelected)
    helpers.setValue(mappedValue)

    const val = items.find((item) => safeParseInt(item.value) === safeParseInt(mappedValue))
    setSelectedValue(val)
    if (onChangeSuccess && val) {
      onChangeSuccess(val)
    }
  }

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
        id={props.name}
        className={cn('w-full rounded-md', className)}
        size='large'
        status={meta.touched && meta.error ? 'error' : ''}
        onChange={handleOnChange}
        value={selectedValue}
        loading={loading}
        showSearch={showSearch}
        getPopupContainer={(triggerNode) => triggerNode.parentNode}
        disabled={disabled}
        optionLabelProp='label'
      >
        {map(
          (item) => (
            <Option
              key={`${props.name}-${item.value}`}
              value={item.value}
              label={item.label} // This will be shown in the selection when item is selected
            >
              <div>
                <div className='text-base font-medium'> {item.label}</div>
                {item.subLabel && (
                  <div className='text-sm text-textColor font-normal'> {item.subLabel}</div>
                )}
              </div>
            </Option>
          ),
          items
        )}
      </Select>
      <ErrorMessage name={props.name} component='div' className='text-xs text-red mt-1' />
    </div>
  )
}

export default FormikSelectListWithSubText
