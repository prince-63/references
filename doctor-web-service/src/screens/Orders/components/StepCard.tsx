import React from 'react'
import cn from '@utils/cn'

interface StepCardProps {
  children: React.ReactNode
  className?: string
  title?: string
  subtitle?: string
  icon?: React.ReactNode
}

/**
 * A clean, modern card wrapper used on each step of the create-order flow.
 * Provides consistent spacing, rounded corners and optional header.
 */
const StepCard: React.FC<StepCardProps> = ({children, className, title, subtitle, icon}) => {
  return (
    <div
      className={cn(
        'bg-white rounded-2xl border border-mediumGray/60 shadow-sm p-5 md:p-6 w-full transition-shadow hover:shadow-md',
        className
      )}
    >
      {(title || icon) && (
        <div className='flex items-center gap-3 mb-5'>
          {icon && (
            <div className='w-10 h-10 rounded-xl bg-primarySupport text-primaryColor flex items-center justify-center shrink-0'>
              {icon}
            </div>
          )}
          <div>
            {title && <h3 className='text-lg font-semibold text-black leading-tight'>{title}</h3>}
            {subtitle && <p className='text-sm text-textColor mt-0.5'>{subtitle}</p>}
          </div>
        </div>
      )}
      {children}
    </div>
  )
}

export default StepCard
