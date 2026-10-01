import cn from '@utils/cn'
import {Tooltip} from 'antd'

const TextWithTooltip = ({
  children,
  className,
  desktopCharacterCount = 50,
}: {
  children: React.ReactNode
  desktopCharacterCount?: number
  className?: string
}) => {
  const text = children?.toString() || ''

  return (
    <Tooltip
      title={text}
      overlayClassName='fixed'
      zIndex={1000}
      overlayInnerStyle={{
        borderRadius: '8px',
        padding: '4px 8px',
        fontFamily: 'figtree',
        fontSize: '14px',
        fontWeight: 500,
      }}
      arrow={false}
      placement='topLeft'
    >
      <div className={cn('break-all lg:block hidden', className)}>
        {text.length > desktopCharacterCount ? `${text.slice(0, desktopCharacterCount)}...` : text}
      </div>
      <div className={cn('break-all  lg:hidden', className)}>
        {text.length > 25 ? `${text.slice(0, 25)}...` : text}
      </div>
    </Tooltip>
  )
}

export default TextWithTooltip
