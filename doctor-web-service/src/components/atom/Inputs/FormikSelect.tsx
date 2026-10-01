import React from 'react'
import {useField, ErrorMessage} from 'formik'
import {Select, ConfigProvider} from 'antd'
import {SelectProps} from 'antd/es/select'
import cn from '@utils/cn'

interface OptionType {
  label: string
  value: string | number
}

interface FormikSelectProps extends Omit<SelectProps, 'onChange'> {
  name: string
  label?: string
  required?: boolean
  className?: string
  options?: OptionType[]
  isReturnObject?: boolean
  onChange?: (value: any, option: any, ...rest: any[]) => void
}

const FormikSelect: React.FC<FormikSelectProps> = ({
  name,
  label,
  required,
  className,
  options = [],
  isReturnObject = false,
  onChange,
  ...props
}) => {
  const [field, meta, helpers] = useField(name)
  const opts = Array.isArray(options) ? options : []
  const sanitizedOptions = React.useMemo(() => {
    const seen = new Set<string>()

    return opts
      .filter((opt): opt is OptionType => opt !== null && typeof opt !== 'undefined')
      .filter((opt) => opt.value !== null && typeof opt.value !== 'undefined')
      .filter((opt) => {
        const key = String(opt.value)
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })
  }, [opts])

  // Convert Formik value to correct shape
  const getSelectValue = () => {
    // Treat only null/undefined as empty; allow 0 as a valid value
    const fv = field?.value as any
    if (fv === null || typeof fv === 'undefined') return undefined

    // If Formik already holds a labelInValue-like object, try to return it directly
    if (typeof fv === 'object' && fv !== null && 'value' in fv && 'label' in fv) {
      const matchedObj = sanitizedOptions.find((opt) => String(opt.value) === String(fv.value))
      return matchedObj ? {label: matchedObj.label, value: matchedObj.value} : fv
    }

    // Otherwise, match by value (coerce to string to avoid number/string mismatch)
    const matched = sanitizedOptions.find((opt) => String(opt.value) === String(fv))

    return matched ? {label: matched.label, value: matched.value} : undefined
  }

  return (
    <ConfigProvider theme={{token: {fontFamily: 'figtree'}}}>
      <div className='w-full'>
        {label && (
          <label className='block text-base font-medium text-textColor mb-1'>
            {label}
            {required && <span className='text-red ml-1'>*</span>}
          </label>
        )}
        <Select
          labelInValue
          {...props}
          id={name}
          className={cn('w-full h-12', className)}
          options={sanitizedOptions}
          value={getSelectValue()}
          onChange={(value, option) => {
            // Handle clear
            if (!value) {
              helpers.setValue(undefined)
              onChange?.(value as any, option as any)
              return
            }
            helpers.setValue(isReturnObject ? value : (value as any).value)
            onChange?.(value as any, option as any)
          }}
          onBlur={() => helpers.setTouched(true)}
          status={meta.touched && meta.error ? 'error' : ''}
        />
        <ErrorMessage name={name} component='div' className='text-xs text-red mt-1' />
      </div>
    </ConfigProvider>
  )
}

export default FormikSelect
