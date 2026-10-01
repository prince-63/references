import React, {FC} from 'react'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import {Pagination, Spin} from 'antd'
import Spinner from 'components/spinner/Spinner'
import {getImageUrlById} from 'utils/ConstFunctions'
import RenderTableHeader from 'screens/Patients/LeadsProfile/main/files/components/RenderTableHeader'
import RenderCell from 'screens/Patients/LeadsProfile/main/files/components/RenderCell'
import {Image} from 'assets/images/Images/Image'
import {DefaultImage} from 'assets/images/Images/DefaultImage'
import hasValue from 'utils/hasValue'
import {useMediaQuery} from 'react-responsive'
import CommonEmptyState from 'components/emptyState/CommonEmptyState'
import {IMAGE_EMPTY_STATE} from 'utils/ImageConst'
import {useNavigate} from 'react-router-dom'
import When from 'components/when/When'

interface PatientsRewardsTableProps {
  search: string | null
  page: number
  handleOnSearch: ({page, search}: {page: number; search: string | null}) => void
}

const PatientsRewardsTable: FC<PatientsRewardsTableProps> = ({search, page, handleOnSearch}) => {
  const isMobile = useMediaQuery({query: '(max-width: 768px)'})
  const navigate = useNavigate()
  const {patientWallets, walletPagination, loading} = useSelector(
    (state: RootState) => state.rewards
  )

  const totalPatients = walletPagination?.total_patients || 0

  const renderEmptyState = () => (
    <div className='flex justify-center items-center py-10 w-full'>
      {hasValue(search) ? (
        <div className='text-center py-4 text-textColor'>
          No matching patients found. Please try refining your search criteria
        </div>
      ) : (
        <CommonEmptyState
          image={IMAGE_EMPTY_STATE}
          boxStyle='text-center'
          title='No patient added'
          titleStyle='text-[20px] font-semibold md:mt-7 text-black'
          subTitle='There are no patients to display at the moment'
          subTitleStyle='w-[363px] text-[16px] font-normal md:mt-4 mx-auto'
          buttonText=''
          buttonStyle='mt-[13px] border border-primaryColor text-primaryColor font-semibold px-[85px] md:px-[20px] py-[10px] rounded-[8px] text-[16px]'
          onClick={() => navigate('/add-patient')}
        />
      )}
    </div>
  )

  if (isMobile) {
    return (
      <Spin indicator={<Spinner loading />} spinning={loading}>
        <div className='flex flex-col gap-3'>
          {patientWallets.length > 0 ? (
            <>
              {patientWallets.map((row) => (
                <div
                  key={row.patient_id}
                  className='border border-mediumGray rounded-lg p-4 w-full mb-4'
                >
                  <div className='pb-4 border-b border-mediumGray flex items-center justify-between gap-4 w-full'>
                    <div className='flex gap-3 items-center w-full'>
                      {hasValue(row.profile_picture_id || row.profile_picture_url) ? (
                        <Image
                          className='w-11 h-11 object-cover rounded-full'
                          src={
                            row.profile_picture_id
                              ? getImageUrlById(row.profile_picture_id)
                              : row.profile_picture_url
                          }
                          showLoading={false}
                        />
                      ) : (
                        <DefaultImage
                          letter={(row.patient_name || row.first_name || '')?.charAt(0) || ''}
                        />
                      )}
                      <div className='flex flex-col gap-1 w-full overflow-hidden'>
                        <div className='w-full'>
                          <span className='font-semibold truncate max-w-[70%]'>
                            {row.patient_name || `${row.first_name || ''} ${row.last_name || ''}`}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className='mt-4 flex flex-col gap-2'>
                    <div className='flex items-center gap-2'>
                      <div className='flex-1'>
                        <div className='text-xs text-textColor'>Coins Earned</div>
                        <div className='text-lg font-semibold'>{row.coins_earned}</div>
                      </div>
                      <div className='flex-1'>
                        <div className='text-xs text-textColor'>Coins Used</div>
                        <div className='text-lg font-semibold'>{row.coins_used}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <div className='flex justify-center mt-4'>
                <Pagination
                  showSizeChanger={false}
                  current={page}
                  defaultPageSize={10}
                  onChange={(newPage) => {
                    handleOnSearch({page: newPage, search: null})
                  }}
                  total={totalPatients}
                />
              </div>
            </>
          ) : (
            renderEmptyState()
          )}
        </div>
      </Spin>
    )
  }

  return (
    <Spin indicator={<Spinner loading />} spinning={loading}>
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
              <th className='text-center p-3 border-b-2 border-gray-200 font-semibold text-gray-600 uppercase text-sm'>
                <RenderTableHeader
                  {...{
                    className: 'w-full font-medium text-xs',
                    header: (
                      <div className='flex justify-center items-center w-full'>
                        <p>COINS EARNED</p>
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
                      <div className='flex justify-center items-center w-full'>
                        <p>COINS USED</p>
                      </div>
                    ),
                  }}
                />
              </th>
            </tr>
          </thead>
          <tbody>
            {patientWallets.length > 0 ? (
              patientWallets.map((row) => (
                <tr key={row.patient_id} className='hover:bg-gray-50 border-b border-gray-100'>
                  <td className='p-3'>
                    <RenderCell>
                      <div className='flex gap-2 items-center min-w-0'>
                        {hasValue(row.profile_picture_id || row.profile_picture_url) ? (
                          <Image
                            className='w-11 h-11 object-cover rounded-full'
                            src={
                              row.profile_picture_id
                                ? getImageUrlById(row.profile_picture_id)
                                : row.profile_picture_url
                            }
                            showLoading={false}
                          />
                        ) : (
                          <DefaultImage
                            letter={(row.patient_name || row.first_name || '')?.charAt(0) || ''}
                          />
                        )}
                        <div className='min-w-0'>
                          <div className='text-sm font-medium text-black truncate'>
                            {row.patient_name || `${row.first_name || ''} ${row.last_name || ''}`}
                          </div>
                          <When isTrue={hasValue(row.customer_mapped_id)}>
                            <div className='text-sm font-normal text-textColor uppercase truncate'>
                              ID: {row.customer_mapped_id}
                            </div>
                          </When>
                        </div>
                      </div>
                    </RenderCell>
                  </td>
                  <td className='p-3 text-center'>
                    <div className='h-11 flex text-textColor justify-center items-center text-sm'>
                      <div className='text-lg font-semibold'>{row.coins_earned}</div>
                    </div>
                  </td>
                  <td className='p-3 text-center'>
                    <div className='h-11 flex text-textColor justify-center items-center text-sm'>
                      <div className='text-lg font-semibold'>{row.coins_used}</div>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3}>{renderEmptyState()}</td>
              </tr>
            )}
          </tbody>
        </table>
        {patientWallets.length > 0 && (
          <div className='flex justify-between mt-4 mb-2 md:px-2.5 px-1 items-center'>
            <p className='text-textColor text-sm font-medium'>
              {Math.min((page - 1) * 10 + 1, totalPatients)}-{Math.min(page * 10, totalPatients)}{' '}
              from {totalPatients}
            </p>
            <Pagination
              showSizeChanger={false}
              current={page}
              defaultPageSize={10}
              onChange={(newPage) => {
                handleOnSearch({page: newPage, search: null})
              }}
              total={totalPatients}
            />
          </div>
        )}
      </div>
    </Spin>
  )
}

export default PatientsRewardsTable
