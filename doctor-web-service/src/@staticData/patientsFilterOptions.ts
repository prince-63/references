import patientFilterOptionListTypeConstant from '@constants/patientFilterOptionListType.constant'
import patientsFilterOptionsConstants from '../@constants/patientsFilterOptions.constants'

export default [
  {
    label: 'All Patients',
    value: patientsFilterOptionsConstants.ALL,
    listStatus: patientFilterOptionListTypeConstant.ALL,
  },
  {
    label: 'With patient app',
    value: patientsFilterOptionsConstants.PATIENTAPP,
    listStatus: patientFilterOptionListTypeConstant.ACTIVE,
  },
  {
    label: 'Manual tracking',
    value: patientsFilterOptionsConstants.MANUAL,
    listStatus: patientFilterOptionListTypeConstant.INACTIVE,
  },
  {
    label: 'Connection pending',
    value: patientsFilterOptionsConstants.PENDING,
    listStatus: patientFilterOptionListTypeConstant.INACTIVE,
  },
]
