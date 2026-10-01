import TableContainerForAccessControlUserList from './components/TableContainerForAccessControlUserList'
import useDispatchAction from '@hooks/useDispatchAction'
import {AuthContext} from 'context/AuthContext'
import {useContext, useState, useEffect} from 'react'
import {useSelector} from 'react-redux'
import {useNavigate, useSearchParams} from 'react-router-dom'
import {RootState} from 'redux/store'
import {safeParseInt} from 'utils/ConstFunctions'
import {
  getAccessControlUserList,
  getRolesOptionList,
  setSelectedRole,
  setSelectedStatus,
} from 'redux/Slices/AppSlice/accessControl/AccessControl.slice'
import PracticeSearchInput from 'screens/Practices/PracticeList/components/PracticeSearchInput'
import SortRolesFilter from './components/SortRolesFilter'
import SortStatusFilter from './components/SortStatusFilter'
import {Tabs, Button} from 'antd'
import CustomerList from 'screens/Customers/CustomerList/CustomerList'
import useAllUserPlan from '@hooks/useAllUserPlan'

export type optionTypeForRole = {value: number; label: string}
export type optionTypeForStatus = {value: string; label: string}

const AccessControlUserList = () => {
  const {dispatchAction} = useDispatchAction()
  const {userId} = useContext(AuthContext)
  const [pageNumber, setCurrentPageNumber] = useState(1)
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = (searchParams.get('tab') as 'internal' | 'external') || 'internal'
  const {loading} = useSelector((state: RootState) => state.Users)
  const navigate = useNavigate()
  const {rolesOptionList, selectedRole, selectedStatus, planId} = useSelector(
    (state: RootState) => state.accessControl
  )
  const {isEnterprisePlanUser} = useAllUserPlan()

  useEffect(() => {
    if (activeTab !== 'internal') return
    getUserDetailsList({})
    dispatchAction(
      getRolesOptionList({
        plan_id: safeParseInt(planId),
        doctor_id: safeParseInt(userId),
      })
    )
  }, [activeTab])

  const getUserDetailsList = ({
    search = null,
    status = selectedStatus,
    subRoleId = selectedRole,
    page = pageNumber,
  }: {
    search?: string | null
    status?: string
    subRoleId?: number | null
    page?: number
  }) => {
    const zeroBasedPage = Math.max((page ?? 1) - 1, 0)
    const payload = {
      doctor_id: safeParseInt(userId),
      search: search,
      status: status,
      sub_role_id: subRoleId === 0 ? null : subRoleId,
      page_number: zeroBasedPage,
      page_size: 10,
    }
    dispatchAction(getAccessControlUserList(payload))
  }

  const handleOnSearch = async ({page = 1}: {page?: number}) => {
    if (userId && page > 0) {
      setCurrentPageNumber(page)
      getUserDetailsList({page})
    }
  }

  const handleSearch = (search: string | null) => {
    if (userId) {
      setCurrentPageNumber(1)
      getUserDetailsList({search, page: 1})
    }
  }

  const handleSortByRole = (option: optionTypeForRole) => {
    if (userId) {
      dispatchAction(setSelectedRole(option.value))
      setCurrentPageNumber(1)
      getUserDetailsList({subRoleId: option.value, page: 1})
    }
  }

  const handleSortByStatus = (option: optionTypeForStatus) => {
    if (userId) {
      dispatchAction(setSelectedStatus(option.value))
      setCurrentPageNumber(1)
      getUserDetailsList({status: option.value, page: 1})
    }
  }

  const internalContent = (
    <div className='flex flex-col gap-3 my-3'>
      <div className='flex flex-wrap justify-between items-center gap-3'>
        <div>
          <div className='text-lg font-semibold w-fit'>Users</div>
          <div className='text-sm font-normal text-textColor'>Invite and manage user accounts</div>
        </div>
        <Button
          type='primary'
          onClick={() => navigate('/add-access-control-user')}
          className='flex items-center gap-2'
        >
          <span>+</span>
          <span>Add User</span>
        </Button>
      </div>
      <div className='flex gap-2'>
        <PracticeSearchInput handleSearch={handleSearch} />
        <SortRolesFilter handleSortByRole={handleSortByRole} rolesOptionList={rolesOptionList} />
        <SortStatusFilter handleSortByStatus={handleSortByStatus} />
      </div>
      {!loading && (
        <TableContainerForAccessControlUserList
          pageNumber={pageNumber}
          handleOnSearch={handleOnSearch}
        />
      )}
    </div>
  )

  return (
    <Tabs
      activeKey={activeTab}
      onChange={(key) => setSearchParams({tab: key})}
      items={
        isEnterprisePlanUser
          ? [
              {label: 'My Users', key: 'internal', children: internalContent},
              {label: 'My Customers', key: 'external', children: <CustomerList />},
            ]
          : [{label: 'My Users', key: 'internal', children: internalContent}]
      }
    />
  )
}

export default AccessControlUserList
