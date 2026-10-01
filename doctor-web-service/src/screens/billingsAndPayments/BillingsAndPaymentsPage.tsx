import {useContext, useState} from 'react'
import Card from './components/Card'
import {Formik} from 'formik'
import FormikInputSearch from 'components/atom/Inputs/FormikInputSearch'
import {AuthContext} from 'context/AuthContext'
import cn from '@utils/cn'
import FilterIcon from 'assets/icons/FilterIcon'
import FilterDrawer from './components/FilterDrawer'
import useDispatchAction from '@hooks/useDispatchAction'
import {formatToTwoDecimalPlaces, safeParseInt} from 'utils/ConstFunctions'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import getInitialValues from './helpers/getInitialValues'
import TableContainerForPayments from './components/TableContainerForPayments'
import {Pagination} from 'antd'
import {BillingAndPaymentsProvider} from './BillingAndPaymentsContext'
import formatAmount from 'screens/Calendar/helpers/formatAmount'
import DropdownIcon from 'assets/icons/DropdownIcon'
import hasValue from 'utils/hasValue'
import {getBillingsAndPaymentsList} from 'redux/Slices/AppSlice/billingsAndPayments/billingsAndPayments.slice'
import {FilterDrawerFormikContextType} from './billingsAndPayments.types'
import dayjs from 'dayjs'
import HeaderTitle from 'components/header/HeaderTitle'

