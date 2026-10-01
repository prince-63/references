import React from 'react'
import {useField, ErrorMessage} from 'formik'
import {TimePicker, ConfigProvider} from 'antd'
import {TimePickerProps} from 'antd/lib/time-picker'
import cn from '@utils/cn'
import dayjs from 'dayjs'

interface FormikTimePickerProps extends TimePickerProps {
  name: string
  label?: string
  required?: boolean
  className?: string
}

const FormikTimePicker: React.FC<FormikTimePickerProps> = ({
  className,
  label,
  required,
  ...props
}) => {
  const [field, meta, helpers] = useField(props.name)

  const handleChange = (time: dayjs.Dayjs | null, timeString: string | string[]) => {
    if (Array.isArray(timeString)) {
      helpers.setValue(timeString.join(', '))
    } else {
      helpers.setValue(timeString)
    }
  }

  return (
    <ConfigProvider theme={{token: {fontFamily: 'figtree'}}}>
      <div className='w-full'>
        {label && (
          <label htmlFor={props.name} className='block text-base font-medium text-textColor mb-1'>
            {label}
            {required && <span className='text-red ml-1'>*</span>}
          </label>
        )}
        <TimePicker
          {...props}
          id={props.name}
          placement='topLeft'
          size='small'
          format='h:mm A'
          showNow
          needConfirm={false}
          use12Hours
          className={cn(
            'w-full p-2 border rounded-md',
            className,
            props.readOnly && 'text-grayDisabled'
          )}
          status={meta.touched && meta.error ? 'error' : ''}
          onChange={handleChange}
          value={field.value ? dayjs(field.value, 'h:mm A') : null}
          inputReadOnly // Make the input read-only
        />
        <ErrorMessage name={props.name} component='div' className='text-xs text-red mt-1' />
      </div>
    </ConfigProvider>
  )
}

export default FormikTimePicker
