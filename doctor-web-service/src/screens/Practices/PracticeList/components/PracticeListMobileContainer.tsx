import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import {Pagination, Spin} from 'antd'
import When from 'components/when/When'
import hasValue from 'utils/hasValue'
import NoPracticeFound from './NoPracticeFound'
import PracticeListItem from './PracticeListItem'
import {Invitation} from '../types/practices.types'
import practiceFilterConstants from '@constants/practiceFilter.constants'

const PracticeListMobileContainer = ({
  isAccessible,
  pageNumber,
  handleOnSearch,
  sendInvite,
  activeTab,
}: {
  isAccessible: boolean
  activeTab: keyof typeof practiceFilterConstants
  pageNumber: number
  handleOnSearch: ({page}: {page: number}) => void
  sendInvite: (invitation: Invitation) => void
}) => {
  const {dataPracticeList, loadingPracticeList} = useSelector((state: RootState) => state.practices)
  const totalPractices = dataPracticeList?.pagination?.total_patients ?? 0
  return (
    <Spin spinning={loadingPracticeList}>
      <div className='flex flex-col gap-3 mb-3'>
        <When isTrue={hasValue(dataPracticeList)}>
          {dataPracticeList.doctor_invitation_details_list?.map((practice) => (
            <PracticeListItem
              activeTab={activeTab}
              key={practice.invitation_id}
              practice={practice}
              sendInvite={sendInvite}
              isAccessible={isAccessible}
            />
          ))}
          <div className='flex justify-between mt-2 mb-2 md:px-2.5 px-1 items-center'>
            <p className='text-textColor text-sm font-medium'>
              {Math.min((pageNumber - 1) * 10 + 1, totalPractices)}-
              {Math.min(pageNumber * 10, totalPractices)} from {totalPractices}
            </p>
            <div className='md:hidden block'>
              <Pagination
                showSizeChanger={false}
                defaultCurrent={pageNumber}
                defaultPageSize={10}
                showLessItems
                onChange={(page) => {
                  handleOnSearch({
                    page,
                  })
                }}
                total={totalPractices}
              />
            </div>
            <div className='hidden md:block'>
              <Pagination
                showSizeChanger={false}
                defaultCurrent={pageNumber}
                defaultPageSize={10}
                onChange={(page) => {
                  handleOnSearch({
                    page,
                  })
                }}
                total={totalPractices}
              />
            </div>
          </div>
        </When>

        <When isTrue={!hasValue(dataPracticeList)}>
          <NoPracticeFound />
        </When>
      </div>
    </Spin>
  )
}

export default PracticeListMobileContainer
