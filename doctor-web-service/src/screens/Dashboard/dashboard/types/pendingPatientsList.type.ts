import pendingPatientsFilterOption from '../constants/pendingPatientsFilterOption'
import pendingPatientsTypes from './pendingPatients.types'

export type PendingPatientsStatus = (typeof pendingPatientsFilterOption)[number]['value']
export type PendingPatientsFilterOptionsRecord = Record<keyof typeof pendingPatientsTypes, any[]>
