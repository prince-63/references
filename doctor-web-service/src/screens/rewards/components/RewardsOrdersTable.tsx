import React, {FC} from 'react'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import {Pagination, Spin} from 'antd'
import Spinner from 'components/spinner/Spinner'
import SuccessToast from 'components/modal/Alert/SuccessToast'
import RenderTableHeader from 'screens/Patients/LeadsProfile/main/files/components/RenderTableHeader'
import RenderCell from 'screens/Patients/LeadsProfile/main/files/components/RenderCell'
import {Image} from 'assets/images/Images/Image'
import {DefaultImage} from 'assets/images/Images/DefaultImage'
import hasValue from 'utils/hasValue'
import {useMediaQuery} from 'react-responsive'
import {getImageUrlById} from 'utils/ConstFunctions'
import useDispatchAction from '@hooks/useDispatchAction'
import {
  approveRewardOrder,
  rejectRewardOrder,
  getRewardOrders,
} from 'redux/Slices/AppSlice/rewards/rewards.slice'
import {getStorageType} from 'utils/storage'
import CommonEmptyState from 'components/emptyState/CommonEmptyState'
import {IMAGE_EMPTY_STATE} from 'utils/ImageConst'
import moment from 'moment'
import When from 'components/when/When'

interface RewardsOrdersTableProps {
  status: string
  page: number
  search: string
  setStatus: (status: string) => void
  setPage: (page: number) => void
  handleSearch: ({page, search}: {page: number; search: string | null}) => void
}

