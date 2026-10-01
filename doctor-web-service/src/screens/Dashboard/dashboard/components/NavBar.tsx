import clsx from 'clsx'
import {DashboardTypeListItem, DashboardViewTypeFilter} from '../types/dashboard.types'
import dashboardTypesList from '@staticData/dashboardTypesList'
import {useState} from 'react'
import EditLabelsModal from './EditLabelsModal'
import useDashboard from '@hooks/useDashboard'
import hasValue from 'utils/hasValue'
import useAllUserPlan from '@hooks/useAllUserPlan'

interface INavBar {
  filter: DashboardViewTypeFilter
  handleFilterChange: (option: DashboardTypeListItem['value']) => void
}
const NavBar = ({filter, handleFilterChange}: INavBar) => {
  const callFilterNavBar = (item: DashboardTypeListItem) => {
    handleFilterChange(item.value)
  }
  const [isModalVisible, setIsModalVisible] = useState(false)
  const toggleModal = (value: boolean) => {
    setIsModalVisible(value)
  }
  const {label_name} = useDashboard()
  const {isEnterprisePlanUser} = useAllUserPlan()

  return (
    <div className='border-b border-lightGray w-full text-textColor text-base font-semibold flex justify-between items-center mb-2'>
      <div
        className='flex gap-x-5 overflow-x-auto whitespace-nowrap scroll-smooth'
        style={{WebkitOverflowScrolling: 'touch'}}
      >
        {dashboardTypesList
          .filter((item) => {
            const isCustomerOrPracticeOrder =
              item.value === 'CUSTOMER_ORDER' ||
              item.value === 'PRACTICE_ORDER' ||
              item.value === 'LABEL_VIEW'

            if (
              isEnterprisePlanUser &&
              (item.value === 'CUSTOMER_ORDER' || item.value === 'PRACTICE_ORDER')
            ) {
              return false
            }

            if (!isEnterprisePlanUser && isCustomerOrPracticeOrder) {
              return false
            }

            return true
          })
          .map((item) => {
            const label = hasValue(
              label_name?.[item.value.toLowerCase() as keyof typeof label_name]
            )
              ? label_name?.[item.value.toLowerCase() as keyof typeof label_name]
              : item.label

            return (
              <button
                key={item.value}
                className={clsx(
                  'min-w-fit py-2 cursor-pointer',
                  filter[item.value] && 'text-primaryColor border-b-2 border-primaryColor'
                )}
                onClick={() => callFilterNavBar(item)}
              >
                {label === 'WorkSpace' ? 'Workspace' : label}
              </button>
            )
          })}

        <EditLabelsModal {...{isModalVisible, toggleModal}} />
      </div>
    </div>
  )
}

export default NavBar
