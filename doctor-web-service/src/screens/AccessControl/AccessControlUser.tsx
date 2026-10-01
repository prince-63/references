import FilterBar from './AccessControlList/components/FilterBar'
import useFilter from '@hooks/useFilter'
import RestrictMobileView from './AccessControlList/components/RestrictMobileView'
import accessControlFilterRouteNavConstants from '@staticData/accessControlFilterRouteNavConstants'
import AccessControlHeader from './AccessControlList/components/AccessControlHeader'
import {Outlet} from 'react-router-dom'

const AccessControlUser = () => {
  const {filter, handleFilterChange} = useFilter(accessControlFilterRouteNavConstants)
  return (
    <div className='flex flex-col gap-3 mx-4'>
      <div className='hidden md:block '>
        <AccessControlHeader />
        <div>
          <FilterBar
            {...{
              filter,
              handleFilterChange,
            }}
          />
        </div>
        <div className='w-full'>
          <Outlet />
        </div>
      </div>
      <div className='md:hidden block'>
        <RestrictMobileView />
      </div>
    </div>
  )
}

export default AccessControlUser
