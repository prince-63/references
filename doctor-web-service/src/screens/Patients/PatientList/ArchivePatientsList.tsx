import useDispatchAction from '@hooks/useDispatchAction'
import {AuthContext} from 'context/AuthContext'
import {useContext, useEffect, useState} from 'react'
import {
  getPatientsList,
  RequestPatientList,
} from 'redux/Slices/AppSlice/PatientsList/patientsList.slice'
import PracticeSearchInput from 'screens/Practices/PracticeList/components/PracticeSearchInput'
import {safeParseInt} from 'utils/ConstFunctions'
import TableContainerForPatientList from './components/TableContainerForPatientList'
import TableContainerForStarterPlanUserPatientList from './components/TableContainerForStarterPlanUserPatientList'
import useAllUserPlan from '@hooks/useAllUserPlan'

const ArchivePatientsList = () => {
  const {userId} = useContext(AuthContext)
  const {dispatchAction} = useDispatchAction()
  const {isStarterPlanUser} = useAllUserPlan()
  const [pageNumber, setCurrentPageNumber] = useState(1)
  const [search, setSearch] = useState<string | null>(null)

  const getArchivedPatientList = async ({
    page = 1,
    search = null,
  }: {
    page?: number
    search?: string | null
  }) => {
    setSearch(search)
    setCurrentPageNumber(page)

    const payload: RequestPatientList = {
      page_number: page,
      doctor_id: safeParseInt(userId),
      search: search?.trim() ?? '',
      practice_location: [],
      archive: true,
      filter_by_app_invite_status: 'ALL',
      filter_by_global_status: 'ALL',
      filter_by_treatment_type: '',
      filter_by_practice_name: '',
      filter_by_role: null,
    }
    dispatchAction(getPatientsList({payload}))
  }

  const handleSearch = (search: string | null) => {
    getArchivedPatientList({page: 1, search: search})
  }

  useEffect(() => {
    getArchivedPatientList({page: 1, search: search})
  }, [])

  return (
    <div className='pb-[70px] md:pb-0'>
      <div className='flex gap-2 my-3'>
        <PracticeSearchInput handleSearch={handleSearch} />
      </div>
      <div className='my-3'>
        {isStarterPlanUser ? (
          <TableContainerForStarterPlanUserPatientList
            isArchived={true}
            search={search}
            pageNumber={pageNumber}
            handleOnSearch={getArchivedPatientList}
          />
        ) : (
          <TableContainerForPatientList
            isArchived={true}
            search={search}
            pageNumber={pageNumber}
            handleOnSearch={getArchivedPatientList}
          />
        )}
      </div>
    </div>
  )
}

export default ArchivePatientsList
