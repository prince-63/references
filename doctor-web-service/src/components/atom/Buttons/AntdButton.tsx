import React, {ReactNode} from 'react'
import {Button, ButtonProps} from 'antd'

interface AntdButtonInterface extends ButtonProps {
  text?: ReactNode
  isLoading?: boolean
  type?: 'primary' | 'dashed' | 'link' | 'text' | 'default'
  icon?: ReactNode
  isDisabled?: boolean
}

const AntdButton: React.FC<AntdButtonInterface> = ({
  onClick,
  text,
  isLoading,
  className = 'h-[3rem] w-full font-semibold rounded-lg bg-primaryColor hover:bg-primaryColor font-figtree ',
  type,
  icon,
  isDisabled,
  ...rest
}: AntdButtonInterface) => {
  return (
    <Button
      onClick={onClick}
      className={className}
      loading={isLoading || false}
      type={type || 'primary'}
      icon={icon}
      disabled={isDisabled}
      {...rest}
    >
      {text}
    </Button>
  )
}

export default AntdButton
