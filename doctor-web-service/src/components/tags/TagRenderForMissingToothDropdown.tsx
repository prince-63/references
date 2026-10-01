import {Tag} from 'antd'
import type {SelectProps} from 'antd'
import crossIcon from 'assets/icons/CrossIcon.svg'
import getColorPalette from 'utils/getColorPalette'

type TagRender = SelectProps['tagRender']

export const TagRenderForMissingToothDropdown: TagRender = (props) => {
  const color = getColorPalette().secondarySupport
  const colorText = getColorPalette().secondaryColor
  const {label, closable, onClose} = props
  const onPreventMouseDown = (event: React.MouseEvent<HTMLSpanElement>) => {
    event.preventDefault()
    event.stopPropagation()
  }

  return (
    <Tag
      color={colorText}
      onMouseDown={onPreventMouseDown}
      closable={closable}
      onClose={onClose}
      style={{
        backgroundColor: color,
        color: colorText,
        padding: '5px 7px',
        display: 'flex',
        alignItems: 'center',
        gap: '3px',
        borderRadius: '4px',
        marginTop: '4px',
        marginBottom: '4px',
        minWidth: '87px',
        fontFamily: 'Figtree',
      }}
      closeIcon={<img src={crossIcon} className='pl-1 ml-4 mt-[1px]' />}
    >
      {<span className='text-base font-semibold ml-3'>{label}</span>}
    </Tag>
  )
}
