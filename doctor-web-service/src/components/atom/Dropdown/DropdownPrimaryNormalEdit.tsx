import {FC, useEffect} from 'react'
import Select from 'react-select'
import {customStylesForDropdown} from '../../../@constants/customStylesForDropdown'

interface props {
  classNameLabel?: string
  label?: string
  className?: string
  name: string
  formik?: any
  required?: boolean
  options: any
  setData?: any
  defaultValue?: any
}

const DropdownPrimaryNormalEdit: FC<props> = ({
  className,
  classNameLabel,
  label,
  name,
  formik,
  required,
  options,
  setData,
  defaultValue,
}) => {
  const style = `w-full h-12  rounded  ${className}`
  const labelStyle = `w-full text-bold ${classNameLabel}`

  useEffect(() => {
    formik.setFieldValue(name, defaultValue?.value || '')
    setData(defaultValue?.value)
  }, [])

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
          formik.setFieldValue(name, selectedOption?.value || '')
          setData(selectedOption?.value)
        }}
        onBlur={formik.handleBlur}
        value={formik.value} // {formik.value} // {defaultValue}
        defaultValue={defaultValue}
        styles={customStylesForDropdown}
      />
      <div className='text-xs text-red mt-1'>
        {formik.touched[name] && formik.errors[name] && (
          <div className='text-red'>{formik.errors[name]}</div>
        )}
      </div>
    </div>
  )
}

export default DropdownPrimaryNormalEdit
