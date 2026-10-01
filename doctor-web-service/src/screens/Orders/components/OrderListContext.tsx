import React, {createContext, useContext} from 'react'
import {FilterDrawerFormikContextType} from '../orders.types'

interface OrderListContextType {
  handleOnSearch: ({
    page,
    payload,
    updateLoadingState,
  }: {
    page?: number
    payload: FilterDrawerFormikContextType
    updateLoadingState?: boolean
  }) => void
}

const OrderListContext = createContext<OrderListContextType | undefined>(undefined)

export const useOrdersListContext = () => {
  const context = useContext(OrderListContext)
  if (!context) {
    throw new Error('Order list must be in Provider')
  }
  return context
}

interface OrderListContextProps {
  children: React.ReactNode
  pageNumber: number
  handleOnSearch: ({
    page,
    payload,
    updateLoadingState,
  }: {
    page?: number
    payload: FilterDrawerFormikContextType
    updateLoadingState?: boolean
  }) => void
}

export const OrderListContextProvider: React.FC<OrderListContextProps> = ({
  children,
  handleOnSearch,
}) => {
  return (
    <OrderListContext.Provider
      value={{
        handleOnSearch,
      }}
    >
      {children}
    </OrderListContext.Provider>
  )
}
