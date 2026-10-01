import patientsFilterOptionsConstants from '../@constants/patientsFilterOptions.constants'
import patientsFilterOptions from '../@staticData/patientsFilterOptions'

export type PatientStatus = (typeof patientsFilterOptions)[number]['value']
export type PatientsFilterOptionsRecord = Record<keyof typeof patientsFilterOptionsConstants, any[]>
