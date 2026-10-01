import {FC, useState} from 'react'
import CreatableSelect from 'react-select/creatable'
import {customStylesForDropdown} from '../../../@constants/customStylesForDropdown'
import {FormikProps} from 'formik'

interface Option {
  label: string
  value: string
}
interface props {
  selectedBrandName?: string
  classNameLabel?: string
  label?: string
  className?: string
  name: string
  formik?: FormikProps<any>
  required?: boolean
  options: any
  placeholder?: string
  value?: any
  setSelectedBrandName?: any
  defaultValue?: any
  handleOnChange?: (option: Option) => void
  handleOnCreate: (option: Option) => void
  createLabel?: string
  disable?: boolean
}

const DropdownPrimaryCreatable: FC<props> = ({
  className,
  classNameLabel,
  label,
  name,
  formik,
  required,
  options,
  placeholder,
  value,
  handleOnChange,
  handleOnCreate,
  setSelectedBrandName,
  createLabel = 'Create new brand with',
  disable,
}) => {
  const style = `w-full h-12  rounded ${className}`
  const labelStyle = `w-full text-textColor text-lg font-medium ${classNameLabel}`
  const [errorMessage, setErrorMessage] = useState('')
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const callSetOption = (selectedOption: any) => {
    setErrorMessage('')
    handleOnChange && handleOnChange(selectedOption)
  }
  const createOption = (label: string) => ({
    label,
    value: label,
  })

  const handleCreate = (inputValue: string) => {
    formik?.setFieldTouched(name, true)
    if (inputValue.length >= 2 && inputValue.length <= 100) {
      const newOption = createOption(inputValue)
      handleOnCreate(newOption)
      setErrorMessage('')
    } else if (inputValue.length > 100) {
      setErrorMessage('Brand name field is not accepting more than 100 characters.')
      formik?.setFieldError(name, 'Brand name field is not accepting more than 100 characters.')
    } else if (inputValue.length < 2) {
      formik?.setFieldError(name, 'Please enter a valid brand name with more than 2 characters')
      setSelectedBrandName && setSelectedBrandName(null)
    }
  }
  const callDropdownOpen = (searchedBrandName: any) => {
    if (searchedBrandName.length >= 1) {
      setIsMenuOpen(true)
    } else {
      setIsMenuOpen(false)
    }
  }
  return (
    <div>
      <div className=''>
        <label className={labelStyle} style={{color: '#666666'}}>
          {label}
          {required ? <span className='text-red ml-1'>*</span> : ''}
        </label>
      </div>
      <CreatableSelect
        formatCreateLabel={(value) => `+ ${createLabel} " ${value} " name`}
        isClearable={true}
        id={name}
        name={name}
        className={style}
        options={options}
        onInputChange={(selectedOption) => callDropdownOpen(selectedOption)}
        onChange={(selectedOption) => {
          formik?.setFieldValue(name, selectedOption)
          callSetOption(selectedOption)
        }}
        onBlur={formik?.handleBlur}
        value={
          value
            ? value?.label !== undefined && value?.label !== '' && value
            : formik?.getFieldProps(name).value
        }
        placeholder={placeholder}
        onCreateOption={handleCreate}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault()
          }
        }}
        styles={{
          ...customStylesForDropdown,
          dropdownIndicator: (provided: any) => ({
            ...provided,
            display: 'none',
          }),
        }}
        maxMenuHeight={200}
        menuIsOpen={isMenuOpen}
        isDisabled={disable}
      />
      <div className='text-xs text-red mt-2'>
        {formik?.touched[name] && formik?.errors[name] && (
          <div className='text-red'>{String(formik?.errors[name])}</div>
        )}
        {errorMessage && <div className='text-red'>{errorMessage}</div>}
      </div>
    </div>
  )
}

export default DropdownPrimaryCreatable
