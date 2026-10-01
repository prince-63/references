import {Pagination} from 'antd'

interface PatientListPaginationProps {
  page: number
  pageSize: number
  totalRecords: number
  showRowSelector: boolean
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
}

const PatientListPagination = ({
  page,
  pageSize,
  totalRecords,
  showRowSelector,
  onPageChange,
  onPageSizeChange,
}: PatientListPaginationProps) => {
  return (
    <div className='p-4 flex md:flex-row flex-col justify-between items-center border-t border-gray-200'>
      <div className='text-sm text-gray-600'>
        Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, totalRecords)} of{' '}
        {totalRecords} results
      </div>
      <div className='flex md:flex-row flex-col items-center gap-4'>
        {showRowSelector && (
          <div className='flex items-center gap-2'>
            <label className='text-sm font-medium text-gray-700'>Rows:</label>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className='border border-gray-300 rounded-md px-3 py-2 bg-white text-sm font-medium text-gray-700 hover:border-gray-400'
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        )}
        <Pagination
          current={page}
          total={totalRecords}
          pageSize={pageSize}
          onChange={onPageChange}
          showSizeChanger={false}
        />
      </div>
    </div>
  )
}

export default PatientListPagination
