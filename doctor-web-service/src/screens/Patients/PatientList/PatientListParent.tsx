import React, {useEffect, useState} from 'react'
import {Header} from 'components/PatientList/Header'
import cn from '@utils/cn'
import PatientList from './PatientList'
import ArchivePatientsList from './ArchivePatientsList'
import {useLocation} from 'react-router-dom'

const PatientListParent = () => {
  const location = useLocation()
  const requestedPatientListTab = (location.state as any)?.patientListTab ?? null
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'ARCHIVED'>(
    requestedPatientListTab === 'ARCHIVED' ? 'ARCHIVED' : 'ACTIVE'
  )

  useEffect(() => {
    if (requestedPatientListTab === 'ARCHIVED') {
      setActiveTab('ARCHIVED')
      return
    }

    if (requestedPatientListTab === 'ACTIVE') {
      setActiveTab('ACTIVE')
    }
  }, [requestedPatientListTab])

  const headerTitle = activeTab === 'ACTIVE' ? 'Patients' : 'Archived patients'

  return (
    <div>
      <Header title={headerTitle} subtitle={''} activeList={true} />

      <div className='mt-4 border-b border-lighterGray flex gap-6'>
        <button
          type='button'
          className={cn(
            'pb-2 text-sm font-semibold border-b-2',
            activeTab === 'ACTIVE'
              ? 'border-primaryColor text-primaryColor'
              : 'border-transparent text-textColor'
          )}
          onClick={() => setActiveTab('ACTIVE')}
        >
          Active
        </button>

        <button
          type='button'
          className={cn(
            'pb-2 text-sm font-semibold border-b-2',
            activeTab === 'ARCHIVED'
              ? 'border-primaryColor text-primaryColor'
              : 'border-transparent text-textColor'
          )}
          onClick={() => setActiveTab('ARCHIVED')}
        >
          Archived
        </button>
      </div>

      <div className='mt-4'>
        {activeTab === 'ACTIVE' ? <PatientList /> : <ArchivePatientsList />}
      </div>
    </div>
  )
}

export default PatientListParent
