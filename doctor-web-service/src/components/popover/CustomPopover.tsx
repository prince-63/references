import React, {forwardRef, useImperativeHandle, useState} from 'react'
import {Popover, PopoverProps} from 'antd'

interface CustomPopoverProps extends PopoverProps {
  children: React.ReactNode
}

const CustomPopover = forwardRef((props: CustomPopoverProps, ref) => {
  const [visible, setVisible] = useState(false)

  useImperativeHandle(ref, () => ({
    close: () => setVisible(false),
  }))

  return (
    <Popover {...props} open={visible} onOpenChange={(visible) => setVisible(visible)}>
      {props.children}
    </Popover>
  )
})

CustomPopover.displayName = 'CustomPopover'

export default CustomPopover
