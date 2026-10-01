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

const UnSelectedMenu: FC<props> = (props) => {
  const {
    title,
    icon,
    selectedMenuNo,
    isSidebarCollapsed,
    handleClick,
    menuNo,
    allNewPatientsCount,
    totalUnreadMessagesCount,
  } = props
  return (
    <>
      <div
        className='w-full h-fit ml-5 p-4 rounded-lg justify-start items-center gap-4 inline-flex cursor-pointer'
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
          className={`text-textColor text-base font-normal whitespace-nowrap ${
            isSidebarCollapsed ? 'hidden' : 'block'
          }`}
        >
          {title}
        </div>
      </div>
    </>
  )
}

export default UnSelectedMenu
