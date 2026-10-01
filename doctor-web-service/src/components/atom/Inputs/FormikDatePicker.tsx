import React, {useEffect} from 'react'
import {useField, ErrorMessage} from 'formik'
import {DatePicker, ConfigProvider} from 'antd'
import {DatePickerProps} from 'antd/lib/date-picker'
import cn from '@utils/cn'
import dayjs from 'dayjs'
import getColorPalette from 'utils/getColorPalette'

interface FormikDatePickerProps extends DatePickerProps {
  name: string
  label?: string
  required?: boolean
  className?: string
  onChangeCallback?: (date: dayjs.Dayjs | null) => void
}

const FormikDatePicker: React.FC<FormikDatePickerProps> = ({
  className,
  label,
  required,
  onChangeCallback,
  ...props
}) => {
  const [field, meta, helpers] = useField(props.name)
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
  const isMobile = window.innerWidth < 768

  const handleChange = (date: dayjs.Dayjs | null) => {
    if (date) {
      helpers.setValue(date.toISOString())
      onChangeCallback && onChangeCallback(date)
    } else {
      helpers.setValue('')
    }
  }

  // Add CSS for iOS scrolling fix
  useEffect(() => {
    if (isIOS) {
      const style = document.createElement('style')
      style.textContent = `
        /* Main panel container */
        .custom-datePicker-popup .ant-picker-panel-container {
          -webkit-overflow-scrolling: touch !important;
          overflow-x: auto !important;
          overflow-y: hidden !important;
          width: 100% !important;
        }
        
        .custom-datePicker-popup .ant-picker-panel {
          min-width: 100% !important;
          overflow-x: auto !important;
          -webkit-overflow-scrolling: touch !important;
        }
        
        .custom-datePicker-popup .ant-picker-body {
          overflow-x: auto !important;
          -webkit-overflow-scrolling: touch !important;
        }
        
        .custom-datePicker-popup .ant-picker-content {
          min-width: 280px !important;
          overflow-x: auto !important;
          -webkit-overflow-scrolling: touch !important;
        }

        /* Time panel specific fixes */
        .custom-datePicker-popup .ant-picker-time-panel {
          overflow-x: auto !important;
          -webkit-overflow-scrolling: touch !important;
          width: 100% !important;
          min-width: 200px !important;
        }

        .custom-datePicker-popup .ant-picker-time-panel-column {
          flex-shrink: 0 !important;
          min-width: 60px !important;
          overflow-y: auto !important;
          -webkit-overflow-scrolling: touch !important;
        }

        /* Ensure all time columns are visible and scrollable */
        .custom-datePicker-popup .ant-picker-time-panel-content {
          display: flex !important;
          overflow-x: auto !important;
          -webkit-overflow-scrolling: touch !important;
          width: 100% !important;
          min-width: 180px !important; /* Ensure space for hour + minute + AM/PM */
        }

        /* Force AM/PM column to be visible */
        .custom-datePicker-popup .ant-picker-time-panel-column:last-child {
          display: block !important;
          visibility: visible !important;
          opacity: 1 !important;
          min-width: 60px !important;
          flex-shrink: 0 !important;
        }

        /* Fix for date cells on iOS */
        .custom-datePicker-popup .ant-picker-cell {
          touch-action: manipulation;
        }

        /* Ensure time picker is fully expanded */
        .custom-datePicker-popup .ant-picker-time-panel-cell {
          touch-action: manipulation;
          padding: 4px 8px !important;
        }

        /* Force horizontal layout for time columns */
        .custom-datePicker-popup .ant-picker-time-panel-content {
          flex-direction: row !important;
          justify-content: flex-start !important;
          align-items: flex-start !important;
        }
      `
      document.head.appendChild(style)

      return () => {
        document.head.removeChild(style)
      }
    }
  }, [isIOS])

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
        {label && (
          <label className='block text-base font-medium text-textColor mb-1'>
            {label}
            {required && <span className='text-red ml-1'>*</span>}
          </label>
        )}
        <DatePicker
          {...props}
          id={props.name}
          getPopupContainer={() => document.body}
          placement={isMobile ? 'bottomLeft' : 'topRight'}
          size='small'
          className={cn(
            'w-full border rounded-md h-10',
            className,
            props.readOnly && 'text-grayDisabled'
          )}
          popupClassName={cn('custom-datePicker-popup', isIOS && 'ios-datepicker-fix')}
          status={meta.touched && meta.error ? 'error' : ''}
          onChange={handleChange}
          value={field.value ? dayjs(field.value) : null}
          inputReadOnly={!isIOS}
          {...(isIOS && {
            allowClear: true,
            showToday: false,
            ...(props.showTime && {
              showTime: {
                use12Hours: true,
                format: 'h:mm A',
                ...(typeof props.showTime === 'object' && props.showTime ? props.showTime : {}),
              },
            }),
          })}
        />
        <ErrorMessage name={props.name} component='div' className='text-xs text-red mt-1' />
      </div>
    </ConfigProvider>
  )
}

export default FormikDatePicker
