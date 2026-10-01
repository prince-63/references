import {flexRender, Row} from '@tanstack/react-table'
import {useNavigate} from 'react-router-dom'
import useProfileBasePath from '@hooks/useProfileBasePath'
import {PatientSummaryDTO} from '../types'
import useDispatchAction from '@hooks/useDispatchAction'
import {resetCustomerPatientState} from 'redux/Slices/AppSlice/CustomerPatientProfile/CustomerPatientProfile.slice'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'

interface PatientTableBodyProps {
  rows: Row<PatientSummaryDTO>[]
  columnCount: number
}

const PatientTableBody = ({rows, columnCount}: PatientTableBodyProps) => {
  const navigate = useNavigate()
  const {serviceConfig} = useSelector((state: RootState) => state.serviceConfiguration)

  const isVspPlanning = serviceConfig?.VSP_PLANNING
  const basePath = useProfileBasePath()
  const {dispatchAction} = useDispatchAction()
  if (rows.length === 0) {
    return (
      <tbody>
        <tr>
          <td colSpan={columnCount} className='p-8 text-center text-gray-500'>
            No records found
          </td>
        </tr>
      </tbody>
    )
  }

  return (
    <tbody>
      {rows.map((row) => (
        <tr
          key={row.id}
          className='border-b border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer'
          onClick={() => {
            dispatchAction(resetCustomerPatientState())
            const orderId = row.original.order_id
            const path = !isVspPlanning
              ? `${basePath}/${row.original.patient_id}`
              : orderId
                ? `${basePath}/${row.original.patient_id}/plans?order_id=${orderId}`
                : `${basePath}/${row.original.patient_id}/plans`
            navigate(path)
          }}
        >
          {row.getVisibleCells().map((cell) => (
            <td key={cell.id} className='py-4 px-4'>
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  )
}

export default PatientTableBody
