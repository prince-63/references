import {useMemo} from 'react'
import organize from 'screens/Production/helpers/organize'

import {
  IProductionOrderRowData,
  productionStatusKeys,
} from 'screens/Production/types/productionModule.types'
import {IProductionOrder} from 'screens/Production/types/productionOrders.interface'
import hasValue from 'utils/hasValue'

const useMappedOrders = ({
  productionOrders,
  status,
}: {
  productionOrders: IProductionOrder[]
  status: productionStatusKeys
}) => {
  const mappedOrders = useMemo(() => {
    if (!hasValue(productionOrders)) return []
    const productionOrderRows: IProductionOrderRowData[] = []
    productionOrders.forEach((order) => {
      const structuredAligners = organize(order)
      const alignerOrderRow = {
        patient: order.patient,
        orderDescription: structuredAligners,
        orderStartDate: order.aligners_with_status
          ? (order.aligners_with_status[status]?.start_date ?? null)
          : null,
        alignerBrand: order.aligner_journey.brand,
        alignerJourney: order.aligner_journey,
      }
      productionOrderRows.push(alignerOrderRow)
    })
    return productionOrderRows
  }, [productionOrders])

  return mappedOrders
}

export default useMappedOrders
