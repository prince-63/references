import AntdButton from 'components/atom/Buttons/AntdButton'
import InputDateFormik from 'components/atom/Inputs/InputDateFormik'
import CommonSVG from 'components/atom/SVG/CommonSVG'
import ModalLayout from 'components/modal/ModalLayout'
import {useFormik, useFormikContext} from 'formik'
import {useContext, useEffect, useState} from 'react'
import {SVG_CROSS} from 'utils/SvgConstants'
import {AuthContext} from 'context/AuthContext'
import useDispatchAction from '@hooks/useDispatchAction'
import {RootState} from 'redux/store'
import {useSelector} from 'react-redux'
import * as Yup from 'yup'
import {useParams} from 'react-router-dom'
import InputText from 'components/atom/Inputs/InputText'
import {
  getPaymentDetail,
  postAddPayment,
  postUpdatePayment,
  setIsDeletePaymentModalVisible,
  setIsPaymentModalVisible,
  setSelectedPaymentId,
} from 'redux/Slices/AppSlice/Payments/Payments.slice'
import {safeParseInt} from 'utils/ConstFunctions'
import SuccessToast from 'components/modal/Alert/SuccessToast'
import {PaymentDetail, PostPaymentDetail, listType} from '../types/payments.types'
import RupeeIcon from 'assets/icons/RupeeIcon'
import TimerIcon from 'assets/icons/TimerIcon'
import {capitalizeFirstLetter} from '../../appointments/utils/DateConversion'
import hasValue from 'utils/hasValue'
import moment from 'moment'
import When from 'components/when/When'
import dayjs from 'dayjs'
import PatientDetails from 'components/patientDetails/PatientDetails'
import {FilterDrawerFormikContextType} from 'screens/billingsAndPayments/billingsAndPayments.types'
const validationSchema = Yup.object().shape({
  name: Yup.string().min(2, 'Minimum 2 characters required').required('Please enter payment name'),
  amount: Yup.string()
    .min(3, 'Minimum 3 digits required')
    .required('Please enter a payment amount'),
  date: Yup.string().required('Please enter a payment date'),
})

