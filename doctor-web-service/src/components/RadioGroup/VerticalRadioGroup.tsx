import cn from '@utils/cn'
import {useFormikContext} from 'formik'
import React, {useState} from 'react'

const VerticalRadioGroup = ({
  name,
  options,
  labelClassName,
}: {
  name: string
  options: {value: string; label: React.ReactNode}[]
  labelClassName?: string
}) => {
  const formik = useFormikContext<any>()
  const [selectedOption, setSelectedOption] = useState<string>(formik.values?.[name] ?? '')

  return (
    <div key={name}>
      <div className='flex flex-col '>
        {options.map((option) => {
          const inputId = `${option.value}_${name}`
          return (
            <div key={inputId} className={cn('flex items-center gap-3 py-2 rounded-[4px]')}>
              <input
                type='radio'
                id={inputId}
                name={name}
                className='form-radio h-5 w-5 accent-primaryColor cursor-pointer'
                value={option.value}
                checked={selectedOption === option.value}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  formik.setFieldValue(name, event.target.value)
                  setSelectedOption(option.value)
                }}
              />
              <label
                htmlFor={inputId}
                className={cn('text-base cursor-pointer w-full ', labelClassName)}
              >
                {option.label}
              </label>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default VerticalRadioGroup
