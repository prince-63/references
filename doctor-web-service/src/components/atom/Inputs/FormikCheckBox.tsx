import React from 'react'
import {useField, ErrorMessage} from 'formik'
import {Checkbox, ConfigProvider} from 'antd'
import cn from '@utils/cn'
import {CheckboxChangeEvent} from 'antd/es/checkbox'
import getColorPalette from 'utils/getColorPalette'

interface FormikCheckboxProps {
  name: string
  label?: React.ReactNode
  required?: boolean
  className?: string
}

const FormikCheckbox: React.FC<FormikCheckboxProps> = ({className, label, required, ...props}) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [field, meta, helpers] = useField({...props, type: 'checkbox'})

  const handleChange = (e: CheckboxChangeEvent) => {
    const checked = e.target.checked
    helpers.setValue(checked)
  }

  return (
    <ConfigProvider
      theme={{
        token: {
          fontFamily: 'figtree',
          colorPrimary: getColorPalette().primaryColor,
          colorBorderSecondary: getColorPalette().mediumGray,
        },
      }}
    >
      <div className='w-full'>
        <Checkbox
          {...field}
          {...props}
          id={props.name}
          className={cn('', className)}
          checked={field.value}
          onChange={handleChange}
        >
          {label && (
            <label htmlFor={props.name} className='text-base font-medium mb-1 cursor-pointer'>
              {label}
              {required && <span className='text-red ml-1'>*</span>}
            </label>
          )}
        </Checkbox>
        <ErrorMessage name={props.name} component='div' className='text-xs text-red mt-1' />
      </div>
    </ConfigProvider>
  )
}

export default FormikCheckbox