const PaymentModal = ({
  isOnBillingsAndPaymentsPage,
  patientPaymentReceivedData,
}: {
  isOnBillingsAndPaymentsPage?: boolean
  patientPaymentReceivedData?: {
    patientId: number
    patientName?: string
    profileUrl?: string | null
  }
}) => {
  const {dispatchAction} = useDispatchAction()
  const {patientId: patientIdFromParams} = useParams()
  const patientId = !isOnBillingsAndPaymentsPage
    ? patientIdFromParams
    : patientPaymentReceivedData?.patientId
  const {userId}: any = useContext(AuthContext)
  const billingPageFormik = useFormikContext<FilterDrawerFormikContextType>()

  useEffect(() => {
    if (isOnBillingsAndPaymentsPage) {
      dispatchAction(
        getPaymentDetail({
          doctor_id: safeParseInt(userId),
          patient_id: safeParseInt(patientId),
        })
      )
    }
  }, [])

  const {paymentDetail, postAddPaymentLoading, selectedPaymentId, postUpdatePaymentLoading} =
    useSelector((state: RootState) => state.payments)

  const paymentHeaderList: listType[] = [
    {
      icon: <RupeeIcon height='24' width='24' />,
      title: 'TREATMENT_COST',
      value: String(paymentDetail.cost),
    },
    {
      icon: <TimerIcon height='24' width='24' />,
      title: 'BALANCE_PAYMENT',
      value: String(paymentDetail.balance_payment),
    },
  ]

  const [errorMsg, setErrorMsg] = useState('')

  const getAllPaymentsLength = (data: any) => {
    let totalEntries = 0
    if (hasValue(data.payments)) {
      const paymentKeys = Object.keys(data.payments)
      paymentKeys.forEach((key) => {
        totalEntries += data.payments[key].length
      })
      return totalEntries + 1
    } else {
      return 1
    }
  }

  const getPaymentDetailsByPaymentId = (paymentId: number, data: {payments: any}) => {
    for (const month in data.payments) {
      const monthPayments = data.payments[month]
      const payment = monthPayments.find(
        (payment: PaymentDetail) => payment.payment_id === paymentId
      )
      if (payment) {
        return {
          doctor_id: safeParseInt(userId),
          patient_id: safeParseInt(patientId),
          name: payment.name,
          amount: payment.amount,
          date: payment.date,
        }
      }
    }
    return {
      doctor_id: safeParseInt(userId),
      patient_id: safeParseInt(patientId),
      name: 'Payment ' + String(getAllPaymentsLength(paymentDetail)),
      amount: '',
      date: '',
    }
  }

  const getInitialValues = () => {
    if (hasValue(selectedPaymentId)) {
      return getPaymentDetailsByPaymentId(selectedPaymentId, paymentDetail)
    } else {
      return {
        doctor_id: safeParseInt(userId),
        patient_id: safeParseInt(patientId),
        name: 'Payment ' + String(getAllPaymentsLength(paymentDetail)),
        amount: '',
        date: '',
      }
    }
  }

  const formik = useFormik<PostPaymentDetail>({
    initialValues: getInitialValues(),
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      await dispatchAction(
        selectedPaymentId == 0
          ? postAddPayment({
              doctor_id: safeParseInt(userId),
              patient_id: safeParseInt(patientId),
              name: values.name,
              amount: values.amount,
              date: moment(values.date).format('YYYY-MM-DD'),
            })
          : postUpdatePayment({
              payment_id: safeParseInt(selectedPaymentId),
              doctor_id: safeParseInt(userId),
              patient_id: safeParseInt(patientId),
              name: values.name,
              amount: values.amount,
              date: moment(values.date).format('YYYY-MM-DD'),
            })
      )
        .unwrap()
        .then((res: any) => {
          if (res) {
            if (isOnBillingsAndPaymentsPage) {
              billingPageFormik.handleSubmit()
            }
            dispatchAction(setSelectedPaymentId(0))
            dispatchAction(setIsPaymentModalVisible(false))
            if (hasValue(selectedPaymentId)) {
              SuccessToast('Payment updated successfully.')
            } else {
              SuccessToast('Payment added successfully.')
            }
          }
        })
        .catch((error: any) => {
          if (hasValue(error?.error_code)) {
            setErrorMsg('The amount should not exceed your treatment cost')
          }
        })
    },
  })
  useEffect(() => {
    if (isOnBillingsAndPaymentsPage) {
      formik.resetForm({values: getInitialValues()})
    }
  }, [isOnBillingsAndPaymentsPage, paymentDetail])

  return (
    <ModalLayout className='md:w-[35%] py-8 px-8' isResponsive>
      <div className='flex justify-between items-center'>
        <div className='text-[24px] font-semibold mr-10'>Payment details</div>
        <div
          className='cursor-pointer'
          onClick={() => dispatchAction(setIsPaymentModalVisible(false))}
        >
          <CommonSVG svg={SVG_CROSS} width='32' height='32' />
        </div>
      </div>
      <When isTrue={isOnBillingsAndPaymentsPage}>
        {patientPaymentReceivedData?.patientName && (
          <div className='mt-2'>
            <PatientDetails
              {...{
                patient: {
                  patient_name: patientPaymentReceivedData?.patientName,
                  profile_url: patientPaymentReceivedData?.profileUrl,
                },
              }}
            />
          </div>
        )}
      </When>
      <div className='flex md:flex-row flex-col justify-between gap-3 mt-4'>
        {paymentHeaderList.map((element: listType, index) => (
          <div key={index} className='flex-1 bg-white border-mediumGray'>
            <div className='h-auto p-4 rounded-lg border flex flex-row justify-start items-center gap-3'>
              <div className='w-6 h-6 relative'>{element.icon}</div>
              <div className='flex-col'>
                <div className='self-stretch h-12 flex-col justify-start items-start gap-0.5 flex'>
                  <div className="text-textColor text-sm font-medium font-['Figtree'] leading-tight tracking-tight">
                    {capitalizeFirstLetter(element.title)}
                  </div>
                  <div className="text-black text-xl font-semibold font-['Figtree'] leading-7">{`${
                    element.value ? `₹ ${Number(element.value).toLocaleString('en-IN')}` : '--'
                  }`}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className='mt-4'>
        <InputText
          required
          formik={formik}
          name='name'
          label='Payment name'
          placeholder='Payment #1'
          classNameLabel='font-medium'
          className=''
          maxLength={50}
          onChange={(value) => {
            formik.handleChange(value)
          }}
        />
      </div>

      <div className='mt-4'>
        <InputText
          required
          formik={formik}
          name='amount'
          prefix={`₹`}
          classNamePrefix={'w-12'}
          label='Amount paid'
          placeholder='0'
          classNameLabel='font-medium'
          className=''
          maxLength={7}
          onChange={(e) => {
            setErrorMsg('')
            const {value} = e.target
            const numericValue = value.replace(/[^0-9]/g, '')
            formik.setFieldValue('amount', numericValue)
          }}
          disablePrefix={true}
        />
        {errorMsg && <div className='text-red text-xs'>{errorMsg}</div>}
      </div>

      <div className='mt-4'>
        <InputDateFormik
          {...{
            name: 'date',
            label: 'Payment date',
            className: ' py-3',
            classNameLabel: 'font-medium',
            required: true,
            maxDate: dayjs(),
            onChange: (date: dayjs.Dayjs, dateString: string | string[]) => {
              formik.setFieldValue('date', dateString)
            },
          }}
          formik={formik}
          dateValue={formik?.values?.date}
        />
      </div>

      <div className='flex mt-7 gap-4'>
        <When isTrue={selectedPaymentId > 0}>
          <button
            className='w-full h-12 rounded-lg p-3 cursor-pointer bg-redSupport border border-red text-red'
            onClick={() => dispatchAction(setIsDeletePaymentModalVisible(true))}
          >
            Delete payment
          </button>
          <AntdButton
            text={'Confirm changes'}
            className='h-12 !bg-primaryColor w-full hover:!bg-primaryColor text-[16px] font-semibold'
            loading={postUpdatePaymentLoading}
            onClick={() => formik.handleSubmit()}
          />
        </When>
        <When isTrue={selectedPaymentId == 0}>
          <AntdButton
            text={'Save'}
            className='h-12 !bg-primaryColor w-full hover:!bg-primaryColor text-[16px] font-semibold'
            loading={postAddPaymentLoading}
            onClick={() => formik.handleSubmit()}
          />
        </When>
      </div>
    </ModalLayout>
  )
}

export default PaymentModal
