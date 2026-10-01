import {Outlet, useLocation} from 'react-router-dom'
import PatientActionsHeader from './PatientActionsHeader'
import useFilter from '@hooks/useFilter'
import leadsProfileNavBarItems from '@staticData/leadsProfileNavBarItems'
import {useEffect} from 'react'
import leadsProfileRouteConstants from '@constants/leadsProfile.routeConstants'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import leadsPatientStatusType from '@constants/leadsPatientStatusType'

const Main = () => {
  const {filter, handleFilterChange} = useFilter(leadsProfileNavBarItems)
  const location = useLocation()
  const {data} = useSelector((state: RootState) => state.apiGetLeadsProfileDetails)
  const patientData = data.patient_details
  useEffect(() => {
    let activeItem

    if (
      location.pathname.includes('files') ||
      patientData?.status === leadsPatientStatusType.ARCHIVE
    ) {
      activeItem = leadsProfileNavBarItems.find((item) => item.path === 'files')
    } else {
      activeItem = leadsProfileNavBarItems.find((item) => {
        return item.path && location.pathname.includes(item.path)
      })
    }
    if (activeItem) {
      handleFilterChange(activeItem.value)
    } else {
      handleFilterChange(leadsProfileRouteConstants.OVERVIEW)
    }
  }, [location.pathname])

  return (
    <div className='rounded-lg  w-full flex flex-col gap-3 relative mt-4'>
      <PatientActionsHeader {...{filter, handleFilterChange}} />
      <div className='mx-3 pb-5 max-w-[100vw]'>
        <Outlet />
      </div>
    </div>
  )
}

export default Main
