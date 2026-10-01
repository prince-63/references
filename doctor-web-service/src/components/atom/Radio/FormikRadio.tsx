import React, {useEffect, useState} from 'react'
import {useField, ErrorMessage} from 'formik'
import cn from '@utils/cn'
import ActiveRadioIcon from 'assets/icons/ActiveRadioIcon'
import clsx from 'clsx'

interface RadioOption {
  label: string
  value: string | number
  subLabel: string
}

interface FormikRadioButtonsWithStyleProps {
  name: string
  label?: string
  required?: boolean
  items: RadioOption[]
  className?: string
  disabled?: boolean
  classNameForRadio?: string
}

const FormikRadio: React.FC<FormikRadioButtonsWithStyleProps> = ({
  name,
  label,
  required,
  items,
  className,
  disabled = false,
  classNameForRadio,
}) => {
  const [field, , helpers] = useField(name)
  const [selectedValue, setSelectedValue] = useState(field.value)

  const handleClick = (value: string | number) => {
    if (disabled) return
    setSelectedValue(value)
    helpers.setValue(value)
  }

  useEffect(() => {
    setSelectedValue(field.value)
  }, [field.value])

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label htmlFor={name} className='text-base font-medium text-textColor mb-2 block'>
          {label}
          {required && <span className='text-red ml-1'>*</span>}
        </label>
      )}

      <div className={clsx('flex flex-col gap-3', classNameForRadio)}>
        {items.map((item) => {
          const isSelected = item.value === selectedValue

          return (
            <div
              key={item.value}
              className={clsx(
                'flex items-center gap-2 p-3 border rounded-lg text-sm cursor-pointer',
                isSelected
                  ? 'border-primaryColor bg-purple-50 text-primaryColor'
                  : 'border-mediumGray text-textColor',
                disabled && 'cursor-not-allowed opacity-50'
              )}
              onClick={() => handleClick(item.value)}
            >
              {isSelected ? (
                <ActiveRadioIcon />
              ) : (
                <div className='w-[17px] h-[17px] rounded-full border border-mediumGray'></div>
              )}
              <div>
                <span className='text-black font-medium'>{item.label}</span>
                <div className='text-sm text-textColor'>{item.subLabel}</div>
              </div>
            </div>
          )
        })}
      </div>

      <ErrorMessage name={name} component='div' className='text-xs text-red mt-1' />
    </div>
  )
}

export default FormikRadio
