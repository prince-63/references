import alignerStatusType from '@constants/alignerStatusType'
import jawType from '@constants/jawType'
import productionStatusTypesConstants from '@constants/productionStatusTypes.constants'
import productionStatusFilterOptions from '@staticData/productionStatusFilterOptions'
import {AlignerJourney, Patient} from './productionOrders.interface'
import {GroupedAlignersByStatusTypeForTable} from '../helpers/organize'

export type ProductionFilterOption = (typeof productionStatusFilterOptions)[number]
export type ProductionFilterOptionsWithoutAllOrders = Exclude<
  ProductionFilterOption,
  {value: typeof productionStatusTypesConstants.ALL_ORDERS}
>
export type ProductionFilter = Record<ProductionFilterOption['value'], boolean>
export type ProductionStatus = ProductionFilterOption['value']
export type productionStatusKeys = keyof Omit<
  typeof productionStatusTypesConstants,
  typeof productionStatusTypesConstants.ALL_ORDERS
>
export type inManufacturingKeys = keyof Pick<
  typeof alignerStatusType,
  | typeof alignerStatusType.IN_PRINTING
  | typeof alignerStatusType.IN_PRODUCTION
  | typeof alignerStatusType.IN_TRANSIT
>

// type ExtendedStatusKeys =
//   | productionStatusKeys
//   | typeof productionStatusTypesConstants.IN_MANUFACTURING

// export type GroupedInManufacturingStatusTypes = {
//   IN_PRODUCTION: Record<keyof typeof jawType, IConsecutiveAlignerRow[]>
//   IN_TRANSIT: Record<keyof typeof jawType, IConsecutiveAlignerRow[]>
//   IN_PRINTING: Record<keyof typeof jawType, IConsecutiveAlignerRow[]>
// }
export interface IConsecutiveAlignerRow {
  startAlignerNumber: number
  endAlignerNumber: number | null
  startAlignerStartDate: string
  startAlignerEndDate: string
  endAlignerStartDate: string
  endAlignerEndDate: string
  startJawType: keyof typeof jawType
  endJawType: keyof typeof jawType | ''
}
// export type GroupedAlignersByStatusType = Record<
//   ExtendedStatusKeys | inManufacturingKeys,
//   Record<keyof typeof jawType, IConsecutiveAlignerRow[] | GroupedInManufacturingStatusTypes> | []
// >

// export type RestructuredGroupedAlignersByStatusType = {
//   [K in ExtendedStatusKeys]: K extends typeof productionStatusTypesConstants.IN_MANUFACTURING
//     ? GroupedInManufacturingStatusTypes
//     : Record<keyof typeof jawType, IConsecutiveAlignerRow[]>
// }
// export type GroupedAlignersByStatusTypeForTable = {
//   [K in StatusKeysWithCompleted]: K extends typeof productionStatusTypesConstants.IN_MANUFACTURING
//     ? GroupedInManufacturingStatusTypes
//     : Record<keyof typeof jawType, IConsecutiveAlignerRow[]>
// }
export type OrderItem = Record<keyof typeof jawType, IConsecutiveAlignerRow[]>

export type IProductionOrderRowData = {
  patient: Patient
  orderDescription: GroupedAlignersByStatusTypeForTable
  orderStartDate: string | null
  alignerBrand: string
  alignerJourney: AlignerJourney
}
