import jawType from '@constants/jawType'
import alignerStatusType from '../../../@constants/alignerStatusType'
import productionStatusTypesConstants from '../../../@constants/productionStatusTypes.constants'

export type IProductionOrder = {
  patient: Patient
  aligner_journey: AlignerJourney
  reminders?: Reminder[]
  aligners_with_status?: Partial<ExcludedStatusTypes>
  notes?: NotesEntity[] | null
}

type ExcludedStatusTypes = {
  [K in keyof Omit<
    typeof productionStatusTypesConstants,
    typeof productionStatusTypesConstants.ALL_ORDERS
  >]: IProductionStatus
}

export type IApiResponse = {
  orders: IProductionOrder[]
  total_orders: ITotalOrders
}
export interface ITotalOrders {
  status_wise_total_orders: {
    [K in keyof Omit<
      typeof productionStatusTypesConstants,
      typeof productionStatusTypesConstants.ALL_ORDERS
    >]: number
  }
  total_orders: number
}

export interface Patient {
  id: number
  first_name: string
  last_name: string
}
export interface AlignerJourney {
  aligner_journey_id: number
  current_aligner_no: number
  total_aligners: number
  brand: string
  notes: NotesEntity[]
  aligners: {
    sr_no: number
    jaw_type: keyof typeof jawType
    start_date: string
    change_offset: number | null
    end_date: string
  }[]
}
export interface Reminder {
  remind_at: string
  reminder_id: number
  title?: string
  notes?: string
  time?: string
}

export interface AlignersEntity {
  sr_no: number
  jaw_type: keyof typeof jawType
  start_date: string
  end_date: string
}
type IAlignersWithSubStatus = {
  [K in keyof typeof alignerStatusType]: ISubStatus
}
export interface IProductionStatus {
  start_date?: string
  aligners_with_sub_status: Partial<IAlignersWithSubStatus>
}
export interface ISubStatus {
  total_aligners: number
  aligners?: AlignersEntity[] | null
  start_date?: string
}
export interface NotesEntity {
  id: number
  created_at: string
  title: string
  text: string
  added_by: number
  added_by_user_type: 'DOCTOR' | 'PATIENT'
}
