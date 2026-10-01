import clsx from 'clsx'
import practiceProfileNavbarItems from './practiceProfileNavbarItems'
import practiceProfileRouteConstants from '@constants/practiceProfile.routeConstants'
import useAllUserPlan from '@hooks/useAllUserPlan'

export type PracticeProfileTabs = (typeof practiceProfileNavbarItems)[number]
export type PracticeProfileNavBar = Record<PracticeProfileTabs['value'], boolean>

interface INavBar {
  filter: PracticeProfileNavBar
  handleFilterChange: (option: PracticeProfileTabs['value'], toggle?: boolean) => void
  navItems?: PracticeProfileTabs[]
}

const NavBar = ({filter, handleFilterChange, navItems = practiceProfileNavbarItems}: INavBar) => {
  const {isAdmin} = useAllUserPlan()
  const visibleNavItems = isAdmin
    ? navItems.filter((item) => item.value !== practiceProfileRouteConstants.SETTINGS)
    : navItems
  return (
    <div className='flex gap-x-5 border-b border-lightGray w-full mx-3 text-textColor text-base font-semibold'>
      {visibleNavItems.map((item) => (
        <div
          key={item.value}
          className={clsx(
            'py-2 cursor-pointer min-w-max border-b-2',
            filter[item.value]
              ? 'border-primaryColor text-primaryColor'
              : 'border-transparent text-textColor'
          )}
          onClick={() => handleFilterChange(item.value)}
        >
          {item.label}
        </div>
      ))}
    </div>
  )
}

export default NavBar
