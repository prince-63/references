import {Collapse, ConfigProvider} from 'antd'
import CaretRightIcon from 'assets/icons/CaretRightIcon'
import InfoIcon from 'assets/icons/InfoIcon'
import React, {useState} from 'react'

const InfoCardWithDropdown = ({
  title,
  subTitle,
  text,
  color,
  bgColor,
  buttonText,
  onClick,
}: {
  title: string
  subTitle?: string
  text: string
  color: string
  bgColor: string
  buttonText?: string
  onClick?: () => void
}) => {
  const [activeKey, setActiveKey] = useState<string | string[]>('1') // default open

  const handleToggle = () => {
    setActiveKey((prev) => (prev === '1' ? '' : '1'))
  }

  return (
    <ConfigProvider
      theme={{
        components: {
          Collapse: {
            contentBg: 'white',
            headerPadding: 16,
            headerBg: bgColor,
            colorBorder: color,
          },
        },
        token: {
          fontFamily: 'figtree',
        },
      }}
    >
      <Collapse
        activeKey={activeKey}
        onChange={handleToggle}
        expandIconPosition='end'
        expandIcon={() => (buttonText ? null : <CaretRightIcon color='#666666' />)}
        items={[
          {
            key: '1',
            label: (
              <div className='flex md:flex-row flex-col justify-between md:items-center gap-2'>
                <div className='flex gap-2 md:items-center items-start'>
                  <InfoIcon width='20' height='20' color={color} />
                  <div>
                    <div className='font-semibold'>{title}</div>
                    <div className='text-textColor font-medium'>{subTitle}</div>
                  </div>
                </div>
                {buttonText && onClick && (
                  <button
                    type='button'
                    className='text-white bg-secondaryColor px-4 py-2 rounded-lg text-sm font-semibold flex gap-2 items-center w-fit md:ml-0 ml-5'
                    onClick={onClick}
                  >
                    {buttonText}
                    <CaretRightIcon color='white' />
                  </button>
                )}
              </div>
            ),
            children: (
              <div>
                <p className='text-textColor font-medium'>Remark:</p>
                <div>{text}</div>
              </div>
            ),
          },
        ]}
      />
    </ConfigProvider>
  )
}

export default InfoCardWithDropdown
