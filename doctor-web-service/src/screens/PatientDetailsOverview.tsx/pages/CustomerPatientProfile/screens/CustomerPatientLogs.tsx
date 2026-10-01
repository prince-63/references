import useDispatchAction from '@hooks/useDispatchAction'
import React, {useEffect} from 'react'
import {useParams} from 'react-router-dom'
import {getAuditLogs} from 'redux/Slices/AppSlice/workflow/workflow.slice'
import ActivityLogs from 'screens/PatientDetailsOverview.tsx/tabs/AuditLogs'
import {safeParseInt} from 'utils/ConstFunctions'
import SectionCard from './SectionCard'

const CustomerPatientLogs = () => {
  const {dispatchAction} = useDispatchAction()
  const {patientId} = useParams()

  useEffect(() => {
    dispatchAction(getAuditLogs({patient_id: safeParseInt(patientId)}))
  }, [])

  return (
    <SectionCard className='mt-4'>
      <ActivityLogs />
    </SectionCard>
  )
}

export default CustomerPatientLogs
