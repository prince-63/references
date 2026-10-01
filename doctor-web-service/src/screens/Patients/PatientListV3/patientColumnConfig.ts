/**
 * Centralized column configuration for the PatientList V3 table.
 * Maps each column's accessorKey to its API sort field name.
 */

export const PATIENT_COLUMN_SORT_KEYS = {
  full_name: 'patient',
  practice_location_name: 'clinic',
  customer_mapped_id: 'id',
  product_name: 'product',
  case_type: 'caseType',
  order_status: 'status',
  last_updated: 'lastUpdated',
} as const

export type ColumnAccessorKey = keyof typeof PATIENT_COLUMN_SORT_KEYS
export type SortFieldValue = (typeof PATIENT_COLUMN_SORT_KEYS)[ColumnAccessorKey]

/**
 * Returns the API sort field for a given column accessor key.
 * Returns undefined if the column is not sortable.
 */
export const getSortFieldByAccessor = (accessorKey: string): string | undefined => {
  return PATIENT_COLUMN_SORT_KEYS[accessorKey as ColumnAccessorKey]
}
