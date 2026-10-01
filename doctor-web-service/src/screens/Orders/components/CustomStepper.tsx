import React from 'react'
import cn from '@utils/cn'
import {Check} from 'lucide-react'

export type StepStatus = 'finish' | 'process' | 'wait' | 'error'

export interface CustomStepItem {
  title: string
  id: number
  status?: StepStatus
  disabled?: boolean
  description?: string
  icon?: React.ReactNode
}

interface CustomStepperProps {
  items: CustomStepItem[]
  current: number
  onChange?: (step: number) => void
  direction?: 'horizontal' | 'vertical'
  className?: string
}

const StepIcon = ({
  index,
  status,
  isActive,
}: {
  index: number
  status: StepStatus
  isActive: boolean
}) => {
  if (status === 'finish') {
    return (
      <div className='w-8 h-8 rounded-full bg-primaryColor flex items-center justify-center shadow-sm'>
        <Check className='w-4 h-4 text-white' strokeWidth={3} />
      </div>
    )
  }

  if (isActive) {
    return (
      <div className='w-8 h-8 rounded-full bg-primaryColor flex items-center justify-center shadow-colorPrimary'>
        <span className='text-white text-sm font-bold'>{index + 1}</span>
      </div>
    )
  }

  return (
    <div className='w-8 h-8 rounded-full bg-lightGray border-2 border-mediumGray flex items-center justify-center'>
      <span className='text-textColor text-sm font-medium'>{index + 1}</span>
    </div>
  )
}

const CustomStepper: React.FC<CustomStepperProps> = ({
  items,
  current,
  onChange,
  direction = 'horizontal',
  className,
}) => {
  const isVertical = direction === 'vertical'

  if (isVertical) {
    return (
      <div className={cn('flex flex-col gap-0', className)}>
        {items.map((item, index) => {
          const isActive = index === current
          const status =
            item.status || (index < current ? 'finish' : index === current ? 'process' : 'wait')
          const isLast = index === items.length - 1

          return (
            <div key={item.id} className='flex items-stretch'>
              {/* Icon + Connector line */}
              <div className='flex flex-col items-center'>
                <button
                  type='button'
                  disabled={item.disabled}
                  onClick={() => !item.disabled && onChange?.(index)}
                  className={cn(
                    'flex items-center justify-center transition-all duration-200 cursor-pointer',
                    item.disabled && 'opacity-40 cursor-not-allowed'
                  )}
                >
                  <StepIcon index={index} status={status} isActive={isActive} />
                </button>
                {!isLast && (
                  <div
                    className={cn(
                      'w-0.5 flex-1 min-h-[32px] my-1 rounded-full transition-colors duration-300',
                      status === 'finish' ? 'bg-primaryColor' : 'bg-mediumGray'
                    )}
                  />
                )}
              </div>

              {/* Label */}
              <div className='ml-3 pb-6'>
                <button
                  type='button'
                  disabled={item.disabled}
                  onClick={() => !item.disabled && onChange?.(index)}
                  className={cn(
                    'text-left transition-all duration-200',
                    item.disabled && 'opacity-40 cursor-not-allowed',
                    !item.disabled && 'cursor-pointer'
                  )}
                >
                  <p
                    className={cn(
                      'text-sm font-medium leading-tight transition-colors duration-200',
                      isActive && 'text-primaryColor font-semibold',
                      status === 'finish' && !isActive && 'text-black',
                      status === 'wait' && 'text-textColor'
                    )}
                  >
                    {item.title}
                  </p>
                  {item.description && (
                    <p className='text-xs text-textColor mt-0.5'>{item.description}</p>
                  )}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  // Horizontal stepper
  return (
    <div className={cn('flex items-center w-full', className)}>
      {items.map((item, index) => {
        const isActive = index === current
        const status =
          item.status || (index < current ? 'finish' : index === current ? 'process' : 'wait')
        const isLast = index === items.length - 1

        return (
          <React.Fragment key={item.id}>
            <button
              type='button'
              disabled={item.disabled}
              onClick={() => !item.disabled && onChange?.(index)}
              className={cn(
                'flex items-center gap-2 transition-all duration-200 whitespace-nowrap',
                item.disabled && 'opacity-40 cursor-not-allowed',
                !item.disabled && 'cursor-pointer'
              )}
            >
              <StepIcon index={index} status={status} isActive={isActive} />
              <span
                className={cn(
                  'text-sm font-medium transition-colors duration-200 hidden sm:inline',
                  isActive && 'text-primaryColor font-semibold',
                  status === 'finish' && !isActive && 'text-black',
                  status === 'wait' && 'text-textColor'
                )}
              >
                {item.title}
              </span>
            </button>
            {!isLast && (
              <div
                className={cn(
                  'flex-1 h-0.5 mx-3 rounded-full transition-colors duration-300 min-w-[24px]',
                  status === 'finish' ? 'bg-primaryColor' : 'bg-mediumGray'
                )}
              />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}

export default CustomStepper
