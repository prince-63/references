import React, {useContext, useEffect} from 'react'

import useDispatchAction from '@hooks/useDispatchAction'
import {getMyTaskList} from 'redux/Slices/AppSlice/Profile/Profile.slice'
import {safeParseInt} from 'utils/ConstFunctions'
import {AuthContext} from 'context/AuthContext'
import {useParams} from 'react-router-dom'
import AssessmentView from './AssessmentView'
import Overview from 'screens/Patients/LeadsProfile/main/overview/Overview'
import OverviewBraces from 'screens/Patients/LeadsProfile/main/overview/OverviewBraces'
import useAllUserPlan from '@hooks/useAllUserPlan'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import treatmentTypeMain from '@constants/treatmentTypeMain'
import StarterPlanOverview from 'screens/PatientDetailsOverview.tsx/tabs/StarterPlanOverview'

export type TaskShape = {
  my_task_id: number
  patient_id: number
  added_by_profile_id: number
  title: string
  description?: string | null
  assignee_name: string
  assignee_profile_id: number
  due_date: string
  status: 'PENDING' | 'COMPLETED'
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
}

const MyTasks: React.FC = () => {
  const {dispatchAction} = useDispatchAction()
  const {userId, profileId} = useContext(AuthContext)
  const {patientId} = useParams()
  const {isStarterPlanUser} = useAllUserPlan()
  const {data} = useSelector((state: RootState) => state.apiGetLeadsProfileDetails)
  const productType = data?.getting_started_details?.product_type
  const {dataLeadsOverview: dataLeadsData} = useSelector((state: RootState) => state.leadsProfile)

  useEffect(() => {
    const parsedDoctorId = safeParseInt(userId)
    const parsedPatientId = safeParseInt(patientId)
    const parsedProfileId = safeParseInt(profileId)

    if (!parsedDoctorId || !parsedPatientId || !parsedProfileId) return

    dispatchAction(
      getMyTaskList({
        doctor_id: parsedDoctorId,
        patient_id: parsedPatientId,
        filter: 'PENDING',
        order: 'ASC',
        assignee_profile_id: parsedProfileId,
        profile_id: parsedProfileId,
        my_task_type: 'MY_TASK',
      })
    )
  }, [dispatchAction, userId, patientId, profileId])

  const tracking_enabled = dataLeadsData?.tracking?.enabled

  if (isStarterPlanUser) {
    // For braces patients, show OverviewBraces
    if (productType === treatmentTypeMain.BRACES) {
      return <OverviewBraces />
    } else {
      if (!tracking_enabled) {
        return <Overview />
      } else {
        return <StarterPlanOverview />
      }
    }
  }

  return <AssessmentView />
}

export default MyTasks
