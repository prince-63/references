import OuterFilterSelection from './OuterFilterSelection'
import filterAlignerPatientAnalytics from '@staticData/filterAlignerPatientAnalytics'
import clsx from 'clsx'
import When from 'components/when/When'
import CrossIcon from 'assets/icons/CrossIcon'
import getColorPalette from 'utils/getColorPalette'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import useDispatchAction from '@hooks/useDispatchAction'
import {
  setIsAlignerUpdates,
  setSelectedFilter,
} from 'redux/Slices/AppSlice/AlignerPatientAnalytics/AlignerPatientAnalytics.slice'

const OuterFilter = () => {
  const {dispatchAction} = useDispatchAction()
  const {selectedFilter, isAlignerUpdates} = useSelector(
    (state: RootState) => state.AlignerPatientAnalytics
  )

  return (
    <div className='w-full flex gap-3 items-center overflow-x-auto shrink-0'>
      <div className='flex gap-3 items-center  w-fit shrink-0'>
        {filterAlignerPatientAnalytics.map((option) => (
          <OuterFilterSelection
            key={option.value}
            option={option}
            onChange={() => {
              dispatchAction(setSelectedFilter(option.value))
            }}
            checked={option.value === selectedFilter}
          />
        ))}
      </div>
      <div className='flex gap-3 items-center border-l border-mediumGray w-fit shrink-0'>
        <div
          className={clsx(
            'flex items-center space-x-2 px-3 py-2 rounded-3xl border ml-3',
            isAlignerUpdates
              ? 'bg-primarySupport text-primaryColor border-primaryColor'
              : 'text-textColor border-mediumGray '
          )}
        >
          <button
            className={clsx('text-sm font-medium')}
            onClick={() => {
              dispatchAction(setIsAlignerUpdates(true))
            }}
          >
            Pending updates
          </button>
          <When isTrue={isAlignerUpdates}>
            <button
              onClick={() => {
                dispatchAction(setIsAlignerUpdates(false))
              }}
            >
              <CrossIcon color={isAlignerUpdates ? getColorPalette().primaryColor : '#666'} />
            </button>
          </When>
        </div>
      </div>
    </div>
  )
}

export default OuterFilter
