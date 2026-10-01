import cn from '@utils/cn'

type PageHeadingProps = {
  children: React.ReactNode
  className?: string
}

// Styled heading with Figtree, semibold, 20/28, slight negative letter spacing
const PageHeading = ({children, className}: PageHeadingProps) => {
  return (
    <h2
      className={cn(
        'font-figtree font-semibold text-[20px] leading-[28px] tracking-[-1%] align-middle',
        className
      )}
    >
      {children}
    </h2>
  )
}

export default PageHeading
