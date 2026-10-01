import {Input, Select} from 'antd'
import {HeaderGroup} from '@tanstack/react-table'
import {PatientRowDetails} from 'screens/Patients/PatientList/types/patientsList.types'
import filterPatientList from '@constants/filterPatientList'

const {Option} = Select

interface TrackingTableFiltersV3Props {
  headerGroup: HeaderGroup<PatientRowDetails>
  searchName: string | null
  setSearchName: (val: string | null) => void
  onSearch: (searchOverride?: string | null) => void
  customPatientId: string | null
  setCustomPatientId: (val: string | null) => void
  appInviteStatus: keyof typeof filterPatientList | 'ALL'
  setAppInviteStatus: (val: keyof typeof filterPatientList | 'ALL') => void
  onAppInviteStatusChange: (val: keyof typeof filterPatientList | 'ALL') => void
  clinicId: number | null
  setClinicId: (val: number | null) => void
  practiceLocationsList: any[]
  practiceLocationPermissions: boolean
  appInviteStatusAccess: boolean
}

const TrackingTableFiltersV3 = ({
  headerGroup,
  searchName,
  setSearchName,
  onSearch,
  customPatientId,
  setCustomPatientId,
  appInviteStatus,
  setAppInviteStatus,
  onAppInviteStatusChange,
  clinicId,
  setClinicId,
  practiceLocationsList,
  practiceLocationPermissions,
  appInviteStatusAccess,
}: TrackingTableFiltersV3Props) => {
  return (
    <tr key={`${headerGroup.id}-filters`} className='border-b border-lightgray bg-white'>
      {headerGroup.headers.map((header) => {
        const colId = header.column.id
        return (
          <td key={`filter-${header.id}`} className='py-2 px-2'>
            {colId === 'patient_id' && (
              <Input
                placeholder='Search...'
                value={searchName || ''}
                onChange={(e) => {
                  setSearchName(e.target.value || null)
                  if (!e.target.value) onSearch(null)
                }}
                onPressEnter={() => {
                  setCustomPatientId(null)
                  onSearch(searchName)
                }}
                className='rounded-md border-mediumGray h-10 w-full'
                allowClear
              />
            )}
            {colId === 'custom_patient_id' && (
              <Input
                placeholder='Search ID...'
                value={customPatientId || ''}
                onChange={(e) => {
                  setCustomPatientId(e.target.value || null)
                  if (!e.target.value) onSearch(null)
                }}
                onPressEnter={() => {
                  setSearchName(null)
                  onSearch(customPatientId)
                }}
                className='rounded-md border-mediumGray h-10 w-full'
                allowClear
              />
            )}
            {colId === 'practice_location_name' && practiceLocationPermissions && (
              <Select
                placeholder='Filter by clinic'
                className='w-full h-10'
                allowClear
                onChange={(val) => setClinicId(val)}
                value={clinicId}
              >
                {practiceLocationsList?.map((loc: any) => (
                  <Option key={loc.value} value={loc.value}>
                    {loc.label}
                  </Option>
                ))}
              </Select>
            )}
            {colId === 'app_invite_status' && appInviteStatusAccess && (
              <Select
                placeholder='All'
                className='w-full h-10'
                onChange={(val) => {
                  const safeVal = val || 'ALL'
                  setAppInviteStatus(safeVal)
                  onAppInviteStatusChange(safeVal)
                }}
                value={appInviteStatus}
              >
                <Option value='ALL'>All</Option>
                <Option value='CONNECTED'>Connected</Option>
                <Option value='PENDING'>Pending</Option>
                <Option value='NOT_CONNECTED'>Not Connected</Option>
              </Select>
            )}
            {/* Empty TD cells for columns that don't have filters (Treatment Stage, Added On) */}
            {colId !== 'patient_id' &&
              colId !== 'custom_patient_id' &&
              colId !== 'practice_location_name' &&
              colId !== 'app_invite_status' && <div className='h-10 w-full' />}
          </td>
        )
      })}
    </tr>
  )
}

export default TrackingTableFiltersV3