const RewardsOrdersTable: FC<RewardsOrdersTableProps> = ({
  status,
  page,
  search,
  setStatus,
  setPage,
  handleSearch,
}) => {
  const isMobile = useMediaQuery({query: '(max-width: 768px)'})
  const {dispatchAction} = useDispatchAction()
  const {rewardOrders, orderPagination, loading} = useSelector((state: RootState) => state.rewards)
  const doctorId = getStorageType().getItem('profileId')

  const totalOrders = orderPagination?.total_orders || 0

  const refreshOrders = () => {
    if (doctorId) {
      dispatchAction(
        getRewardOrders({
          profile_id: Number(doctorId),
          status: status === 'ALL' ? null : status,
          search_text: search,
          page: page - 1,
          size: 10,
        })
      )
    }
  }

  const handleApprove = async (id: number) => {
    if (doctorId) {
      const res: any = await dispatchAction(
        approveRewardOrder({
          profile_id: Number(doctorId),
          reward_order_id: id,
          notes: 'Approved',
        })
      )
      if (!res.error) {
        SuccessToast('Order approved successfully!')
        refreshOrders()
      }
    }
  }

  const handleCancel = async (id: number) => {
    if (doctorId) {
      const res: any = await dispatchAction(
        rejectRewardOrder({
          profile_id: Number(doctorId),
          reward_order_id: id,
          reason: 'Cancelled by doctor',
        })
      )
      if (!res.error) {
        SuccessToast('Order cancelled successfully!')
        refreshOrders()
      }
    }
  }

  const renderEmptyState = () => (
    <div className='flex justify-center items-center py-10 w-full'>
      <CommonEmptyState
        image={IMAGE_EMPTY_STATE}
        boxStyle='text-center'
        title='No orders found'
        titleStyle='text-[20px] font-semibold md:mt-7 text-black'
        subTitle='There are no reward orders to display at the moment'
        subTitleStyle='w-[363px] text-[16px] font-normal md:mt-4 mx-auto'
      />
    </div>
  )

  const statusOptions = [
    {label: 'All', value: 'ALL'},
    {label: 'Pending', value: 'PENDING'},
    {label: 'Approved', value: 'APPROVED'},
    {label: 'Cancelled', value: 'REJECTED'},
  ]

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex items-center gap-2'>
        {statusOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => {
              setStatus(opt.value)
              setPage(1)
            }}
            className={`px-4 py-1 rounded-full text-sm transition-colors ${
              status === opt.value
                ? 'bg-primarySupport text-primaryColor border border-primaryColor'
                : 'bg-white border border-mediumGray text-textColor'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <Spin indicator={<Spinner loading />} spinning={loading}>
        {isMobile ? (
          <div className='flex flex-col gap-3'>
            {rewardOrders.length > 0 ? (
              <>
                {rewardOrders.map((o) => (
                  <div
                    key={o.reward_order_id}
                    className='p-4 bg-white rounded-lg shadow-sm border border-lightGray'
                  >
                    <div className='flex justify-between items-start'>
                      <div className='flex items-center gap-3'>
                        {hasValue(o.profile_picture_id || o.profile_picture_url) ? (
                          <Image
                            className='w-11 h-11 object-cover rounded-full'
                            src={
                              o.profile_picture_id
                                ? getImageUrlById(o.profile_picture_id)
                                : o.profile_picture_url
                            }
                            showLoading={false}
                          />
                        ) : (
                          <DefaultImage letter={o.patient_name?.charAt(0) || ''} />
                        )}
                        <div>
                          <div className='text-sm font-semibold text-black'>{o.patient_name}</div>
                          <When isTrue={hasValue(o.patient_customer_mapped_id)}>
                            <div className='text-sm font-normal text-textColor uppercase truncate'>
                              ID: {o.patient_customer_mapped_id}
                            </div>
                          </When>
                        </div>
                      </div>
                      <div className='text-right'>
                        <div className='text-sm text-textColor'>Coins</div>
                        <div className='text-lg font-semibold'>{o.coin_value}</div>
                      </div>
                    </div>

                    <div className='mt-2 text-sm text-black font-medium'>
                      Product: <span className='text-textColor font-normal'>{o.product_name}</span>
                    </div>

                    <div className='mt-3 flex items-center justify-between'>
                      <div className='text-sm text-textColor'>
                        {moment(o.order_date).format('MMM DD,YYYY')}
                      </div>
                      <div className='flex items-center gap-2'>
                        {o.status === 'PENDING' && (
                          <span className='inline-block px-3 py-1 text-xs rounded-full bg-orangeSupport text-orange'>
                            Pending
                          </span>
                        )}
                        {o.status === 'APPROVED' && (
                          <span className='inline-block px-3 py-1 text-xs rounded-full bg-tertiarySupport text-tertiaryColor'>
                            Approved
                          </span>
                        )}
                        {(o.status === 'CANCELLED' || o.status === 'REJECTED') && (
                          <span className='inline-block px-3 py-1 text-xs rounded-full bg-redSupport text-red'>
                            Cancelled
                          </span>
                        )}
                      </div>
                    </div>

                    {o.status === 'PENDING' && (
                      <div className='mt-3 flex gap-2'>
                        <button
                          onClick={() => handleApprove(o.reward_order_id)}
                          className='flex-1 px-4 py-2 bg-primaryColor text-white rounded-md font-medium hover:bg-primaryColor/90 transition-colors text-sm'
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleCancel(o.reward_order_id)}
                          className='flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md font-medium hover:bg-gray-50 transition-colors text-sm'
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                <div className='flex justify-center mt-4'>
                  <Pagination
                    showSizeChanger={false}
                    current={page}
                    defaultPageSize={10}
                    onChange={(newPage) => {
                      handleSearch({page: newPage, search: null})
                    }}
                    total={totalOrders}
                  />
                </div>
              </>
            ) : (
              renderEmptyState()
            )}
          </div>
        ) : (
          <div className='overflow-x-auto'>
            <table className='w-full border-collapse'>
              <thead>
                <tr className='bg-gray-50'>
                  <th className='text-left p-3 border-b-2 border-gray-200 font-semibold text-gray-600 uppercase text-sm'>
                    <RenderTableHeader
                      {...{
                        className: 'w-full font-medium text-xs',
                        header: (
                          <div className='flex justify-between items-center w-full'>
                            <p>Patient</p>
                          </div>
                        ),
                      }}
                    />
                  </th>
                  <th className='text-left p-3 border-b-2 border-gray-200 font-semibold text-gray-600 uppercase text-sm'>
                    <RenderTableHeader
                      {...{
                        className: 'w-full font-medium text-xs',
                        header: (
                          <div className='flex items-center w-full'>
                            <p>ORDER ID</p>
                          </div>
                        ),
                      }}
                    />
                  </th>
                  <th className='text-left p-3 border-b-2 border-gray-200 font-semibold text-gray-600 uppercase text-sm'>
                    <RenderTableHeader
                      {...{
                        className: 'w-full font-medium text-xs',
                        header: (
                          <div className='flex items-center w-full'>
                            <p>PRODUCT NAME</p>
                          </div>
                        ),
                      }}
                    />
                  </th>
                  <th className='text-center p-3 border-b-2 border-gray-200 font-semibold text-gray-600 uppercase text-sm'>
                    <RenderTableHeader
                      {...{
                        className: 'w-full font-medium text-xs',
                        header: (
                          <div className='flex justify-center w-full'>
                            <p>COIN VALUE</p>
                          </div>
                        ),
                      }}
                    />
                  </th>
                  <th className='text-center p-3 border-b-2 border-gray-200 font-semibold text-gray-600 uppercase text-sm'>
                    <RenderTableHeader
                      {...{
                        className: 'w-full font-medium text-xs',
                        header: (
                          <div className='flex justify-center w-full'>
                            <p>ORDERED AT</p>
                          </div>
                        ),
                      }}
                    />
                  </th>
                  <th className='text-center p-3 border-b-2 border-gray-200 font-semibold text-gray-600 uppercase text-sm'>
                    <RenderTableHeader
                      {...{
                        className: 'w-full font-medium text-xs',
                        header: (
                          <div className='flex justify-center w-full'>
                            <p>STATUS</p>
                          </div>
                        ),
                      }}
                    />
                  </th>
                  <th className='text-center p-3 border-b-2 border-gray-200 font-semibold text-gray-600 uppercase text-sm'>
                    <RenderTableHeader
                      {...{
                        className: 'w-full font-medium text-xs',
                        header: (
                          <div className='flex justify-center w-full'>
                            <p>ACTION</p>
                          </div>
                        ),
                      }}
                    />
                  </th>
                </tr>
              </thead>
              <tbody>
                {rewardOrders.length > 0 ? (
                  rewardOrders.map((o) => (
                    <tr
                      key={o.reward_order_id}
                      className='hover:bg-gray-50 border-b border-gray-100'
                    >
                      <td className='p-3'>
                        <RenderCell>
                          <div className='flex gap-2 items-center min-w-0'>
                            {hasValue(o.profile_picture_id || o.profile_picture_url) ? (
                              <Image
                                className='w-11 h-11 object-cover rounded-full'
                                src={
                                  o.profile_picture_id
                                    ? getImageUrlById(o.profile_picture_id)
                                    : o.profile_picture_url
                                }
                                showLoading={false}
                              />
                            ) : (
                              <DefaultImage letter={o.patient_name?.charAt(0) || ''} />
                            )}
                            <div className='min-w-0'>
                              <div className='text-sm font-medium text-black truncate'>
                                {o.patient_name}
                              </div>
                              <When isTrue={hasValue(o.patient_customer_mapped_id)}>
                                <div className='text-sm font-normal text-textColor uppercase truncate'>
                                  ID: {o.patient_customer_mapped_id}
                                </div>
                              </When>
                            </div>
                          </div>
                        </RenderCell>
                      </td>
                      <td className='p-3'>
                        <RenderCell>
                          <div className='text-sm font-medium text-black'>{o.order_number}</div>
                        </RenderCell>
                      </td>
                      <td className='p-3'>
                        <RenderCell>
                          <div className='text-sm text-textColor'>{o.product_name}</div>
                        </RenderCell>
                      </td>
                      <td className='p-3 text-center'>
                        <RenderCell>
                          <div className='text-sm font-medium'>{o.coin_value}</div>
                        </RenderCell>
                      </td>
                      <td className='p-3 text-center'>
                        <RenderCell>
                          <div className='text-sm text-textColor'>
                            {moment(o.order_date).format('MMM DD,YYYY')}
                          </div>
                        </RenderCell>
                      </td>
                      <td className='p-3 text-center'>
                        {o.status === 'PENDING' && (
                          <span className='inline-block px-3 py-1 text-xs rounded-full bg-orangeSupport text-orange'>
                            Pending
                          </span>
                        )}
                        {o.status === 'APPROVED' && (
                          <span className='inline-block px-3 py-1 text-xs rounded-full bg-tertiarySupport text-tertiaryColor'>
                            Approved
                          </span>
                        )}
                        {(o.status === 'CANCELLED' || o.status === 'REJECTED') && (
                          <span className='inline-block px-3 py-1 text-xs rounded-full bg-redSupport text-red'>
                            Cancelled
                          </span>
                        )}
                      </td>
                      <td className='p-3 text-center'>
                        {o.status === 'PENDING' ? (
                          <div className='flex gap-2 justify-center'>
                            <button
                              onClick={() => handleApprove(o.reward_order_id)}
                              className='px-4 py-1.5 bg-primaryColor text-white rounded-md font-medium hover:bg-primaryColor/90 transition-colors text-sm'
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleCancel(o.reward_order_id)}
                              className='px-4 py-1.5 border border-gray-300 text-gray-700 rounded-md font-medium hover:bg-gray-50 transition-colors text-sm'
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <span className='text-sm text-textColor'>—</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7}>{renderEmptyState()}</td>
                  </tr>
                )}
              </tbody>
            </table>
            {rewardOrders.length > 0 && (
              <div className='flex justify-between mt-4 mb-2 md:px-2.5 px-1 items-center'>
                <p className='text-textColor text-sm font-medium'>
                  {Math.min((page - 1) * 10 + 1, totalOrders)}-{Math.min(page * 10, totalOrders)}{' '}
                  from {totalOrders}
                </p>
                <Pagination
                  showSizeChanger={false}
                  current={page}
                  defaultPageSize={10}
                  onChange={(newPage) => {
                    handleSearch({page: newPage, search: null})
                  }}
                  total={totalOrders}
                />
              </div>
            )}
          </div>
        )}
      </Spin>
    </div>
  )
}

export default RewardsOrdersTable
