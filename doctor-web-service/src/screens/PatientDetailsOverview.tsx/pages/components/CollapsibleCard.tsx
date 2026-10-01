import {Collapse} from 'antd'
import DropdownIcon from 'assets/icons/DropdownIcon'
import React, {ReactNode, useState} from 'react'
import {orderDetailsPanelStyles} from 'screens/Orders/constants'

const CollapsibleCard = ({
  title,
  children,
  position,
}: {
  title: string | ReactNode
  children: React.ReactNode
  position?: 'start' | 'end'
}) => {
  const [activeKey, setActiveKey] = useState('1')
  return (
    <Collapse
      bordered={false}
      activeKey={[activeKey]} // keeps it always open
      style={{
        padding: 0,
        backgroundColor: 'transparent',
      }}
      onChange={() => {
        setActiveKey(activeKey === '1' ? '' : '1')
      }}
      items={[
        {
          key: '1',
          label: <p className='text-lg font-semibold'>{title}</p>,
          children: <div className='p-4 border-b border-mediumGray'>{children}</div>,
          forceRender: true,
          styles: orderDetailsPanelStyles,
        },
      ]}
      expandIcon={({isActive}) => <DropdownIcon {...{isActive}} />}
      expandIconPosition={position ?? 'start'}
    />
  )
}

export default CollapsibleCard
