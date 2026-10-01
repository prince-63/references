import cn from '@utils/cn'
import React from 'react'

const SectionCard = ({
  children,
  className,
  style,
}: {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}) => {
  return (
    <section
      className={cn(
        'w-full rounded-3xl border border-slate-100 md:p-4 p-2 shadow-sm gap-4 flex flex-col ',
        className
      )}
      style={style}
    >
      {children}
    </section>
  )
}

export default SectionCard
