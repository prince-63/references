import clsx from 'clsx'
import BackGroundSVG from 'components/atom/SVG/BackGroundSVG'
import React, {useEffect, useState} from 'react'

interface Option {
  value: any
  active: boolean
  icon: any
  iconDisabled: any
  title: string
  subTitle: string
}

interface RadioGroupCardProps {
  options: Option[]
  selectedOption: string
  onOptionChange: (option: string) => void
  className?: string
}

const RadioGroupCard: React.FC<RadioGroupCardProps> = ({
  options,
  selectedOption,
  onOptionChange,
  className = 'rounded-3xl w-32',
}) => {
  const [isResponsive, setIsResponsive] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      setIsResponsive(window.innerWidth <= 768)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div className='flex flex-col md:flex-row gap-4 cursor-pointer'>
      {options.map((option) => {
        return (
          <div
            key={option.value}
            className={clsx(
              `${
                selectedOption === option.value
                  ? 'bg-primarySupport text-primaryColor border border-primaryColor '
                  : 'bg-white text-textColor border border-mediumGray '
              } flex flex-col justify-between w-full h-full md:w-[249px] md:h-[200px] md:p-2.5 p-4 md:rounded-2xl rounded-lg font-medium text-xs cursor-pointer'`,
              className
            )}
            onClick={() => onOptionChange(option.value)}
          >
            <div className='flex justify-between items-center mt-[10px]'>
              <BackGroundSVG
                width={isResponsive ? '20' : '24'}
                height={isResponsive ? '20' : '24'}
                color='transparent'
                svg={option.value ? option.icon : option.iconDisabled}
                className={clsx(
                  'md:w-[57px] md:h-[57px] w-10 h-10 rounded-full',
                  option.active ? 'bg-white' : 'bg-lightGray'
                )}
              />
            </div>
            <div>
              <div className="text-black text-xl font-semibold font-['Figtree'] leading-7  mt-3">
                {option.title}
              </div>

              <div className=' text-textColor font-base text-[14px] mt-2  leading-tight'>
                {option.subTitle}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default RadioGroupCard
