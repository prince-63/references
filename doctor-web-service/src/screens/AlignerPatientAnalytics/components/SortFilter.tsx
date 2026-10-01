import {Popover} from 'antd'
import FilterIcon from 'assets/icons/FilterIcon'
import clsx from 'clsx'
import {useState} from 'react'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import {optionType} from 'types/optionType'
import SortingCheckList from './SortingCheckList'
import useAllUserPlan from '@hooks/useAllUserPlan'

const SortFilter = ({
  selectedPracticeLocation,
  setSelectedPracticeLocation,
  selectedPractice,
  setSelectedPractice,
}: {
  selectedPracticeLocation: optionType[] | null
  setSelectedPracticeLocation: (items: optionType[] | null) => void
  selectedPractice: optionType[] | null
  setSelectedPractice: (items: optionType[] | null) => void
}) => {
  const {practiceLocationsList} = useSelector((state: RootState) => state.calendar)
  const {activePractices} = useSelector((state: RootState) => state.practices)
  const [searchTerm, setSearchTerm] = useState('')

  const {isPractice} = useAllUserPlan()
  return (
    <Popover
      content={
        <div className='flex gap-2 p-4'>
          {isPractice ? (
            <div className='flex flex-col gap-3 max-h-64 overflow-y-scroll dropdownRadio'>
              <SortingCheckList
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                searchInputPlaceHolder='Search'
                items={practiceLocationsList ?? []}
                className='text-black'
                selectedItems={selectedPracticeLocation ?? []}
                setSelectedItems={(items) => {
                  setSelectedPracticeLocation(items ?? [])
                }}
              />
            </div>
          ) : (
            <div className='flex flex-col gap-3 max-h-64 overflow-y-scroll dropdownRadio'>
              <SortingCheckList
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                searchInputPlaceHolder='Search'
                items={activePractices ?? []}
                className='text-black'
                selectedItems={selectedPractice ?? []}
                setSelectedItems={(items) => {
                  setSelectedPractice(items)
                }}
              />
            </div>
          )}
        </div>
      }
      overlayInnerStyle={{padding: '4px', fontFamily: 'Figtree'}}
      placement='bottom'
      trigger={['click']}
      className='transition ease-in-out duration-200'
    >
      <button
        className={clsx(
          'rounded-lg flex justify-center items-center border  px-2 py-1 ml-2 border-mediumGray text-textColor'
        )}
        type='button'
      >
        <FilterIcon color={'#666666'} />
        <span className='ml-1'>Filter</span>
      </button>
    </Popover>
  )
}

export default SortFilter
