import cn from '@utils/cn'
import {ConfigProvider, Tooltip} from 'antd'
import When from 'components/when/When'
import {ReactNode, useMemo, useState} from 'react'

interface ICard {
  icon: ReactNode
  title: ReactNode
  children: ReactNode
  showButton?: boolean
  isButtonDisabled?: boolean
  onClick?: () => void
  titleClassName?: string
}

const DashboardCard = (props: ICard) => {
  const {icon, title, children, showButton, onClick, isButtonDisabled, titleClassName} = props

  const [arrow] = useState('Show')

  const mergedArrow = useMemo(() => {
    if (arrow === 'Hide') {
      return false
    }
    if (arrow === 'Show') {
      return true
    }
    return {
      pointAtCenter: true,
    }
  }, [arrow])
  return (
    <div className='rounded-lg w-full h-[556px] px-4 py-6 border border-mediumGray flex flex-col gap-5 order-1 md:order-1'>
      <div className='w-full flex gap-4 items-center justify-between'>
        <div className='w-full flex gap-4 items-center '>
          <div className='border border-mediumGray p-[7px] rounded-[4px]'>{icon}</div>
          <div className={cn('text-[16px] font-semibold', titleClassName)}>{title}</div>
        </div>

        {showButton && isButtonDisabled && (
          <ConfigProvider
            theme={{
              token: {
                colorTextLightSolid: '#666',
                boxShadowSecondary: 'none',
                borderRadius: 8,
                fontFamily: 'figtree',
              },
            }}
          >
            <Tooltip
              placement='top'
              title={'Remind patients feature is only available for Critical patients'}
              arrow={mergedArrow}
              color={'#EFEFEF'}
              trigger={'click'}
              overlayInnerStyle={{paddingLeft: '25px', paddingTop: '10px', paddingBottom: '10px'}}
            >
              <button className='w-[142px] h-fit text-end font-semibold text-[12px] text-grayDisabled hide-on-mobile'>
                Remind all patients
              </button>
            </Tooltip>
          </ConfigProvider>
        )}
        <When isTrue={showButton && !isButtonDisabled}>
          <button
            className='w-[142px] text-end font-semibold text-[12px] text-primaryColor hide-on-mobile'
            onClick={onClick}
          >
            Remind all patients
          </button>
        </When>
      </div>
      <div className='w-full h-full'>{children}</div>
    </div>
  )
}

export default DashboardCard
