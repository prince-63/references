import React, {useEffect, useState} from 'react'
import {useField, ErrorMessage} from 'formik'
import {Select, ConfigProvider} from 'antd'
import {SelectProps} from 'antd/lib/select'
import cn from '@utils/cn'
import map from 'ramda/src/map'
import ActiveRadioIcon from 'assets/icons/ActiveRadioIcon'
import clsx from 'clsx'

interface FormikSelectListProps extends SelectProps {
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

const FormikSelectListWithRadio: React.FC<FormikSelectListProps> = ({
  className,
  label,
  required,
  items,
  onChangeMapperFunc = Number,
  loading,
  onChangeSuccess,
  disabled = false,
  ...props
}) => {
  const [field, meta, helpers] = useField(props.name)
  const [selectedValue, setSelectedValue] = useState(field.value)

  const handleOnChange = (valSelected: any) => {
    setSelectedValue(valSelected)
    const val = items.find((item) => item.value === onChangeMapperFunc(valSelected))
    if (onChangeSuccess) {
      onChangeSuccess(val)
    }
    helpers.setValue(val?.value)
  }

  useEffect(() => {
    setSelectedValue(field.value)
  }, [field.value])

  const {Option} = Select

  return (
    <ConfigProvider theme={{token: {fontFamily: 'figtree'}}}>
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
          status={meta.touched && meta.error ? 'error' : ''}
          onChange={handleOnChange}
          value={items.find((item) => item.value === onChangeMapperFunc(selectedValue))}
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
              <Option
                key={`${props.name}-${item.value}`}
                value={item.value}
                selected={item.value === field.value}
              >
                <div
                  className={cn(
                    `${
                      item.value === field.value
                        ? ' text-primaryColor'
                        : ` text-textColor ${
                            disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
                          }`
                    } flex gap-1 items-center font-normal`,
                    className
                  )}
                >
                  {item.value === field.value ? (
                    <ActiveRadioIcon />
                  ) : (
                    <div
                      className={clsx(
                        'w-[17px] h-[17px] rounded-full flex justify-start border border-mediumGray mr-1'
                      )}
                    ></div>
                  )}

                  <div>{item.label}</div>
                </div>
              </Option>
            ),
            items
          )}
        </Select>
        <ErrorMessage name={props.name} component='div' className='text-xs text-red mt-1' />
      </div>
    </ConfigProvider>
  )
}

export default FormikSelectListWithRadio
