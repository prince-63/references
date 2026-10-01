import React, {createContext, useContext, useState} from 'react'
import {
  FilterDrawerFormikContextType,
  RowDataForBillingsAndPayments,
} from './billingsAndPayments.types'

interface BillingAndPaymentsContextType {
  isModalVisible: boolean
  toggleModal: (value: boolean) => void
  deleteEventModalVisible: boolean
  setDeleteEventModalVisible: (value: boolean) => void
  isShowPhotos: boolean
  setIsShowPhotos: (value: boolean) => void
  selectedRow: RowDataForBillingsAndPayments | null
  setSelectedRow: (row: RowDataForBillingsAndPayments | null) => void
  isEditPaymentReminder: boolean
  setIsEditPaymentReminder: (value: boolean) => void
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

const BillingAndPaymentsContext = createContext<BillingAndPaymentsContextType | undefined>(
  undefined
)

export const useBillingAndPaymentsContext = () => {
  const context = useContext(BillingAndPaymentsContext)
  if (!context) {
    throw new Error('useBillingAndPaymentsContext must be used within a BillingAndPaymentsProvider')
  }
  return context
}

interface BillingAndPaymentsProviderProps {
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

export const BillingAndPaymentsProvider: React.FC<BillingAndPaymentsProviderProps> = ({
  children,
  handleOnSearch,
  pageNumber,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [deleteEventModalVisible, setDeleteEventModalVisible] = useState(false)
  const [isShowPhotos, setIsShowPhotos] = useState(false)
  const [selectedRow, setSelectedRow] = useState<RowDataForBillingsAndPayments | null>(null)
  const [isEditPaymentReminder, setIsEditPaymentReminder] = useState(false)

  const toggleModal = (value: boolean) => {
    setIsModalVisible(value)
  }

  return (
    <BillingAndPaymentsContext.Provider
      value={{
        isModalVisible,
        toggleModal,
        deleteEventModalVisible,
        setDeleteEventModalVisible,
        isShowPhotos,
        setIsShowPhotos,
        selectedRow,
        setSelectedRow,
        isEditPaymentReminder,
        setIsEditPaymentReminder,
        pageNumber,
        handleOnSearch,
      }}
    >
      {children}
    </BillingAndPaymentsContext.Provider>
  )
}
