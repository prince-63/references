import {Dispatch, SetStateAction, useContext} from 'react'
import PatientDetails from './PatientDetails'
import QuickActions from './QuickActions'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import InviteSection from './InviteSection'
import getPatientAssignedTo from '@utils/getPatientAssignedTo'
import {AuthContext} from 'context/AuthContext'
import When from 'components/when/When'
import {ActionItem} from '../leadsProfile.types'
import {useFeatureAccess} from '@hooks/useFeatureAccess'
import useAllUserPlan from '@hooks/useAllUserPlan'

interface LeftPanelProps {
  setIsModalPatientSettingsOpen: Dispatch<SetStateAction<boolean>>
  activeAction: any
  handleFilterChange: (option: ActionItem, toggle?: boolean) => void
}
const PatientLeftPanel = ({
  setIsModalPatientSettingsOpen,
  activeAction,
  handleFilterChange,
}: LeftPanelProps) => {
  const {data} = useSelector((state: RootState) => state.apiGetLeadsProfileDetails)
  const {profileId} = useContext(AuthContext)
  const patientData = data.patient_details
  const {permissionChecks} = useFeatureAccess()
  const patientConnectionStatusControl =
    permissionChecks.patientManagement?.patientConnectionStatus?.isViewable

  const {isCustomer, isDesignLabUser, isVendor, isEnterprisePlanUser} = useAllUserPlan()
  const patientAssignedTo = getPatientAssignedTo(profileId, patientData)
  const isThirdParty =
    isCustomer ||
    (!isEnterprisePlanUser && isDesignLabUser) ||
    isVendor ||
    (isEnterprisePlanUser &&
      patientAssignedTo !== 'UNASSIGNED' &&
      data?.patient_details?.assigned_practice?.is_customer_patient)

  return (
    <div
      className='
        md:flex flex-col gap-3 
        w-[25%] min-w-0 max-w-[25%] 
        hidden 
        overflow-hidden 
      '
    >
      <div className='flex flex-col gap-3 overflow-y-auto pr-2'>
        <PatientDetails />

        <When isTrue={patientAssignedTo === 'ASSIGNED_TO_ME' && patientConnectionStatusControl}>
          <div className='overflow-hidden'>
            <InviteSection
              connectionStatus={data?.invitation_details}
              connectionDate={data?.patient_details?.connection_date ?? ''}
            />
          </div>
        </When>

        <When isTrue={!isThirdParty}>
          <div className='overflow-hidden'>
            <QuickActions
              setIsModalPatientSettingsOpen={setIsModalPatientSettingsOpen}
              activeAction={activeAction}
              handleFilterChange={handleFilterChange}
            />
          </div>
        </When>
      </div>
    </div>
  )
}

export default PatientLeftPanel
