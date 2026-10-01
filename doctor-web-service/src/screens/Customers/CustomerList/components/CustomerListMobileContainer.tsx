import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import {Pagination, Spin} from 'antd'
import When from 'components/when/When'
import hasValue from 'utils/hasValue'
import NoCustomerFound from './NoCustomerFound'
import CustomerListItem from './CustomerListItem'
import customerFilterConstants from '@constants/customerFilter.constants'
import {Invitation} from 'screens/Labs/LabList/types/labs.types'

const CustomerListMobileContainer = ({
  search,
  isAccessible,
  pageNumber,
  handleOnSearch,
  sendInvite,
  activeTab,
}: {
  search: string
  isAccessible: boolean
  activeTab: keyof typeof customerFilterConstants
  pageNumber: number
  handleOnSearch: ({page}: {page: number}) => void
  sendInvite: (invitation: Invitation) => void
}) => {
  // Mobile uses the customers slice (as before)
  const {dataPracticeList, loadingPracticeList} = useSelector((state: RootState) => state.practices)
  const data: Invitation[] = dataPracticeList?.doctor_invitation_details_list ?? []
  const totalCustomers = dataPracticeList?.pagination?.total_patients ?? 0

  return (
    <Spin spinning={loadingPracticeList}>
      <div className='flex flex-col gap-3 mb-3'>
        <When isTrue={hasValue(data) && data.length > 0}>
          {data.map((customer) => (
            <CustomerListItem
              activeTab={activeTab}
              key={customer.invitation_id}
              customer={customer}
              sendInvite={sendInvite}
              isAccessible={isAccessible}
            />
          ))}

          <div className='flex justify-between mt-2 mb-2 px-1 items-center'>
            <p className='text-textColor text-sm font-medium'>
              {Math.min((pageNumber - 1) * 10 + 1, totalCustomers)}-
              {Math.min(pageNumber * 10, totalCustomers)} from {totalCustomers}
            </p>
            <Pagination
              showSizeChanger={false}
              // keep same behavior as before (mobile)
              defaultCurrent={pageNumber}
              defaultPageSize={10}
              showLessItems
              onChange={(page) => handleOnSearch({page})}
              total={totalCustomers}
            />
          </div>
        </When>

        <When isTrue={!hasValue(data) || data.length === 0}>
          <NoCustomerFound
            title={hasValue(search) ? 'No results found' : 'No customers added yet'}
          />
        </When>
      </div>
    </Spin>
  )
}

export default CustomerListMobileContainer
