import {flexRender, HeaderGroup} from '@tanstack/react-table'
import {ChevronUp, ChevronDown, ChevronsUpDown} from 'lucide-react'
import cn from '@utils/cn'
import {PatientSummaryDTO} from '../types'
import {PATIENT_COLUMN_SORT_KEYS} from '../patientColumnConfig'

interface SortableHeaderProps {
  headerGroup: HeaderGroup<PatientSummaryDTO>
  sortBy: string
  sortDirection: 'ASC' | 'DESC'
  onSort: (columnId: string) => void
}

const SortableHeader = ({headerGroup, sortBy, sortDirection, onSort}: SortableHeaderProps) => {
  return (
    <tr key={headerGroup.id} className='border-b border-gray-200'>
      {headerGroup.headers.map((header) => {
        const colId = header.column.id
        const apiField = PATIENT_COLUMN_SORT_KEYS[colId as keyof typeof PATIENT_COLUMN_SORT_KEYS]
        const isSortable = !!apiField
        const isActive = sortBy === apiField

        return (
          <th
            key={header.id}
            className={cn(
              'py-4 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider',
              isSortable && 'cursor-pointer select-none hover:bg-gray-50 transition-colors'
            )}
            onClick={() => isSortable && onSort(colId)}
          >
            <div className='flex items-center gap-1'>
              {header.isPlaceholder
                ? null
                : flexRender(header.column.columnDef.header, header.getContext())}
              {isSortable && (
                <span className='inline-flex ml-1'>
                  {isActive ? (
                    sortDirection === 'DESC' ? (
                      <ChevronDown size={14} className='text-indigo-600' />
                    ) : (
                      <ChevronUp size={14} className='text-indigo-600' />
                    )
                  ) : (
                    <ChevronsUpDown size={14} className='text-gray-400' />
                  )}
                </span>
              )}
            </div>
          </th>
        )
      })}
    </tr>
  )
}

export default SortableHeader
