import {Pagination, Spin} from 'antd'
import Spinner from 'components/spinner/Spinner'
import {useMemo} from 'react'
import {useNavigate} from 'react-router-dom'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import useProfileBasePath from '@hooks/useProfileBasePath'

type VspPatientsTableProps = {
  onPageChange: (page: number) => void
}

const VspPatientsTable = ({onPageChange}: VspPatientsTableProps) => {
  const navigate = useNavigate()
  const profileBasePath = useProfileBasePath()
  const {miniDashboardData, loadingMiniDashboard} = useSelector((state: RootState) => state.profile)

  const patientDetails = miniDashboardData?.vsp_patient_details
  const patients = patientDetails?.patient_info_list ?? []
  const pagination = patientDetails?.pagination_details

  const summaryText = useMemo(() => {
    const total = pagination?.total_patients ?? 0
    const pageNo = pagination?.page_number ?? 0
    const pageSize = pagination?.page_size ?? 10
    if (!total) return '0-0 from 0'

    const start = pageNo * pageSize + 1
    const end = Math.min(start + pageSize - 1, total)
    return `${start}-${end} from ${total}`
  }, [pagination])

  return (
    <div className='md:w-full flex flex-col card-wrapper mb-2 md:h-[calc(100vh-6rem)]'>
      <Spin indicator={<Spinner loading />} spinning={loadingMiniDashboard}>
        <div className='md:w-full h-full md:border border-mediumGray rounded-lg overflow-hidden bg-white'>
          <div className='w-full overflow-x-auto'>
            <table className='table-auto w-full'>
              <thead className='bg-mediumGray'>
                <tr>
                  <th className='text-start text-black text-xs font-medium py-2 px-3 h-10 uppercase'>
                    Patient
                  </th>
                  <th className='text-start text-black text-xs font-medium py-2 px-3 h-10 uppercase'>
                    Patient ID
                  </th>
                  <th className='text-start text-black text-xs font-medium py-2 px-3 h-10 uppercase'>
                    Created By
                  </th>
                </tr>
              </thead>

              <tbody>
                {patients.length === 0 ? (
                  <tr>
                    <td colSpan={3} className='text-center py-8 text-textColor text-sm'>
                      No patients available.
                    </td>
                  </tr>
                ) : (
                  patients.map((patient) => (
                    <tr
                      key={patient.patient_id}
                      className='border-b border-lightgray text-black text-sm cursor-pointer hover:bg-lightGray'
                      onClick={() => navigate(`${profileBasePath}/${patient.patient_id}`)}
                    >
                      <td className='px-3 py-3 font-medium'>{patient.patient_name || '-'}</td>
                      <td className='px-3 py-3 text-textColor'>
                        {patient.patient_uuid || patient.patient_id}
                      </td>
                      <td className='px-3 py-3 text-textColor'>{patient.created_by || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>

              <tfoot className='border-t border-mediumGray'>
                <tr>
                  <td colSpan={3}>
                    <div className='flex justify-between mt-2 mb-2 md:px-2.5 px-1 items-center'>
                      <p className='text-textColor text-sm font-medium'>{summaryText}</p>
                      <Pagination
                        showSizeChanger={false}
                        current={(pagination?.page_number ?? 0) + 1}
                        defaultPageSize={pagination?.page_size ?? 10}
                        onChange={(page) => {
                          onPageChange(page - 1)
                        }}
                        total={pagination?.total_patients ?? 0}
                      />
                    </div>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </Spin>
    </div>
  )
}

export default VspPatientsTable
