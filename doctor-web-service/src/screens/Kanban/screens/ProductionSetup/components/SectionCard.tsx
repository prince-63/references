const SectionCard = ({
  id,
  icon,
  title,
  subtitle,
  children,
}: {
  id: string
  icon: React.ReactNode | null
  title: string
  subtitle?: string
  children: React.ReactNode
}) => {
  return (
    <section id={id} className='mb-6'>
      <div className='rounded-lg border border-neutral-200 bg-white p-4 md:p-6 shadow-sm'>
        <div className='mb-4 flex items-start justify-between gap-3'>
          <div className='flex items-center gap-3'>
            {icon && (
              <div className='flex h-10 w-10 items-center justify-center rounded-2xl bg-neutral-100'>
                {icon}
              </div>
            )}
            <div>
              <h2 className='font-medium leading-tight text-neutral-900 text-base md:text-xl'>
                {title}
              </h2>
              {subtitle && <p className='mt-0.5 text-xs text-neutral-500'>{subtitle}</p>}
            </div>
          </div>
        </div>
        {children}
      </div>
    </section>
  )
}

export default SectionCard
