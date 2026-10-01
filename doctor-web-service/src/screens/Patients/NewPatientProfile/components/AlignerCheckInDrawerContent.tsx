import {useSelector} from 'react-redux'
import {Action, Aligner} from '../patientTimeline.types'
import {RootState} from 'redux/store'
import {capitalizeFirstLetter} from 'utils/ConstFunctions'
import DateComponent from 'screens/Patients/LeadsProfile/main/viewAlignerChanges/components/alignerChangeDetails/components/DateComponent'
import When from 'components/when/When'
import Tag from 'components/tags/Tag'
import Divider from 'antd/lib/divider'
import PatientsFeedback from 'screens/Patients/LeadsProfile/main/viewAlignerChanges/components/alignerChangeDetails/components/PatientsFeedback'
import Photos from 'screens/Patients/LeadsProfile/main/viewAlignerChanges/components/alignerChangeDetails/components/Photos'
import Comments from 'screens/Patients/LeadsProfile/main/viewAlignerChanges/components/alignerChangeDetails/components/Comments'
import {useContext} from 'react'
import {AuthContext} from 'context/AuthContext'
import useAllUserPlan from '@hooks/useAllUserPlan'

interface AlignerCheckInDrawerContentProps {
  action?: Action | null
  aligner?: Aligner | null
}
const AlignerDetails = ({aligner}: {aligner?: Aligner | null}) => {
  const {alignerUpdateDetails} = useSelector((state: RootState) => state.alignerTracking)
  return (
    <div className='flex flex-col text-textColor gap-2'>
      <span>
        <span className='text-black text-lg font-semibold'>
          {capitalizeFirstLetter(aligner?.jaw_type || '')} {aligner?.aligner_number}{' '}
        </span>
        {'  '}
        <span className='text-sm font-medium'> of {aligner?.total_aligner}</span>
      </span>
      <DateComponent {...{date: alignerUpdateDetails?.perform_at}} />
      <When isTrue={alignerUpdateDetails?.category === 'CRITICAL'}>
        <Tag value={'CRITICAL'} className='bg-red text-white w-fit' />
      </When>
    </div>
  )
}
const AlignerCheckInDrawerContent: React.FC<AlignerCheckInDrawerContentProps> = ({aligner}) => {
  const {alignerUpdateDetails} = useSelector((state: RootState) => state.alignerTracking)
  const {data} = useSelector((state: RootState) => state.apiGetLeadsProfileDetails)
  const patientData = data.patient_details
  const {userId} = useContext(AuthContext)

  const {isOrganization, isPractice, isStarterPlanUser} = useAllUserPlan()
  const is_your_patient = patientData?.assigned_practice?.practice_doctor_id == userId

  const isAccessibleActionButton =
    (isOrganization && is_your_patient) || isStarterPlanUser || isPractice
  return (
    <div>
      <AlignerDetails
        {...{
          aligner,
        }}
      />
      <Divider className='my-4' />
      <PatientsFeedback
        {...{
          alignerUpdateDetails,
        }}
      />
      <Divider className='my-4' />
      <Photos
        {...{
          alignerUpdateDetails,
        }}
      />
      <Divider className='my-4' />
      <Comments
        isAccessibleActionButton={isAccessibleActionButton}
        comments={alignerUpdateDetails.comments!}
        alignerActionId={alignerUpdateDetails.aligner_action_id}
        alignerUpdateDetails={alignerUpdateDetails}
      />
    </div>
  )
}

export default AlignerCheckInDrawerContent
