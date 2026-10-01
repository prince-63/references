import cn from '@utils/cn'

type TextProps = {
  children: React.ReactNode
  className?: string
}

// Base text with Figtree regular 16/24
const Text = ({children, className}: TextProps) => {
  return (
    <p
      className={cn('font-figtree font-normal text-[16px] leading-[24px] tracking-[0%]', className)}
    >
      {children}
    </p>
  )
}

export default Text
