import React, {FC} from 'react'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import {Pagination, Spin} from 'antd'
import Spinner from 'components/spinner/Spinner'
import RenderTableHeader from 'screens/Patients/LeadsProfile/main/files/components/RenderTableHeader'
import RenderCell from 'screens/Patients/LeadsProfile/main/files/components/RenderCell'
import {Image} from 'assets/images/Images/Image'
import {DefaultImage} from 'assets/images/Images/DefaultImage'
import hasValue from 'utils/hasValue'
import {useMediaQuery} from 'react-responsive'
import {getImageUrlById} from 'utils/ConstFunctions'
import useDispatchAction from '@hooks/useDispatchAction'
import {getPromotionClaims, verifyPromotionClaim} from 'redux/Slices/AppSlice/rewards/rewards.slice'
import SuccessToast from 'components/modal/Alert/SuccessToast'
import {getStorageType} from 'utils/storage'
import CommonEmptyState from 'components/emptyState/CommonEmptyState'
import {IMAGE_EMPTY_STATE} from 'utils/ImageConst'
import moment from 'moment'
import When from 'components/when/When'

interface PromotionOrdersTableProps {
  status: string
  page: number
  search: string
  setStatus: (status: string) => void
  setPage: (page: number) => void
  handleSearch: ({page, search}: {page: number; search: string | null}) => void
}

