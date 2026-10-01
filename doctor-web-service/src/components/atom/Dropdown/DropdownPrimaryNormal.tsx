import {FC} from 'react'
import Select from 'react-select'
import {customStylesForDropdown} from '../../../@constants/customStylesForDropdown'
import {FormikProps} from 'formik'

interface props {
  classNameLabel?: string
  label?: string
  className?: string
  name: string
  formik?: FormikProps<any>
  required?: boolean
  options: any
  setData?: any
  defaultValue?: any
  isDisabled?: boolean
  placeholder?: string
  isSearchable?: boolean
}

const DropdownPrimaryNormal: FC<props> = ({
  className,
  classNameLabel,
  label,
  name,
  formik,
  isSearchable = true,
  required,
  options,
  setData,
  isDisabled,
  placeholder,
  defaultValue,
}) => {
  const style = `w-full h-12  rounded  ${className}`
  const labelStyle = `w-full text-bold ${classNameLabel}`
  return (
    <div>
      <div className=''>
        <label className={labelStyle} style={{color: '#666666'}}>
          {label}
          {required ? <span className='text-red ml-1'>*</span> : ''}
        </label>
      </div>
      <Select
        id={name}
        name={name}
        className={style}
        options={options}
        onChange={(selectedOption) => {
          formik?.setFieldValue(name, selectedOption)
          setData && setData(selectedOption?.value)
        }}
        onBlur={formik?.handleBlur}
        value={formik?.getFieldProps(name).value} // {formik.value} // {defaultValue}
        defaultValue={defaultValue}
        placeholder={placeholder}
        isDisabled={isDisabled}
        isSearchable={isSearchable}
        styles={customStylesForDropdown}
      />
      {formik?.touched[name] && formik?.errors[name] && (
        <div className='text-xs text-red mt-2'>
          <div className='text-red'>{`${formik?.errors[name]}`}</div>
        </div>
      )}
    </div>
  )
}

export default DropdownPrimaryNormal
