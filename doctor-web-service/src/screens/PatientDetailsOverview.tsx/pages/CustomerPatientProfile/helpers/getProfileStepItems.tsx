import cn from '@utils/cn'
import RoundCheckIcon from 'assets/icons/RoundCheckIcon'
import Shop from 'assets/icons/Shop'
import OrdersIcon from 'assets/icons/ThreeDotIcons'
import {ReactNode} from 'react'

const getProfileStepItems = (currentStep: number) => {
  const getBgColor = (currentStep: number, index: number) => {
    if (currentStep > index) {
      return 'bg-tertiaryColor'
    } else if (currentStep === index) {
      return 'bg-primaryColor'
    } else {
      return 'bg-lightGray opacity-50'
    }
  }
  const items = [
    {
      index: 0,
      title: <Title title='ORDER DETAILS' />,
      icon: (
        <IconWrap bgColor={getBgColor(currentStep, 0)}>
          <OrdersIcon color='#fff' width='24' />
        </IconWrap>
      ),
    },
    {
      index: 1,
      title: <Title title='IN REVIEW' />,
      icon: (
        <IconWrap bgColor={getBgColor(currentStep, 1)}>
          <Shop color='#fff' width='24' />
        </IconWrap>
      ),
    },
    {
      index: 2,
      title: <Title title='COMPLETED' />,
      icon: (
        <IconWrap bgColor={getBgColor(currentStep, 2)}>
          <RoundCheckIcon color='#fff' width='24' />
        </IconWrap>
      ),
    },
  ]
  return items
}

export default getProfileStepItems

const IconWrap = ({bgColor, children}: {bgColor: string; children: ReactNode}) => {
  return (
    <div
      className={cn('flex items-center justify-center p-3 rounded-2xl bg-tertiaryColor', bgColor)}
    >
      {children}
    </div>
  )
}

const Title = ({title}: {title: string}) => {
  return <div className='text-xs font-semibold ml-4'>{title}</div>
}
