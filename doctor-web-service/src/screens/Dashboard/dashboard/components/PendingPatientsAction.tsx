import DashboardCard from './DashboardCard'
import ClockIcon from 'assets/icons/ClockIcon'
import CommonEmptyState from 'components/emptyState/CommonEmptyState'
import {IMAGE_EMPTY_STATE_PENDING_PATIENTS} from 'utils/ImageConst'
import When from 'components/when/When'
import hasValue from 'utils/hasValue'
import ArrowRight from 'assets/icons/ArrowRight'
import {DefaultImage} from 'assets/images/Images/DefaultImage'
import {Image} from 'assets/images/Images/Image'
import FilterNavBar from './FilterNavBar'
import pendingPatientsFilterOption from '../constants/pendingPatientsFilterOption'

import useFilter from '@hooks/useFilter'
import {PendingPatient} from 'redux/Slices/AppSlice/DoctorDashboard/DoctorDashboardSlice'

import getActiveFilter from 'screens/Patients/PatientList/utils/getActiveFilter'
import {useNavigate} from 'react-router-dom'
import {PendingPatientsFilterOptionsRecord} from '../types/pendingPatientsList.type'
import {useEffect} from 'react'
import {identifyUser} from 'utils/ConstFunctions'
import useProfileBasePath from '@hooks/useProfileBasePath'
import pendingPatientsTypes from '../types/pendingPatients.types'

interface props {
  tableData: PendingPatientsFilterOptionsRecord
}

const PendingPatientsAction = (props: props) => {
  const {tableData} = props

  type PendingPatientFilterOption = (typeof pendingPatientsFilterOption)[number]
  const {filter, handleFilterChange} = useFilter<PendingPatientFilterOption>(
    pendingPatientsFilterOption
  )

  const activeTab = getActiveFilter<PendingPatientFilterOption>({
    filter,
  })
  const pendingPatientList = tableData[activeTab]

  useEffect(() => {
    if (filter.SET_UP_TREATMENT_PLAN) {
      identifyUser()
    }
  }, [filter])

  return (
    <DashboardCard icon={<ClockIcon />} title='Pending patient actions'>
      <div className='w-full h-full'>
        <FilterNavBar
          {...{
            filterOptions: pendingPatientsFilterOption,
            filter,
            handleFilterChange,
            tableData,
          }}
        />

        <When isTrue={!hasValue(pendingPatientList)}>
          <EmptyState />
        </When>
        <When isTrue={hasValue(pendingPatientList)}>
          <div className='h-[420px] overflow-auto'>
            <div className='w-full grid-cols-1 md:grid lg:grid-cols-2 sm:grid-cols-1 gap-3 pt-3'>
              {pendingPatientList.map((patientData: PendingPatient, index: number) => (
                <div className='w-full mt-3' key={index}>
                  <PatientCard patientData={patientData} activeTab={activeTab} />
                </div>
              ))}
            </div>
          </div>
        </When>
      </div>
    </DashboardCard>
  )
}

export default PendingPatientsAction

const EmptyState = () => {
  return (
    <CommonEmptyState
      boxStyle='w-full h-full justify-center items-center'
      image={IMAGE_EMPTY_STATE_PENDING_PATIENTS}
      imageStyle='w-[210px] h-[134px]'
      title='No pending actions'
      titleStyle=' text-textColor font-semibold text-[16px] mt-4 text-center'
      subTitle='You have no pending actions. You will notified once something comes up'
      subTitleStyle='md:w-[325px] w-full text-textColor font-medium text-[14px]  text-center'
    />
  )
}

interface PatientCardProps {
  patientData: PendingPatient
  activeTab: string
}

const PatientCard: React.FC<PatientCardProps> = ({patientData, activeTab}) => {
  const navigate = useNavigate()
  const profileBasePath = useProfileBasePath()
  return (
    <div
      className='w-full rounded-lg px-4 py-4 border border-mediumGray flex justify-between items-center cursor-pointer'
      onClick={() => {
        if (activeTab == pendingPatientsTypes.SET_UP_TREATMENT_PLAN) {
          navigate(`${profileBasePath}/${patientData.patient_id}/plans-list`)
        } else {
          navigate(`${profileBasePath}/${patientData.patient_id}`)
        }
      }}
    >
      <div className='flex gap-3'>
        <div>
          {patientData?.patient_profile !== null ? (
            <Image
              className='min-w-12 h-12 object-cover rounded-full'
              src={patientData?.patient_profile}
            />
          ) : (
            <DefaultImage className='w-12 h-12 ' letter={patientData?.patient_name?.charAt(0)} />
          )}
        </div>
        <div>
          <div className='font-semibold text-[16px] max-w-48 truncate ...'>
            {patientData?.patient_name}
          </div>
          <div className='font-medium text-[14px] text-textColor  max-w-48 truncate ...'>
            {hasValue(patientData?.email) ? patientData?.email : '--'}
          </div>
        </div>
      </div>
      <button>
        <ArrowRight color='#666666' width='12' height='12' />
      </button>
    </div>
  )
}
