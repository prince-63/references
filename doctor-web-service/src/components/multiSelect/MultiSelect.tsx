import React from 'react'
import {Select} from 'antd'
import type {SelectProps} from 'antd'
import clsx from 'clsx'

type TagRender = SelectProps['tagRender']

interface MultiSelectProps {
  handleOnChange: (value: any) => void
  options: {value: string; label?: string}[]
  tagRender?: TagRender
  placeholder?: string
  value?: number[] | string[] | null
  className?: string
}

const MultiSelect: React.FC<MultiSelectProps> = ({
  handleOnChange,
  options,
  tagRender,
  placeholder = 'Type or Select Option',
  value,
  className,
}) => {
  return (
    <Select
      mode='multiple'
      options={options}
      className={clsx('w-full break-words', className)}
      size='large'
      tagRender={tagRender}
      onChange={handleOnChange}
      placeholder={placeholder}
      value={value}
      getPopupContainer={(triggerNode) => triggerNode.parentElement}
      maxTagTextLength={20}
    />
  )
}

export default MultiSelect
