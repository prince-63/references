import clsx from 'clsx'
import RadioGroup from 'components/RadioGroup/RadioGroup'
import When from 'components/when/When'
import {FormikProps} from 'formik'
interface Option {
  value: any
  label: string
}
interface IFieldContainerForRadioGroups {
  selectedOption: string
  onOptionChange: (key: string, value: string, toggle?: boolean) => void
  options: Option[]
  name: string
  label: string
  className?: string
  radioGroupClassName?: string
  showTopLabel?: boolean
  showSideLabel?: boolean
  topLabelClassName?: string
  toggle?: boolean
  required?: boolean
  formik?: FormikProps<any>
  labelClassName?: string
  disabled?: boolean
}
const FieldContainerForRadioGroups = ({
  selectedOption,
  onOptionChange,
  options,
  name,
  label,
  className = 'md:gap-32 md:justify-normal',
  radioGroupClassName = 'md:w-24 w-14 md:rounded-[4px] rounded-lg',
  showTopLabel = false,
  showSideLabel = true,
  topLabelClassName = '',
  toggle = true,
  required,
  formik,
  labelClassName,
  disabled,
}: IFieldContainerForRadioGroups) => {
  return (
    <div>
      <div className={clsx('flex  items-center justify-between ', className)}>
        <When isTrue={showSideLabel}>
          <p className={clsx('text-textColor text-base md:text-lg md:min-w-36 ', labelClassName)}>
            {label}
            {required ? <span className='text-red ml-1'>*</span> : ''}
          </p>
        </When>
        <RadioGroup
          options={options}
          selectedOption={selectedOption}
          onOptionChange={(option: any) => onOptionChange(name, option, toggle)}
          showLabel={showTopLabel}
          className={clsx(radioGroupClassName)}
          label={label}
          labelClassName={topLabelClassName}
          required={required}
          disabled={disabled}
        />
      </div>
      <div className='text-xs text-red mt-1'>
        {formik?.touched[name] && formik?.errors[name] && (
          <div className='text-red'>{formik?.errors[name] as string}</div>
        )}
      </div>
    </div>
  )
}

export default FieldContainerForRadioGroups
