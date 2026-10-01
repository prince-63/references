import filterPatientList from '@constants/filterPatientList'
import {GlobalStatusType} from 'screens/Patients/PatientList/components/CountBox'

export type PracticeProfileGetPatientListArgs = {
  statusFilters?: keyof typeof filterPatientList | 'ALL'
  globalFilters?: GlobalStatusType
  page?: number
  search?: string | null
  filter_by_role?: string | null
}

export type PracticeProfileOutletContext = {
  search: string | null
  pageNumber: number
  handleSearch: (search: string | null) => void
  onStatusFilter: (statusFilter: keyof typeof filterPatientList | 'ALL') => void
  getPatientList: (args: PracticeProfileGetPatientListArgs) => void
  isVspPlanning: boolean
  readMode: boolean
}
