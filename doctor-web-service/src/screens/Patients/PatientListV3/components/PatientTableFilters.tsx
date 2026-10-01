import {Input, Select} from 'antd'
import {HeaderGroup} from '@tanstack/react-table'
import {OrderStatus, PatientSummaryDTO} from '../types'

const {Option} = Select

interface PatientTableFiltersProps {
  headerGroup: HeaderGroup<PatientSummaryDTO>
  search: string
  setSearch: (val: string) => void
  onSearch: (searchOverride?: string) => void
  customerMappedId: string
  setCustomerMappedId: (val: string) => void
  setClinicId: (val: number | null) => void
  setProductId: (val: number | null) => void
  setCaseType: (val: string | null) => void
  setStatus: (val: OrderStatus | null) => void
  practiceLocationsList: any[]
  productList: {value: number; label: string}[]
}

const PatientTableFilters = ({
  headerGroup,
  search,
  setSearch,
  onSearch,
  customerMappedId,
  setCustomerMappedId,
  setClinicId,
  setProductId,
  setCaseType,
  setStatus,
  practiceLocationsList,
  productList,
}: PatientTableFiltersProps) => {
  return (
    <tr key={`${headerGroup.id}-filters`} className='border-b border-gray-200 bg-gray-50'>
      {headerGroup.headers.map((header) => {
        const colId = header.column.id
        return (
          <td key={`filter-${header.id}`} className='py-3 px-4'>
            {colId === 'full_name' && (
              <Input
                placeholder='Search name...'
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  if (!e.target.value) onSearch('')
                }}
                onPressEnter={() => onSearch()}
                className='rounded-lg border-gray-200'
                allowClear
              />
            )}
            {colId === 'practice_location_name' && (
              <Select
                placeholder='All'
                className='w-full'
                allowClear
                onChange={(val) => setClinicId(val)}
              >
                {practiceLocationsList?.map((loc: any) => (
                  <Option key={loc.value} value={loc.value}>
                    {loc.label}
                  </Option>
                ))}
              </Select>
            )}
            {colId === 'customer_mapped_id' && (
              <Input
                placeholder='Search ID...'
                value={customerMappedId}
                onChange={(e) => {
                  setCustomerMappedId(e.target.value)
                  if (!e.target.value) onSearch()
                }}
                onPressEnter={() => onSearch()}
                className='rounded-lg border-gray-200'
                allowClear
              />
            )}
            {colId === 'product_name' && (
              <Select
                placeholder='All'
                className='w-full'
                allowClear
                onChange={(val) => setProductId(val)}
              >
                {productList?.map((prod) => (
                  <Option key={prod.value} value={prod.value}>
                    {prod.label}
                  </Option>
                ))}
              </Select>
            )}
            {colId === 'case_type' && (
              <Select
                placeholder='All'
                className='w-full'
                allowClear
                onChange={(val) => setCaseType(val)}
              >
                <Option value='INITIAL'>Initial</Option>
                <Option value='REFINEMENT'>Refinement</Option>
              </Select>
            )}
            {colId === 'order_status' && (
              <Select
                placeholder='All'
                className='w-full'
                allowClear
                onChange={(val) => setStatus(val)}
              >
                <Option value='DRAFT'>Draft</Option>
                <Option value='IN_PROGRESS'>In Progress</Option>
                <Option value='NEED_MORE_INFO'>Need More Info</Option>
                <Option value='IN_REVIEW'>In Review</Option>
                <Option value='APPROVED'>Approved</Option>
                <Option value='RE_PLAN'>Request Revision</Option>
                <Option value='COMPLETED'>Completed</Option>
              </Select>
            )}
          </td>
        )
      })}
    </tr>
  )
}

export default PatientTableFilters
