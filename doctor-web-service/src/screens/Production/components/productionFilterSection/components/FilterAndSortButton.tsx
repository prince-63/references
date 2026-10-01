import {Popover} from 'antd'
import {useState} from 'react'
import CommonSVG from 'components/atom/SVG/CommonSVG'
import {SVG_PRODUCTION_FILTER} from 'utils/SvgConstants'
import DropDownOutline from 'assets/icons/DropDownOutline'
import FilterAndSortContent from './FilterAndSortContent'
import {optionType} from 'types/optionType'
import {RootState} from 'redux/store'
import {useSelector} from 'react-redux'
import {ProductionFilter} from 'screens/Production/types/productionModule.types'

const FilterAndSortButton = ({
  brandList,
  filter,
}: {
  brandList: optionType[] | null
  filter: ProductionFilter
}) => {
  const [open, setOpen] = useState(false)
  const {filterCount} = useSelector((state: RootState) => {
    return state.production
  })

  const hide = () => {
    setOpen(false)
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
  }

  return (
    <Popover
      content={<FilterAndSortContent {...{brandList, hide, filter}} />}
      title={<p className='text-textColor text-base font-medium'>Filter</p>}
      trigger='click'
      open={open}
      onOpenChange={handleOpenChange}
      getPopupContainer={(triggerNode) => triggerNode}
      placement='bottomLeft'
    >
      <button className='bg-white border border-primaryColor w-fit min-w-[165px] px-3 py-1.5 rounded-md text-primaryColor font-semibold'>
        <div className='flex gap-1 items-center justify-between text-sm'>
          <CommonSVG svg={SVG_PRODUCTION_FILTER} width='16.9' height='15' />
          <p className=''>Filter & Sort {filterCount !== 0 && `(${filterCount})`}</p>
          <DropDownOutline />
        </div>
      </button>
    </Popover>
  )
}

export default FilterAndSortButton
