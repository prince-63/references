import productionStatusFilterOptions from '@staticData/productionStatusFilterOptions'
import {AlignersEntity, IProductionOrder} from '../types/productionOrders.interface'
import productionStatusTypesConstants from '@constants/productionStatusTypes.constants'
import alignerStatusOptions from '@staticData/alignerStatusOptions'
import alignerStatusType from '@constants/alignerStatusType'
import {IConsecutiveAlignerRow} from '../types/productionModule.types'

export interface GroupedAlignersByStatusType {
  UNPROCESSED?: IConsecutiveAlignerRow[]
  IN_INVENTORY?: IConsecutiveAlignerRow[]
  ISSUED_TO_PATIENT?: IConsecutiveAlignerRow[]
  COMPLETED?: IConsecutiveAlignerRow[]
  IN_PRINTING?: IConsecutiveAlignerRow[]
  IN_PRODUCTION?: IConsecutiveAlignerRow[]
  IN_TRANSIT?: IConsecutiveAlignerRow[]
}

export type GroupedInManufacturingStatusTypes = {
  IN_PRODUCTION: IConsecutiveAlignerRow[]
  IN_TRANSIT: IConsecutiveAlignerRow[]
  IN_PRINTING: IConsecutiveAlignerRow[]
}

export type GroupedAlignersByStatusTypeForTable = {
  UNPROCESSED?: IConsecutiveAlignerRow[]
  IN_INVENTORY?: IConsecutiveAlignerRow[]
  ISSUED_TO_PATIENT?: IConsecutiveAlignerRow[]
  COMPLETED?: IConsecutiveAlignerRow[]
  IN_MANUFACTURING?: GroupedInManufacturingStatusTypes
}

const createAlignerStatus = (
  alignerNumbers: number[],
  aligners: AlignersEntity[],
  start: number,
  end: number
): IConsecutiveAlignerRow => {
  const endAlignerNumber = start === end ? null : alignerNumbers[end]
  return {
    startAlignerNumber: alignerNumbers[start],
    endAlignerNumber,
    startAlignerStartDate: aligners[start].start_date,
    startAlignerEndDate: aligners[start].end_date,
    endAlignerStartDate: endAlignerNumber ? aligners[end].start_date : '',
    endAlignerEndDate: endAlignerNumber ? aligners[end].end_date : ' ',
    startJawType: aligners[start].jaw_type,
    endJawType: endAlignerNumber ? aligners[end].jaw_type : '',
  }
}

const processAlignerNumbers = (
  alignerNumbers: number[],
  aligners: AlignersEntity[],
  groupedAligners: Record<string, any>,
  option: {value: string}
) => {
  if (alignerNumbers.length === 0) return

  let start = 0
  for (let i = 1; i < alignerNumbers.length; i++) {
    if (alignerNumbers[i] !== alignerNumbers[i - 1] + 1) {
      const alignerStatus = createAlignerStatus(alignerNumbers, aligners, start, i - 1)

      start = i
      if (!groupedAligners[option.value]) {
        groupedAligners[option.value] = []
      }

      groupedAligners[option.value].push(alignerStatus)
    }
  }

  const alignerStatus = createAlignerStatus(
    alignerNumbers,
    aligners,
    start,
    alignerNumbers.length - 1
  )

  if (!groupedAligners[option.value]) {
    groupedAligners[option.value] = []
  }

  groupedAligners[option.value].push(alignerStatus)
}

const restructureData = (groupedAligners: any) => {
  const newObj = {} as GroupedAlignersByStatusTypeForTable

  if (groupedAligners.IN_PRINTING || groupedAligners.IN_PRODUCTION || groupedAligners.IN_TRANSIT) {
    newObj.IN_MANUFACTURING = {
      IN_PRINTING: groupedAligners.IN_PRINTING,
      IN_PRODUCTION: groupedAligners.IN_PRODUCTION,
      IN_TRANSIT: groupedAligners.IN_TRANSIT,
    }
  }

  for (const key in groupedAligners) {
    if (
      key !== alignerStatusType.IN_PRINTING &&
      key !== alignerStatusType.IN_PRODUCTION &&
      key !== alignerStatusType.IN_TRANSIT
    ) {
      newObj[key as keyof typeof newObj] = groupedAligners[key]
    }
  }

  return newObj
}

const organize = (order: IProductionOrder): GroupedAlignersByStatusTypeForTable => {
  const groupedAligners = {} as GroupedAlignersByStatusType

  productionStatusFilterOptions.forEach((option) => {
    if (
      // option.value === productionStatusTypesConstants.COMPLETED ||
      option.value === productionStatusTypesConstants.ALL_ORDERS
    )
      return
    const alignersWithStatus = order.aligners_with_status
    if (!alignersWithStatus) return
    const alignersWithSubStatus = alignersWithStatus[option.value]?.aligners_with_sub_status

    if (!alignersWithSubStatus) return
    alignerStatusOptions.forEach((option) => {
      const status = alignersWithSubStatus[option.value]
      if (!status) return
      const aligners = status?.aligners || []
      const alignerNumbers = aligners.map((aligner) => {
        return aligner.sr_no
      })

      processAlignerNumbers(alignerNumbers, aligners, groupedAligners, option)
    })
  })

  return restructureData(groupedAligners)
}

export default organize
