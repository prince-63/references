import {FC} from 'react'
import Select from 'react-select'
import hasValue from '../../../utils/hasValue'
import {customStylesForDropdown} from '@constants/customStylesForDropdown'

interface props {
  classNameLabel?: string
  label?: string
  className?: string
  name: string
  formik?: any
  required?: boolean
  options: any
  placeholder?: string
  value?: any
  customStyles?: any
  emptyMessage?: string
  dropDownHeight?: number | undefined
  isSearchable?: boolean
  onChange?: (selectedOption: any) => void
  isClearable?: boolean
  isDisabled?: boolean
}

const DropdownPrimary: FC<props> = ({
  className,
  classNameLabel,
  label,
  name,
  formik,
  required,
  options,
  placeholder,
  value,
  emptyMessage,
  dropDownHeight,
  isSearchable,
  onChange,
  isClearable,
  isDisabled,
}) => {
  const style = `w-full h-12 mt-1 rounded ${className}`
  const labelStyle = `w-full text-textColor text-lg font-medium ${classNameLabel}`

  return (
    <div>
      {label && (
        <div className=''>
          <label className={labelStyle}>
            {label}
            {required ? <span className='text-red ml-1'>*</span> : ''}
          </label>
        </div>
      )}
      <Select
        id={name}
        name={name}
        className={style}
        options={options}
        onChange={(selectedOption) => {
          if (onChange) onChange(selectedOption)
          else return formik?.setFieldValue(name, selectedOption?.value || '')
        }}
        onBlur={formik?.handleBlur}
        value={options.find((option: any) => option.value === value) ?? value}
        placeholder={placeholder}
        styles={customStylesForDropdown}
        noOptionsMessage={() => (hasValue(emptyMessage) ? emptyMessage : 'No records')}
        maxMenuHeight={dropDownHeight}
        isSearchable={isSearchable}
        isClearable={isClearable}
        isDisabled={isDisabled}
      />
      {formik?.touched?.[name] && formik?.errors?.[name] && (
        <div className='text-xs text-red '>
          <div className='text-red'>{formik.errors[name]}</div>
        </div>
      )}
    </div>
  )
}

export default DropdownPrimary
