export interface IStatus {
  old_production_sub_status: string
  new_production_sub_status: string
  logged_at: string
}
export interface RowData {
  id: number
  alignerNo: number
  startDate: string
  endDate: string
  alignerType: string
  daysWorn: number
  avgWearTime: number | null
  compliance: string | null
  currentAlignerNo: number
  change_offset: number | null
  changeDate: string | null
  productionLab: string | null
  productionLabId: number | null
  status: string | null
  sub_status: string | null
  statusUpdatedOn?: IStatus
  alignerJourneyId?: number | null
}
