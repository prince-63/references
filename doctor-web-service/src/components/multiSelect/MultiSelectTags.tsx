import React, {useState, useEffect} from 'react'
import {ConfigProvider, Select} from 'antd'
import type {SelectProps} from 'antd'
import When from 'components/when/When'
import hasValue from 'utils/hasValue'

type TagRender = SelectProps['tagRender']

interface MultiSelectProps {
  MultiSelectType: string
  handleOnChange: (value: any) => void
  options: {id: string; value: string; label?: string}[]
  tagRender?: TagRender
  placeholder?: string
  value?: string[] | null
}

const MultiSelectTags: React.FC<MultiSelectProps> = ({
  MultiSelectType,
  handleOnChange,
  options,
  tagRender,
  placeholder = 'Type or Select Option',
  value,
}) => {
  const [inputValue, setInputValue] = useState('')
  const [customOptions, setCustomOptions]: any = useState(options)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  useEffect(() => {
    const createOption = {
      value: `__create__${inputValue}`,
      label: (
        <div>
          <When isTrue={hasValue(inputValue)}>
            <span className='font-normal text-gray-600'>
              Click on "{inputValue}" to add a new {MultiSelectType.toLowerCase()}
            </span>
          </When>
        </div>
      ),
    }
    if (
      inputValue &&
      !options.some((option) => option.value === inputValue) &&
      !customOptions.some((option: any) => option.value === createOption.value)
    ) {
      setCustomOptions([...options, createOption])
    } else {
      setCustomOptions(options)
    }
  }, [inputValue, options])

  const handleChange = (selectedOptions: any) => {
    if (dropdownOpen) {
      const createOption = selectedOptions.find((option: any) => option.startsWith('__create__'))
      if (createOption) {
        handleOnChange(
          selectedOptions.map((option: any) =>
            option.startsWith('__create__') ? option.replace('__create__', '') : option
          )
        )
      } else {
        handleOnChange(selectedOptions)
      }
    }
  }

  const handleDeselect = (deselectedOption: any) => {
    if (Array.isArray(value)) {
      const newValue = value.filter((val) => val !== deselectedOption)
      handleOnChange(newValue)
    }
  }

  const handleSearch = (searchValue: string) => {
    setInputValue(searchValue)
  }

  const handleDropdownVisibleChange = (open: boolean) => {
    setDropdownOpen(open)
    // Reset input value when dropdown is closed
    if (!open) {
      setInputValue('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && inputValue) {
      const newOption = `__create__${inputValue}`
      if (!customOptions.some((option: any) => option.value === newOption)) {
        setCustomOptions([...customOptions, {value: newOption, label: inputValue}])
        if (Array.isArray(value)) {
          handleOnChange([...value, inputValue])
        }
        setInputValue('')
      }
    }
  }

  return (
    <ConfigProvider
      theme={{
        components: {
          Select: {
            multipleItemBg: '#E9F3FA',
            fontFamily: 'Figtree',
          },
        },
      }}
    >
      <Select
        mode='tags'
        options={customOptions}
        className='w-full md:w-3/5 font-semibold'
        size='large'
        tagRender={tagRender}
        onChange={handleChange}
        onDeselect={handleDeselect}
        placeholder={placeholder}
        value={value}
        onSearch={handleSearch}
        onDropdownVisibleChange={handleDropdownVisibleChange}
        onKeyDown={handleKeyDown}
        getPopupContainer={(triggerNode) => triggerNode.parentElement}
      />
    </ConfigProvider>
  )
}

export default MultiSelectTags
