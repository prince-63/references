import {Dropdown, Button} from 'antd'
import {useNavigate} from 'react-router-dom'
import type {MenuProps} from 'antd'
import useAllUserPlan from '@hooks/useAllUserPlan'
import UserPlusIcon from 'assets/icons/UserPlusIcon'
import UsersIcon from 'assets/icons/UsersIcon'
import getColorPalette from 'utils/getColorPalette'

const QuickInviteDropdown = () => {
  const navigate = useNavigate()
  const {isEnterprisePlanUser} = useAllUserPlan()

  const menuItems: MenuProps['items'] = [
    {
      key: 'add-user',
      label: (
        <div className='flex items-center gap-2 py-1'>
          <UserPlusIcon />
          <span>Add User</span>
        </div>
      ),
      onClick: () => navigate('/add-access-control-user'),
    },
  ]

  if (isEnterprisePlanUser) {
    menuItems.push({
      key: 'add-customer',
      label: (
        <div className='flex items-center gap-2 py-1'>
          <UsersIcon />
          <span>Add Customer</span>
        </div>
      ),
      onClick: () => navigate('/customers-add'),
    })
  }

  return (
    <Dropdown menu={{items: menuItems}} placement='bottomRight' trigger={['click']}>
      <Button
        type='primary'
        className='flex items-center gap-1'
        style={{
          backgroundColor: getColorPalette().primaryColor,
          borderColor: getColorPalette().primaryColor,
          color: '#ffffff',
        }}
      >
        <span className='text-lg leading-none'>+</span>
        <span>Quick Invite</span>
      </Button>
    </Dropdown>
  )
}

export default QuickInviteDropdown
