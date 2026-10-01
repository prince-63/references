import {Pagination, Spin} from 'antd'
import Spinner from 'components/spinner/Spinner'
import dayjs from 'dayjs'
import {useMemo} from 'react'
import {useNavigate} from 'react-router'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'

type VspOrdersTableProps = {
  onPageChange: (page: number) => void
}

const VspOrdersTable = ({onPageChange}: VspOrdersTableProps) => {
  const navigate = useNavigate()
  const {miniDashboardData, loadingMiniDashboard} = useSelector((state: RootState) => state.profile)
  const {serviceConfig} = useSelector((state: RootState) => state.serviceConfiguration)

  const orderDetails = miniDashboardData?.vsp_order_details
  const orders = orderDetails?.order_info_list ?? []
  const pagination = orderDetails?.pagination_details
  const getOrderViewPath = (order: (typeof orders)[number]) =>
    serviceConfig?.VSP_PLANNING && order.patient_id
      ? `/vsp-profile/${order.patient_id}/case-details?order_id=${order.order_id}`
      : `/view-order/${order.order_id}`

  const summaryText = useMemo(() => {
    const total = pagination?.total_patients ?? 0
    const pageNo = pagination?.page_number ?? 1
    const pageSize = pagination?.page_size ?? 10
    if (!total) return '0-0 from 0'

    const start = (pageNo - 1) * pageSize + 1
    const end = Math.min(start + pageSize - 1, total)
    return `${start}-${end} from ${total}`
  }, [pagination])

  return (
    <div className='border border-mediumGray rounded-lg max-h-[calc(60vh)] w-full overflow-auto bg-white'>
      <Spin indicator={<Spinner loading />} spinning={loadingMiniDashboard}>
        <table className='w-full'>
          <thead className='bg-lightGray'>
            <tr>
              <th className='text-start text-black text-xs font-medium py-2 px-3 h-10 uppercase'>
                Patient
              </th>
              <th className='text-start text-black text-xs font-medium py-2 px-3 h-10 uppercase'>
                Order ID
              </th>
              <th className='text-start text-black text-xs font-medium py-2 px-3 h-10 uppercase'>
                Service Product
              </th>
              <th className='text-start text-black text-xs font-medium py-2 px-3 h-10 uppercase'>
                Order Type
              </th>
              <th className='text-start text-black text-xs font-medium py-2 px-3 h-10 uppercase'>
                Created On
              </th>
            </tr>
          </thead>

          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={5} className='text-center py-8 text-textColor text-sm'>
                  No orders available.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr
                  key={order.order_id}
                  className='border-b border-lightgray text-black text-sm cursor-pointer hover:bg-lightGray'
                  onClick={() => navigate(getOrderViewPath(order))}
                >
                  <td className='px-3 py-3 font-medium'>{order.patient_name || '-'}</td>
                  <td className='px-3 py-3'>
                    <div className='font-semibold uppercase'>#{order.order_id}</div>
                    <div className='text-xs text-textColor'>
                      Created on:{' '}
                      {order.created_on ? dayjs(order.created_on).format('DD-MMM-YYYY') : '-'}
                    </div>
                  </td>
                  <td className='px-3 py-3 text-textColor'>{order.service_product_name || '-'}</td>
                  <td className='px-3 py-3 text-textColor'>{order.order_type || '-'}</td>
                  <td className='px-3 py-3 text-textColor'>
                    {order.created_on ? dayjs(order.created_on).format('DD-MMM-YYYY') : '-'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className='border-t border-mediumGray bg-white sticky bottom-0 left-0 w-full z-10'>
          <div className='flex justify-between mt-2 mb-2 md:px-2.5 px-1 items-center'>
            <p className='text-textColor text-sm font-medium'>{summaryText}</p>
            <Pagination
              showSizeChanger={false}
              current={pagination?.page_number ?? 1}
              defaultPageSize={pagination?.page_size ?? 10}
              onChange={(page) => {
                onPageChange(page)
              }}
              total={pagination?.total_patients ?? 0}
            />
          </div>
        </div>
      </Spin>
    </div>
  )
}

export default VspOrdersTable
