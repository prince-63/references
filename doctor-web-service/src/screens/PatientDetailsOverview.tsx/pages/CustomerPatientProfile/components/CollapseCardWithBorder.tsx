import {Collapse} from 'antd'
import React, {ReactNode, useState} from 'react'
import {orderDetailsPanelStyles} from 'screens/Orders/constants'
import clsx from 'clsx'
import {ChevronDown} from 'lucide-react'
import SectionCard from './SectionCard'

const CollapseCardWithBorder = ({
  title,
  children,
  position,
  defaultOpen = false,
  forceOpen = false,
  sectionClassName,
  sectionStyle,
  collapseClassName,
}: {
  title: string | ReactNode
  children: React.ReactNode
  position?: 'start' | 'end'
  defaultOpen?: boolean
  forceOpen?: boolean
  sectionClassName?: string
  sectionStyle?: React.CSSProperties
  collapseClassName?: string
}) => {
  const [activeKey, setActiveKey] = useState(defaultOpen || forceOpen ? '1' : '')
  const resolvedActiveKey = forceOpen ? '1' : activeKey
  return (
    <SectionCard
      className={clsx('border border-mediumGray', sectionClassName)}
      style={sectionStyle}
    >
      <Collapse
        bordered={false}
        activeKey={[resolvedActiveKey]}
        className={clsx(
          'w-full rounded-3xl bg-white gap-4 flex flex-col !shadow-none',
          collapseClassName
        )}
        onChange={() => {
          if (forceOpen) return
          setActiveKey(activeKey === '1' ? '' : '1')
        }}
        items={[
          {
            key: '1',
            label: title,
            children: children,
            forceRender: true,
            styles: orderDetailsPanelStyles,
          },
        ]}
        expandIcon={({isActive}) => (
          <div
            className={clsx(`${isActive ? 'rotate-180' : 'rotate-0'} transition-all duration-500`)}
          >
            <ChevronDown color='#d9d9d9' />
          </div>
        )}
        expandIconPosition={position ?? 'start'}
      />
    </SectionCard>
  )
}

export default CollapseCardWithBorder
