import {Popover} from 'antd'
import {useContext} from 'react'
import {RootState} from 'redux/store'
import {useSelector} from 'react-redux'
import FilterIcon from 'assets/icons/FilterIcon'
import clsx from 'clsx'
import useActiveProfile from '@hooks/useActiveProfile'
import {
  getPatientsListForOrg,
  RequestPatientListForOrg,
} from 'redux/Slices/AppSlice/PatientsList/patientsList.slice'
import {safeParseInt} from 'utils/ConstFunctions'
import useDispatchAction from '@hooks/useDispatchAction'
import {AuthContext} from 'context/AuthContext'
import FilterWithSearchBox from 'screens/Patients/PatientList/components/FilterWithSearchBox'
import rolesConstants from '@constants/roles.constants'

const PatientsFilterData = () => {
  const {userId} = useContext(AuthContext)
  const {dispatchAction} = useDispatchAction()
  const {activeProfile} = useActiveProfile()

  const {statusFilter, globalFilter, practiceLocationForOrg} = useSelector(
    (state: RootState) => state.patientsList
  )
  const {practiceLocationsList} = useSelector((state: RootState) => state.calendar)
  const role = (activeProfile?.roles ?? []).map((role) => role.name)

  const callFilter = (practiceLocationForOrg: number | string) => {
    const payload: RequestPatientListForOrg = {
      page_number: 0,
      doctor_id: safeParseInt(userId),
      search: null,
      practice_location_ids: practiceLocationForOrg ? [safeParseInt(practiceLocationForOrg)] : [],
      practice_profile_ids: [],
      filter_by_app_invite_status: statusFilter ?? 'ALL',
      filter_by_global_status: globalFilter,
      doctor_role: role[0],
      patient_type: 'ALL',
      practice_filter: 'ALL',
      treatment_type_filter: 'ALIGNER',
      customer_or_practice_role: rolesConstants?.CONSULTING_ORTHODONTIST,
    }
    dispatchAction(getPatientsListForOrg({payload}))
  }

  return (
    <div className='flex gap-3'>
      <Popover
        content={
          <div className='flex flex-col max-h-64  overflow-y-scroll dropdownRadio'>
            <FilterWithSearchBox
              needValue={true}
              items={practiceLocationsList ?? []}
              className='text-black w-[240px]'
              selectedItems={practiceLocationForOrg ?? ''}
              onclick={(items: string | number) => {
                callFilter(items)
              }}
            />
          </div>
        }
        overlayInnerStyle={{padding: '4px', fontFamily: 'Figtree', width: 300}}
        placement='bottom'
        trigger={['click']}
        className='transition ease-in-out duration-200'
      >
        <button
          className={clsx(
            'rounded-lg flex justify-center items-center border  px-2 py-1 ml-2 border-mediumGray text-textColor'
          )}
          type='button'
        >
          <FilterIcon color={'#666666'} />
          <span className='ml-1'>Filter by clinic </span>
        </button>
      </Popover>
    </div>
  )
}

export default PatientsFilterData
