import './UpcomingAppointments.css'
import {Divider, Popover, Progress} from 'antd'
import ExpandIcon from 'assets/icons/ExpandIcon'
import {useContext, useEffect, useState} from 'react'
import {Formik} from 'formik'
import getInitialValues from 'screens/billingsAndPayments/helpers/getInitialValues'
import useDispatchAction from '@hooks/useDispatchAction'
import {safeParseInt} from 'utils/ConstFunctions'
import {getPracticeLocationsList} from 'redux/Slices/AppSlice/Calendar/calendar.slice'
import {useSelector} from 'react-redux'
import {AuthContext} from 'context/AuthContext'
import {FilterDrawerFormikContextType} from 'screens/billingsAndPayments/billingsAndPayments.types'
import {RootState} from 'redux/store'
import ColorIcon from 'components/colorIcon/ColorIcon'
import TreatmentCostFiltersPopoverContent from './TreatmentCostFiltersPopoverContent'
import {useMediaQuery} from 'react-responsive'
import cn from '@utils/cn'
import formatAmount from 'screens/Calendar/helpers/formatAmount'
import hasValue from 'utils/hasValue'
import When from 'components/when/When'
import {getBillingsAndPaymentsList} from 'redux/Slices/AppSlice/billingsAndPayments/billingsAndPayments.slice'
import dayjs from 'dayjs'
import {getApiDataProductionList} from 'redux/Slices/AppSlice/SetupTreatment/productionListSlice'
import getColorPalette from 'utils/getColorPalette'
import BorderedCardForDashBoardCards from 'screens/Dashboard/components/BorderedCard'
import ChartDonut from 'assets/icons/ChartDonut'
import {useNavigate} from 'react-router-dom'

const AggregatedTreatmentProgress = () => {
  const [openPopover, setOpenPopover] = useState(false)

  const handleSubmit = async ({values}: {values: FilterDrawerFormikContextType}) => {
    await handleOnSearch({
      page: 1,
      payload: {
        ...values,
      },
    })
    setOpenPopover(false)
  }
  const {userId} = useContext(AuthContext)
  const {billingAndPaymentsData} = useSelector((state: RootState) => state.billingsAndPayments)
  const treatmentCost =
    billingAndPaymentsData?.total_outstanding_by_filter === 0
      ? undefined
      : billingAndPaymentsData?.total_outstanding_by_filter
  const balanceReceived = billingAndPaymentsData?.balance_received_by_filter ?? 0
  const percentage =
    treatmentCost && treatmentCost !== 0 ? Math.round((balanceReceived / treatmentCost) * 100) : 0

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
    await dispatchAction(
      getBillingsAndPaymentsList({
        doctor_id: safeParseInt(userId),
        page_number: page - 1,
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
  useEffect(() => {
    const payload = {
      doctorId: safeParseInt(userId),
    }
    const fetchBrandList = dispatchAction(getApiDataProductionList({payload})).unwrap()
    const fetchPracticeLocations = dispatchAction(
      getPracticeLocationsList({doctor_id: safeParseInt(userId), include_unassigned: true})
    ).unwrap()

    Promise.all([fetchBrandList, fetchPracticeLocations])
      .then((res) => {
        const initialValues = {
          ...getInitialValues(),
          checked_practice_location_list: res[1] ?? [],
        }

        handleOnSearch({payload: initialValues, updateLoadingState: true})
      })
      .catch((error) => {
        console.error('Error fetching data:', error)
      })
  }, [])
  const formattedBalanceReceived = formatAmount(balanceReceived)
  const formattedTreatmentCost = formatAmount(treatmentCost)
  const isMobile = useMediaQuery({query: '(max-width: 768px)'})
  const navigate = useNavigate()
  return (
    <BorderedCardForDashBoardCards className='flex-grow-0 cursor-pointer'>
      <div
        onClick={() => {
          navigate('/billings')
        }}
      >
        <div className='flex justify-between w-full items-center'>
          <p className='font-semibold'>Billing & payments</p>
          <Formik
            initialValues={getInitialValues()}
            onSubmit={(values, formikHelper) => {
              handleSubmit({values}).then(() => {
                formikHelper.resetForm({values})
              })
            }}
          >
            <Popover
              trigger={['click']}
              open={openPopover}
              style={{fontFamily: 'figtree'}}
              onOpenChange={(value) => {
                setOpenPopover(value)
              }}
              overlayInnerStyle={{
                minWidth: '360px',
              }}
              placement={isMobile ? 'top' : 'right'}
              content={<TreatmentCostFiltersPopoverContent />}
            >
              <button
                type='button'
                className={cn(
                  ' text-textColor text-sm font-medium flex gap-2 items-center border border-mediumGray p-1.5 px-2 rounded-md',
                  openPopover
                    ? 'bg-primarySupport text-primaryColor border border-primaryColor'
                    : 'text-textColor'
                )}
                onClick={() => {
                  setOpenPopover(!openPopover)
                }}
              >
                Filters
                <ExpandIcon
                  {...{
                    isActive: !openPopover,
                    color: !openPopover ? undefined : getColorPalette().primaryColor,
                  }}
                />
              </button>
            </Popover>
          </Formik>
        </div>
        <When isTrue={hasValue(treatmentCost)}>
          <div className='w-full flex flex-col gap-2 mt-2'>
            <div className='flex flex-col gap-2'>
              <div className='flex text-black items-baseline gap-2'>
                <p className='text-2xl font-semibold'>₹ {formattedBalanceReceived ?? 0}</p>
                <p className='text-sm font-medium text-textColor'>Received till date</p>
              </div>
              <Progress
                percent={percentage}
                strokeColor={getColorPalette().primaryColor}
                strokeWidth={20}
                showInfo={false}
                // size={[300, 20]}
                className='w-full'
              />
            </div>
            <div className='flex flex-col md:flex-row md:items-center  gap-2 md:gap-4 font-medium'>
              <div className='flex gap-2 items-center'>
                <ColorIcon color={getColorPalette().primaryColor} />
                <p className='text-textColor'>Received till date</p>
                <p>₹ {formattedBalanceReceived ?? 0}</p>
              </div>
              <Divider type='vertical' className='hidden md:block mx-0' />
              <div className='flex gap-2 items-center'>
                <ColorIcon color='#D9D9D9' />
                <p className='text-textColor'>Total treatment cost</p>
                <p>₹ {formattedTreatmentCost ?? 0}</p>
              </div>
            </div>
          </div>
        </When>
        <When isTrue={!hasValue(treatmentCost)}>
          <div className='flex flex-col gap-3 text-textColor text-base justify-center items-center h-full mb-2'>
            <div className='p-3 rounded-full w-fit h-fit bg-lighterGray'>
              <ChartDonut />
            </div>
            <p>No results found</p>
          </div>
        </When>
      </div>
    </BorderedCardForDashBoardCards>
  )
}

export default AggregatedTreatmentProgress