const BillingsAndPaymentsPage = () => {
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false)
  const toggleDrawer = (open: boolean) => {
    setIsFilterDrawerOpen(open)
  }
  const [pageNumber, setCurrentPageNumber] = useState(1)
  const {userId} = useContext(AuthContext)
  const {billingAndPaymentsData} = useSelector((state: RootState) => state.billingsAndPayments)
  const [showLoading, setShowLoading] = useState(false)

  const totalPatients = billingAndPaymentsData?.total_patients ?? 0
  const formattedTotalOutstandingAmount = formatAmount(billingAndPaymentsData?.total_remaining_cost)
  const formattedDueThisMonthAmount = formatAmount(billingAndPaymentsData?.due_this_month)
  const formattedReceivedThisMonthAmount = formatAmount(billingAndPaymentsData?.received_this_month)
  const receivedThisMonthPercentage = formatToTwoDecimalPlaces(
    billingAndPaymentsData?.compare_to_last_month
  )

  const handleSubmit = async ({
    values,
    loading,
  }: {
    values: FilterDrawerFormikContextType
    loading?: boolean
  }) => {
    await handleOnSearch({
      page: pageNumber,
      updateLoadingState: loading ?? showLoading,
      payload: {
        ...values,
      },
    })
    setShowLoading(false)
    toggleDrawer(false)
  }
  const handleOnSearch = async ({
    page = 1,
    payload,
    updateLoadingState = false,
  }: {
    page?: number
    payload: FilterDrawerFormikContextType
    updateLoadingState?: boolean
  }) => {
    if (!userId) throw new Error('User ID not found')
    setCurrentPageNumber(page)
    await dispatchAction(
      getBillingsAndPaymentsList({
        doctor_id: safeParseInt(userId),
        page_number: hasValue(payload.patient_search) ? 0 : page - 1,
        updateLoadingState,
        ...payload,
        patient_search: hasValue(payload.patient_search) ? payload?.patient_search?.trim() : null,
        filter_by_payment_date: {
          from_date: hasValue(payload?.filter_by_payment_date?.from_date)
            ? dayjs(payload?.filter_by_payment_date?.from_date).format('YYYY-MM-DD')
            : null,
          to_date: hasValue(payload?.filter_by_payment_date?.to_date)
            ? dayjs(payload?.filter_by_payment_date?.to_date).format('YYYY-MM-DD')
            : null,
        },
      })
    )
  }

  const {dispatchAction} = useDispatchAction()
  const getTrendBackgroundColor = () => {
    if (receivedThisMonthPercentage) {
      if (receivedThisMonthPercentage > 0) {
        return 'bg-tertiarySupport'
      } else if (receivedThisMonthPercentage < 0) {
        return 'bg-redSupport'
      }
    }
    return 'bg-lightGray'
  }
  const getTrendIconColor = () => {
    if (receivedThisMonthPercentage) {
      if (receivedThisMonthPercentage > 0) {
        return '#00B383'
      } else if (receivedThisMonthPercentage < 0) {
        return '#F45045'
      }
    }
    return '#B0B0B0'
  }
  const getTextColor = () => {
    if (receivedThisMonthPercentage) {
      if (receivedThisMonthPercentage > 0) {
        return 'text-black'
      } else if (receivedThisMonthPercentage < 0) {
        return 'text-black'
      }
    }
    return 'text-textColor'
  }

  return (
    <div className='flex flex-col gap-3 md:pb-0 pb-[70px]'>
      <HeaderTitle
        {...{
          title: 'Billing & payments',
          subTitle: 'Manage payments, treatment costs, and set reminders for due payments',
        }}
      />
      <div className='flex gap-3 overflow-x-auto'>
        <Card title='Total balance payment'>
          <div> ₹ {formattedTotalOutstandingAmount ?? 0} </div>
        </Card>
        <Card title='Due this month'>
          <div> ₹ {formattedDueThisMonthAmount ?? 0} </div>
        </Card>
        <Card title='Received this month'>
          <div className='flex gap-3 items-center '>
            <p>₹ {formattedReceivedThisMonthAmount ?? 0}</p>
            <div
              className={cn(
                'flex px-3 py-2 rounded-3xl items-center gap-2',
                getTrendBackgroundColor()
              )}
            >
              <DropdownIcon
                color={getTrendIconColor()}
                className={cn(
                  receivedThisMonthPercentage !== null && receivedThisMonthPercentage >= 0
                    ? 'rotate-180'
                    : ''
                )}
              />
              <p className={cn('text-sm', getTextColor())}>
                {receivedThisMonthPercentage ? `${receivedThisMonthPercentage} %` : '--'}
              </p>
            </div>
          </div>
        </Card>
      </div>
      <Formik
        initialValues={getInitialValues()}
        onSubmit={(values, formikHelper) => {
          handleSubmit({values}).then(() => {
            formikHelper.resetForm({values})
          })
        }}
      >
        {({handleChange, handleBlur, values, resetForm}) => {
          return (
            <>
              <div className='flex flex-col gap-3'>
                <div className='flex gap-3'>
                  <div className='md:w-1/3 w-full'>
                    <FormikInputSearch
                      name='patient_search'
                      placeholder='Search'
                      onSearch={(value) => {
                        handleSubmit({
                          values: {...values, patient_search: value},
                          loading: true,
                        }).then(() => {
                          resetForm({
                            values: {
                              ...values,
                              patient_search: value,
                            },
                          })
                        })
                      }}
                      maxLength={30}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      allowClear
                      className={cn(' w-full')}
                      size='large'
                    />
                  </div>
                  <button
                    className='rounded-lg  flex justify-center items-center border border-mediumGray px-2'
                    type='button'
                    onClick={() => {
                      toggleDrawer(true)
                    }}
                  >
                    <FilterIcon />
                  </button>
                </div>

                <FilterDrawer
                  {...{
                    isFilterDrawerOpen,
                    toggleDrawer,
                    setShowLoading,
                  }}
                />
                <BillingAndPaymentsProvider pageNumber={pageNumber} handleOnSearch={handleOnSearch}>
                  <TableContainerForPayments />
                </BillingAndPaymentsProvider>
              </div>

              <div className='flex justify-between mt-2 mb-2 md:px-2.5 px-1 items-center'>
                <p className='text-textColor text-sm font-medium'>
                  {Math.min((pageNumber - 1) * 10 + 1, totalPatients)}-
                  {Math.min(pageNumber * 10, totalPatients)} from {totalPatients}
                </p>
                <div className='md:hidden block'>
                  <Pagination
                    showSizeChanger={false}
                    defaultCurrent={pageNumber}
                    defaultPageSize={10}
                    showLessItems
                    onChange={(page) => {
                      handleOnSearch({
                        page,
                        payload: {
                          ...values,
                        },
                        updateLoadingState: true,
                      })
                    }}
                    total={totalPatients}
                  />
                </div>
                <div className='hidden md:block'>
                  <Pagination
                    showSizeChanger={false}
                    defaultCurrent={pageNumber}
                    defaultPageSize={10}
                    onChange={(page) => {
                      handleOnSearch({
                        page,
                        payload: {
                          ...values,
                        },
                        updateLoadingState: true,
                      })
                    }}
                    total={totalPatients}
                  />
                </div>
              </div>
            </>
          )
        }}
      </Formik>
    </div>
  )
}

export default BillingsAndPaymentsPage
