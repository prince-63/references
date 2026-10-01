import PracticeSearchInput from 'screens/Practices/PracticeList/components/PracticeSearchInput'
import TableContainerForCustomerPatient from 'screens/CustomerList/TableContainerForCustomerPatient'
import {useOutletContext, useParams} from 'react-router-dom'
import {PracticeProfileOutletContext} from '../types/practiceProfile.types'
import VspPatientsTable from './VspPatientsTable'
import {useContext} from 'react'
import {AuthContext} from 'context/AuthContext'
import {safeParseInt} from 'utils/ConstFunctions'
import useDispatchAction from '@hooks/useDispatchAction'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import {
  getVspMiniDashboard,
  VspMiniDashboardResponse,
} from 'redux/Slices/AppSlice/Profile/Profile.slice'
import getVspMiniDashboardPayload from '../helpers/getVspMiniDashboardPayload'

const PatientsTab = () => {
  const {search, pageNumber, handleSearch, getPatientList, isVspPlanning} =
    useOutletContext<PracticeProfileOutletContext>()
  const {profileId} = useContext(AuthContext)
  const {dispatchAction} = useDispatchAction()
  const {customerId} = useParams<{customerId: string}>()
  const {miniDashboardData} = useSelector((state: RootState) => state.profile)

  const handleVspPatientPageChange = (page: number) => {
    const parsedProfileId = safeParseInt(profileId)
    const parsedCustomerId = safeParseInt(customerId)
    if (!parsedProfileId || !parsedCustomerId) return

    dispatchAction(
      getVspMiniDashboard(
        getVspMiniDashboardPayload({
          profileId: parsedProfileId,
          customerProfileId: parsedCustomerId,
          currentData: (miniDashboardData as VspMiniDashboardResponse | null) ?? null,
          patientPageNo: page,
        })
      )
    )
  }

  if (isVspPlanning) {
    return <VspPatientsTable onPageChange={handleVspPatientPageChange} />
  }

  return (
    <>
      <div className='flex gap-2 my-3 items-center'>
        <PracticeSearchInput handleSearch={handleSearch} placeholder={'search'} />
        {/* <AppInviteStatus onStatusFilter={onStatusFilter} /> */}
      </div>

      <div className='mb-3'>
        <TableContainerForCustomerPatient
          search={search}
          pageNumber={pageNumber}
          handleOnSearch={getPatientList}
        />
      </div>
    </>
  )
}

export default PatientsTab
