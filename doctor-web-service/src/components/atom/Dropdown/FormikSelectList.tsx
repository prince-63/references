import React, {useEffect, useState} from 'react'
import {useField, ErrorMessage} from 'formik'
import {Select} from 'antd'
import {SelectProps} from 'antd/lib/select'
import cn from '@utils/cn'
import map from 'ramda/src/map'

interface FormikSelectListProps extends SelectProps {
  name: string
  label?: string
  labelClassName?: string
  required?: boolean
  className?: string
  items: {
    value: any
    label: string
    [key: string]: any
  }[]
  onChangeMapperFunc?: (value: any) => any
  loading?: boolean
  onChangeSuccess?: (value: any) => void
  disabled?: boolean
  showSearch?: boolean
}

const ONES_WORDS = [
  'zero',
  'one',
  'two',
  'three',
  'four',
  'five',
  'six',
  'seven',
  'eight',
  'nine',
  'ten',
  'eleven',
  'twelve',
  'thirteen',
  'fourteen',
  'fifteen',
  'sixteen',
  'seventeen',
  'eighteen',
  'nineteen',
]

const TENS_WORDS = [
  '',
  '',
  'twenty',
  'thirty',
  'forty',
  'fifty',
  'sixty',
  'seventy',
  'eighty',
  'ninety',
]

const numberToWordsUpTo200 = (value: number): string => {
  if (!Number.isInteger(value) || value < 0 || value > 200) return String(value)
  if (value < 20) return ONES_WORDS[value]
  if (value < 100) {
    const tens = Math.floor(value / 10)
    const ones = value % 10
    return ones > 0 ? `${TENS_WORDS[tens]} ${ONES_WORDS[ones]}` : TENS_WORDS[tens]
  }
  if (value === 100) return 'one hundred'
  if (value < 200) return `one hundred ${numberToWordsUpTo200(value - 100)}`
  return 'two hundred'
}

const WORD_TO_NUMBER_MAP: Record<string, string> = (() => {
  const valueMap: Record<string, string> = {}
  for (let value = 0; value <= 200; value += 1) {
    valueMap[numberToWordsUpTo200(value)] = String(value)
  }
  return valueMap
})()

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const FormikSelectList: React.FC<FormikSelectListProps> = ({
  className,
  label,
  labelClassName,
  required,
  items,
  onChangeMapperFunc = Number,
  loading,
  onChangeSuccess,
  disabled = false,
  showSearch = true,
  ...props
}) => {
  const [field, meta, helpers] = useField(props.name)
  const [selectedValue, setSelectedValue] = useState(field.value)
  const resolveSelectedItem = (value: any) => {
    const mappedValue = onChangeMapperFunc(value)
    return items.find(
      (item) => item.value === mappedValue || String(item.value) === String(mappedValue)
    )
  }
  const normalizeNumberWords = (value: string) => {
    const normalized = value.toLowerCase().replace(/-/g, ' ').replace(/\s+/g, ' ').trim()
    if (!normalized) return ''

    return Object.entries(WORD_TO_NUMBER_MAP)
      .sort(([left], [right]) => right.length - left.length)
      .reduce((result, [word, numberValue]) => {
        const wordPattern = new RegExp(`\\b${escapeRegExp(word)}\\b`, 'g')
        return result.replace(wordPattern, numberValue)
      }, normalized)
  }
  const numberToWord = (value: string) => {
    const parsedValue = Number(value)
    if (!Number.isFinite(parsedValue)) return value
    return numberToWordsUpTo200(parsedValue)
  }

  const handleOnChange = (valSelected: any) => {
    setSelectedValue(valSelected)
    const val = resolveSelectedItem(valSelected)
    if (onChangeSuccess) {
      onChangeSuccess(val)
    }
    helpers.setValue(val?.value)
  }

  useEffect(() => {
    setSelectedValue(field.value)
  }, [field.value])

  const {Option} = Select
  const getSearchableText = (node: React.ReactNode): string => {
    if (typeof node === 'string' || typeof node === 'number') return String(node)
    if (Array.isArray(node)) return node.map((item) => getSearchableText(item)).join(' ')
    if (React.isValidElement(node)) {
      return getSearchableText((node.props as {children?: React.ReactNode})?.children)
    }
    return ''
  }

  return (
    <div className='w-full'>
      {label && (
        <label
          htmlFor={props.name}
          className={cn('text-base font-medium text-textColor mb-1', labelClassName)}
        >
          {label}
          {required && <span className='text-red ml-1'>*</span>}
        </label>
      )}
      <Select
        {...field}
        {...props}
        id={props.name}
        className={cn('w-full rounded-md', className)}
        size='large'
        status={meta.touched && meta.error ? 'error' : ''}
        onChange={handleOnChange}
        value={resolveSelectedItem(selectedValue)?.value}
        loading={loading}
        showSearch={showSearch}
        filterOption={(input, option) => {
          const normalizedInput = input.toLowerCase().trim()
          if (!normalizedInput) return true
          const numericWordNormalizedInput = normalizeNumberWords(normalizedInput)
          const explicitSearchText = String(
            (option as {searchText?: string} | undefined)?.searchText ?? ''
          ).toLowerCase()
          const optionText = getSearchableText(option?.children).toLowerCase()
          const optionValue = String(option?.value ?? '').toLowerCase()
          return (
            explicitSearchText.includes(normalizedInput) ||
            explicitSearchText.includes(numericWordNormalizedInput) ||
            optionText.includes(normalizedInput) ||
            optionValue.includes(normalizedInput) ||
            optionText.includes(numericWordNormalizedInput) ||
            optionValue.includes(numericWordNormalizedInput)
          )
        }}
        getPopupContainer={(triggerNode) => triggerNode.parentNode}
        disabled={disabled}
      >
        {map(
          (item) => (
            <Option
              key={`${props.name}-${item.value}`}
              value={item.value}
              selected={item.value === field.value}
              searchText={`${String(item.label).toLowerCase()} ${String(item.value).toLowerCase()} ${numberToWord(
                String(item.value).toLowerCase()
              )}`}
            >
              <div> {item.label}</div>
            </Option>
          ),
          items
        )}
      </Select>
      <ErrorMessage name={props.name} component='div' className='text-xs text-red mt-1' />
    </div>
  )
}

export default FormikSelectList
