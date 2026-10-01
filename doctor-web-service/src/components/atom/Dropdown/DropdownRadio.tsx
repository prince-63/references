import {ComponentType, SetStateAction, useEffect, useRef, useState} from 'react'
import RadioDropdown from '../Radio/RadioDropdown'
import When from '../../when/When'
import clsx from 'clsx'
import {IconProps} from '../../../types/IconProps'
import DropdownIcon from '../../../assets/icons/DropdownIcon'
import {optionType} from '../../../types/optionType'
import getColorPalette from 'utils/getColorPalette'
import cn from '@utils/cn'

interface DropdownRadioProps {
  options: optionType[]
  title: string
  name: string
  selectedOption?: optionType | null
  onChange: (option: optionType) => void | SetStateAction<optionType>
  direction: 'left' | 'right'
  icon?: ComponentType<IconProps>
  className?: string
  disable?: boolean
  dropDownBorderColor?: string
  dropDownTextColor?: string
  iconPrimaryColor?: string
}

const DropdownRadio = ({
  options,
  title,
  name,
  selectedOption,
  onChange,
  direction,
  icon,
  className,
  disable,
  dropDownBorderColor = 'border-primaryColor',
  dropDownTextColor = 'text-primaryColor',
  iconPrimaryColor = getColorPalette().primaryColor,
}: DropdownRadioProps) => {
  const [isListOpen, setIsListOpen] = useState<boolean>(false)
  const dropdownRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsListOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])
  const Icon = icon

  const handleChange = (option: optionType) => {
    onChange(option)
    setIsListOpen(false)
  }
  const horizontalPosition = direction === 'left' ? 'right-8' : 'left-8'
  return (
    <div className={`w-full relative ${className} ${disable ? 'disabled' : ''}`} ref={dropdownRef}>
      <section
        className={clsx(
          'border border-gray-500 py-2 px-4 rounded-lg cursor-pointer flex gap-4 items-center justify-between text-gray-500',
          selectedOption && dropDownBorderColor
        )}
        onClick={() => {
          setIsListOpen((prevState) => !prevState)
        }}
      >
        <When isTrue={!!icon}>
          <div className='w-3'>
            {Icon && (
              <Icon height={'16'} width={'16'} color={selectedOption ? iconPrimaryColor : 'gray'} />
            )}
          </div>
        </When>

        <span
          className={clsx('truncate w-full text-center', !!selectedOption && dropDownTextColor)}
        >
          {!selectedOption ? title : selectedOption.label}
        </span>
        <div className='w-3'>
          <DropdownIcon color={selectedOption ? iconPrimaryColor : 'gray'} />
        </div>
      </section>
      {isListOpen && (
        <section
          className={clsx(
            `w-[14rem] bg-white border border-gray-100 p-4 rounded-lg z-20 absolute shadow-lg top-12 ${horizontalPosition}`,
            'dropdownRadio'
          )}
        >
          <div className=''>{title}</div>
          <div className='mt-4 md:max-h-64 max-h-52 overflow-y-scroll dropdownRadio'>
            {options.map((option, index) => {
              return (
                <RadioDropdown
                  className={cn('mt-4 ', index === options.length - 1 && 'mb-14 md:mb-0')}
                  key={option.value}
                  value={option.value}
                  label={option.label}
                  name={name}
                  onChange={handleChange}
                  checked={option.value === selectedOption?.value}
                />
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}

export default DropdownRadio
