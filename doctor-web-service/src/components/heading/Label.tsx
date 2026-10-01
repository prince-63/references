import cn from '@utils/cn'

type LabelProps = {
  children: React.ReactNode
  className?: string
}

// Styled label text with Figtree, medium, 14/20, slight positive letter spacing
const Label = ({children, className}: LabelProps) => {
  return (
    <p
      className={cn(
        'font-figtree font-medium text-[14px] leading-[20px] tracking-[1%] text-textColor',
        className
      )}
    >
      {children}
    </p>
  )
}

export default Label
