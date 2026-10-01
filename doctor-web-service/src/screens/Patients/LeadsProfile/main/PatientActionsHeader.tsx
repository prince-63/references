import NavBar from './NavBar'
import {LeadsProfileNavBar, LeadsProfileNavItem} from '../leadsProfile.types'

interface IPatientActionsHeader {
  filter: LeadsProfileNavBar
  handleFilterChange: (option: LeadsProfileNavItem) => void
}
const PatientActionsHeader = ({filter, handleFilterChange}: IPatientActionsHeader) => {
  return (
    <div className='flex flex-col gap-2 max-w-[100vw] overflow-scroll hiddenScrollbar'>
      <NavBar {...{filter, handleFilterChange}} />
    </div>
  )
}

export default PatientActionsHeader
