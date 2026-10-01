const manufacturingBatchStatusConstants = {
  MANUFACTURING_STARTED: 'MANUFACTURING_STARTED',
  COMPLETED: 'COMPLETED',
  SHIPPED: 'SHIPPED',
  DELIVERED: 'DELIVERED',
} as const

export default manufacturingBatchStatusConstants

export type ManufacturingBatchStatus =
  (typeof manufacturingBatchStatusConstants)[keyof typeof manufacturingBatchStatusConstants]
