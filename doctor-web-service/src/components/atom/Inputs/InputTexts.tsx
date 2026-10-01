import {FC} from 'react'

interface props {
  classNameLabel?: string
  label?: string
  className?: string
  name: string
  formik?: any
}

const InputTexts: FC<props> = ({className, classNameLabel, label, name, formik}) => {
  const style = `w-full px-2 h-12 border rounded  ${className}`
  const labelStyle = `w-full text-bold ${classNameLabel}`
  return (
    <div>
      <label className={labelStyle}>{label}</label>
      <input
        type='text'
        id={name}
        name={name}
        className={style}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        value={formik.values[name]}
      />
      <div className='text-xs text-red mt-1'>
        {formik.touched[name] && formik.errors[name] && (
          <div className='text-red'>{formik.errors[name]}</div>
        )}
      </div>
    </div>
  )
}

export default InputTexts
