import React, {FC} from 'react'
import CommonSVG from '../SVG/CommonSVG'
interface props {
  title?: string
  icon?: any
  selectedMenuNo?: any
  isSidebarCollapsed: boolean
  handleClick: (menuNo: string) => void
  allNewPatientsCount: number
  menuNo: string
  totalUnreadMessagesCount: number
}

const SelectedMenu: FC<props> = (props) => {
  const {
    title,
    icon,
    selectedMenuNo,
    isSidebarCollapsed,
    handleClick,
    allNewPatientsCount,
    menuNo,
    totalUnreadMessagesCount,
  } = props

  return (
    <div className='flex flex-row'>
      <div className='flex flex-row'>
        <div className='h-full w-1 rounded bg-primaryColor' />
      </div>
      <div
        className='w-fit h-fit ml-4 p-4 bg-primarySupport rounded-lg justify-start items-center gap-4 inline-flex cursor-pointer'
        onClick={() => {
          handleClick(String(selectedMenuNo))
        }}
      >
        <div className='w-8 h-8 relative'>
          <CommonSVG svg={icon} width='32px' height='32px' />
          {isSidebarCollapsed &&
            ((menuNo === '4' && allNewPatientsCount && allNewPatientsCount > 0) ||
              (menuNo === '5' && totalUnreadMessagesCount && totalUnreadMessagesCount > 0)) && (
              <div className='w-[11px] h-[11px] bg-red rounded-full absolute top-[21px] left-[22px]' />
            )}
        </div>
        <div
          className={`text-primaryColor text-base whitespace-nowrap font-semibold ${
            isSidebarCollapsed ? 'hidden' : 'block'
          }`}
        >
          {title}
        </div>
      </div>
    </div>
  )
}

export default SelectedMenu
