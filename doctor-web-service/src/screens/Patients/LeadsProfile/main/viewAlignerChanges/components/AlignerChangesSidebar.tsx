import {useState} from 'react'
import AlignerChangesSidebarItem from './AlignerChangesSidebarItem'
import clsx from 'clsx'
import When from 'components/when/When'
import CheckMarkIcon from 'assets/icons/CheckMarkIcon'
import Page from 'components/page/Page'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import updateCategoryConstants from '@constants/updateCategory.constants'

const AlignerChangesSidebar = ({
  onClickSidebarItem,
  gettingAlignerUpdates,
}: {
  onClickSidebarItem: (action: number) => void
  gettingAlignerUpdates: boolean
}) => {
  const [showOnlyCritical, setShowOnlyCritical] = useState(false)

  const {alignerUpdates} = useSelector((state: RootState) => state.alignerTracking)
  const showOnlyCriticalDisabled = !alignerUpdates.actions.some(
    (item) => item.update_category === updateCategoryConstants.CRITICAL
  )
  return (
    <Page title='' loading={gettingAlignerUpdates}>
      <div className='pr-0 md:pr-2 pl-0 '>
        <div className='flex justify-between gap-x-10 items-center mb-3 font-semibold'>
          <p className='text-base text-neutralBlack'>All updates</p>
          <button
            className={clsx(
              'rounded-3xl px-4 py-1.5 border  text-sm text-textColor',
              showOnlyCritical
                ? 'bg-secondaryColor text-white'
                : showOnlyCriticalDisabled
                  ? 'cursor-not-allowed bg-lightGray border-lightGray '
                  : 'bg-white border-mediumGray'
            )}
            disabled={showOnlyCriticalDisabled}
            onClick={() => {
              const newShowOnlyCritical = !showOnlyCritical
              setShowOnlyCritical(newShowOnlyCritical)
              if (newShowOnlyCritical) {
                const firstCriticalItem = alignerUpdates.actions.find(
                  (item) => item.update_category === updateCategoryConstants.CRITICAL
                )
                if (firstCriticalItem) onClickSidebarItem(firstCriticalItem.aligner_acton_id)
              }
            }}
          >
            <div className='flex items-center gap-2.5'>
              <When isTrue={showOnlyCritical}>
                <CheckMarkIcon width='11' height='8' color='white' />
              </When>
              <p>Show only critical</p>
            </div>
          </button>
        </div>
        <div className='flex flex-col gap-3 max-h-[calc(91vh-7rem)] -mb-5 overflow-auto pb-2'>
          {alignerUpdates.actions.map((item, index) => {
            if (showOnlyCritical) {
              if (item.update_category !== updateCategoryConstants.CRITICAL) {
                return
              }
            }
            return (
              <AlignerChangesSidebarItem
                key={index}
                onClick={onClickSidebarItem}
                alignerUpdateItem={item}
              />
            )
          })}
        </div>
      </div>
    </Page>
  )
}

export default AlignerChangesSidebar