const PromotionOrdersTable: FC<PromotionOrdersTableProps> = ({
  status,
  page,
  search,
  setStatus,
  setPage,
  handleSearch,
}) => {
  const isMobile = useMediaQuery({query: '(max-width: 768px)'})
  const {dispatchAction} = useDispatchAction()
  const {promotionClaims, promotionClaimsPagination, loading} = useSelector(
    (state: RootState) => state.rewards
  )
  const doctorId = getStorageType().getItem('profileId')

  const totalOrders = promotionClaimsPagination?.total_records || 0

  const refreshOrders = () => {
    if (doctorId) {
      dispatchAction(
        getPromotionClaims({
          profile_id: Number(doctorId),
          status: status === 'ALL' ? null : status,
          search: search,
          page: page - 1,
          size: 10,
        })
      )
    }
  }

  const renderEmptyState = () => (
    <div className='flex justify-center items-center py-10 w-full'>
      <CommonEmptyState
        image={IMAGE_EMPTY_STATE}
        boxStyle='text-center'
        title='No orders found'
        titleStyle='text-[20px] font-semibold md:mt-7 text-black'
        subTitle='There are no promotion orders to display at the moment'
        subTitleStyle='w-[363px] text-[16px] font-normal md:mt-4 mx-auto'
      />
    </div>
  )

  const statusOptions = [
    {label: 'All', value: 'ALL'},
    {label: 'Pending', value: 'PENDING_VERIFICATION'},
    {label: 'Claimed', value: 'VERIFIED'},
    {label: 'Cancelled', value: 'REJECTED'},
  ]

  const handleVerify = async (id: number) => {
    if (doctorId) {
      const res: any = await dispatchAction(
        verifyPromotionClaim({
          user_profile_id: Number(doctorId),
          redemption_id: id,
          approved: true,
        })
      )
      if (!res.error) {
        SuccessToast('Promotion verified successfully!')
        refreshOrders()
      }
    }
  }

  const handleReject = async (id: number) => {
    if (doctorId) {
      const res: any = await dispatchAction(
        verifyPromotionClaim({
          user_profile_id: Number(doctorId),
          redemption_id: id,
          approved: false,
        })
      )
      if (!res.error) {
        SuccessToast('Promotion rejected successfully!')
        refreshOrders()
      }
    }
  }

  const filteredClaims = promotionClaims.filter(
    (c) => c.promotion_type === 'PATIENT_REFERRAL' || c.promotion_type === 'DISCOUNT_PERCENTAGE'
  )

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
            {filteredClaims.length > 0 ? (
              <>
                {filteredClaims.map((o) => (
                  <div
                    key={o.redemption_id}
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
                        <div className='text-sm text-textColor'>Value</div>
                        <div className='text-lg font-semibold'>{o.coins_received ?? o.value}</div>
                      </div>
                    </div>

                    <div className='mt-2 text-sm text-black font-medium'>
                      Promotion:{' '}
                      <span className='text-textColor font-normal'>{o.promotion_name}</span>
                    </div>

                    <When isTrue={hasValue(o.referred_patient_name)}>
                      <div className='mt-2 text-sm text-black font-medium'>
                        Referred Patient:{' '}
                        <span className='text-textColor font-normal'>
                          {o.referred_patient_name}
                        </span>
                        <div className='text-xs text-textColor font-normal mt-0.5'>
                          {o.referred_patient_email || o.referred_patient_phone}
                        </div>
                      </div>
                    </When>

                    <div className='mt-3 flex items-center justify-between'>
                      <div className='text-sm text-textColor'>
                        {moment(o.created_at).format('MMM DD,YYYY')}
                      </div>
                      <div className='flex items-center gap-2'>
                        {o.status === 'PENDING_VERIFICATION' && (
                          <span className='inline-block px-3 py-1 text-xs rounded-full bg-orangeSupport text-orange'>
                            Pending
                          </span>
                        )}
                        {(o.status === 'VERIFIED' || o.status === 'CLAIMED') && (
                          <span className='inline-block px-3 py-1 text-xs rounded-full bg-green-100 text-green-700'>
                            Claimed
                          </span>
                        )}
                        {(o.status === 'CANCELLED' ||
                          o.status === 'REJECTED' ||
                          o.status === 'CancelLed') && (
                          <span className='inline-block px-3 py-1 text-xs rounded-full bg-redSupport text-red'>
                            Cancelled
                          </span>
                        )}
                      </div>
                    </div>

                    {o.status === 'PENDING_VERIFICATION' && (
                      <div className='mt-3 flex gap-2'>
                        <button
                          onClick={() => handleVerify(o.redemption_id)}
                          className='flex-1 px-4 py-2 bg-primaryColor text-white rounded-md font-medium hover:bg-primaryColor/90 transition-colors text-sm'
                        >
                          Verify
                        </button>
                        <button
                          onClick={() => handleReject(o.redemption_id)}
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
                            <p>PROMOTION NAME</p>
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
                            <p>REFERRED PATIENT</p>
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
                            <p>VALUE</p>
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
                            <p>CLAIMED AT</p>
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
                {filteredClaims.length > 0 ? (
                  filteredClaims.map((o) => (
                    <tr key={o.redemption_id} className='hover:bg-gray-50 border-b border-gray-100'>
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
                          <div className='text-sm text-textColor'>{o.promotion_name}</div>
                        </RenderCell>
                      </td>
                      <td className='p-3'>
                        <RenderCell>
                          {o.referred_patient_name ? (
                            <div>
                              <div className='text-sm font-medium text-black truncate'>
                                {o.referred_patient_name}
                              </div>
                              <div className='text-sm text-textColor truncate'>
                                {o.referred_patient_email || o.referred_patient_phone}
                              </div>
                            </div>
                          ) : (
                            <span className='text-sm text-textColor'>—</span>
                          )}
                        </RenderCell>
                      </td>
                      <td className='p-3 text-center'>
                        <RenderCell>
                          <div className='text-sm font-medium'>{o.coins_received ?? o.value}</div>
                        </RenderCell>
                      </td>
                      <td className='p-3 text-center'>
                        <RenderCell>
                          <div className='text-sm text-textColor'>
                            {moment(o.created_at).format('MMM DD,YYYY')}
                          </div>
                        </RenderCell>
                      </td>
                      <td className='p-3 text-center'>
                        {o.status === 'PENDING_VERIFICATION' && (
                          <span className='inline-block px-3 py-1 text-xs rounded-full bg-orangeSupport text-orange'>
                            Pending
                          </span>
                        )}
                        {(o.status === 'VERIFIED' || o.status === 'CLAIMED') && (
                          <span className='inline-block px-3 py-1 text-xs rounded-full bg-green-100 text-green-700'>
                            Claimed
                          </span>
                        )}
                        {(o.status === 'CANCELLED' ||
                          o.status === 'REJECTED' ||
                          o.status === 'CancelLed') && (
                          <span className='inline-block px-3 py-1 text-xs rounded-full bg-redSupport text-red'>
                            Cancelled
                          </span>
                        )}
                      </td>
                      <td className='p-3 text-center'>
                        {o.status === 'PENDING_VERIFICATION' ? (
                          <div className='flex gap-2 justify-center'>
                            <button
                              onClick={() => handleVerify(o.redemption_id)}
                              className='px-4 py-1.5 bg-primaryColor text-white rounded-md font-medium hover:bg-primaryColor/90 transition-colors text-sm'
                            >
                              Verify
                            </button>
                            <button
                              onClick={() => handleReject(o.redemption_id)}
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
            {filteredClaims.length > 0 && (
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

export default PromotionOrdersTable
