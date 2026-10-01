import React, {createContext, useContext, ReactNode, useMemo} from 'react'
import {useSelector, useDispatch} from 'react-redux'
import {RootState} from 'redux/store'
import {updateOrder} from 'redux/Slices/AppSlice/orders/orders.slice'

type OrderRow = any

interface OrderContextType {
  getOrdersByStage: (stageId: string) => OrderRow[]
  getOrdersByType: (type?: string) => OrderRow[]
  updateOrderStatus: (orderId: string, newStatus: string) => Promise<any>
  saveWorkflowConfiguration: (orderType: string, updatedStages: any[]) => void
}

const OrderContext = createContext<OrderContextType | undefined>(undefined)

export const OrderContextProvider: React.FC<{children: ReactNode}> = ({children}) => {
  const dispatch = useDispatch()
  const {alignerOrderList} = useSelector((state: RootState) => state.orders)
  const orders = alignerOrderList?.order_details || []

  const getOrdersByStage = (stageId: string) => {
    return orders.filter((o: any) =>
      (o?.status || '').toLowerCase().includes(stageId.toLowerCase())
    )
  }

  const getOrdersByType = (type?: string) => {
    if (!type) return orders
    return orders.filter((o: any) => (o?.order_type || '').toLowerCase() === type.toLowerCase())
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const order: any = orders.find((o: any) => o?.order_id === orderId) || {}
      const doctor_id: number = (order?.doctor_id as number) || (order?.doctorId as number) || 0
      const payload = {order_id: orderId, status: newStatus, doctor_id}
      const res = await dispatch(updateOrder(payload) as any)
      return res
    } catch (err) {
      return Promise.reject(err)
    }
  }

  const saveWorkflowConfiguration = (orderType: string, updatedStages: any[]) => {
    // Placeholder: persist workflow config if needed. No-op for now.
    //console.debug('saveWorkflowConfiguration called', orderType, updatedStages)
    console.error('saveWorkflowConfiguration called', orderType, updatedStages)
  }

  const value = useMemo(
    () => ({getOrdersByStage, getOrdersByType, updateOrderStatus, saveWorkflowConfiguration}),
    [orders]
  )

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>
}

export const useOrderContext = () => {
  const ctx = useContext(OrderContext)
  if (!ctx) throw new Error('useOrderContext must be used within OrderContextProvider')
  return ctx
}
