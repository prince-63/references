import AntdButton from 'components/atom/Buttons/AntdButton'
import InputDateFormik from 'components/atom/Inputs/InputDateFormik'
import CommonSVG from 'components/atom/SVG/CommonSVG'
import ModalLayout from 'components/modal/ModalLayout'
import {useFormik} from 'formik'
import {useContext, useState} from 'react'
import {SVG_CROSS} from 'utils/SvgConstants'
import {AuthContext} from 'context/AuthContext'
import useDispatchAction from '@hooks/useDispatchAction'
import {RootState} from 'redux/store'
import {useSelector} from 'react-redux'
import * as Yup from 'yup'
import {useParams} from 'react-router-dom'
import InputText from 'components/atom/Inputs/InputText'
import {
  postAddPaymentReminder,
  postUpdatePaymentReminder,
  setIsDeletePaymentReminderModalVisible,
  // setIsPaymentReminderModalVisible,
} from 'redux/Slices/AppSlice/Payments/Payments.slice'
import {safeParseInt} from 'utils/ConstFunctions'
import SuccessToast from 'components/modal/Alert/SuccessToast'
import {PaymentRemindersDetail, PostPaymentReminderDetail} from '../types/payments.types'
import moment from 'moment'
import When from 'components/when/When'
import InputTimeFormik from 'components/atom/Inputs/InputTimeFormik'
import hasValue from 'utils/hasValue'
import dayjs from 'dayjs'
const validationSchema = Yup.object().shape({
  amount: Yup.string()
    .min(3, 'Minimum 3 digits required')
    .required('Please enter a payment amount'),
})

const PaymentReminderModal = () => {
  const {dispatchAction} = useDispatchAction()
  const {patientId} = useParams()
  const {userId}: any = useContext(AuthContext)
  const nextDate = moment(new Date()).add('day', 1).format('YYYY-MM-DD')

  const {
    paymentDetail,
    postAddPaymentReminderLoading,
    selectedPaymentReminderId,
    postUpdatePaymentReminderLoading,
  } = useSelector((state: RootState) => state.payments)

  const [errorMsgAmount, setErrorMsgAmount] = useState('')
  const [errorMsgDateAndTime, setErrorMsgDateAndTime] = useState('')

  const getPaymentReminderDetails = (paymentReminderId: number, data: PaymentRemindersDetail[]) => {
    const reminder = data.find((element) => element.reminder_id === paymentReminderId)
    if (reminder) {
      return {
        doctor_id: safeParseInt(userId),
        patient_id: safeParseInt(patientId),
        amount: String(reminder.amount),
        date: moment(reminder.date).format('YYYY-MM-DD'),
        timezone: reminder.timezone,
        time: reminder.time,
        note: reminder.note,
      }
    }

    return {
      doctor_id: safeParseInt(userId),
      patient_id: safeParseInt(patientId),
      date: nextDate,
      time: '10:00:00',
      timezone: 'Asia/Kolkata',
      note: '',
      amount: '',
    }
  }

  const getInitialValues = () => {
    if (selectedPaymentReminderId != 0) {
      return getPaymentReminderDetails(selectedPaymentReminderId, paymentDetail?.reminders)
    } else {
      return {
        doctor_id: safeParseInt(userId),
        patient_id: safeParseInt(patientId),
        date: nextDate,
        time: '10:00:00',
        timezone: 'Asia/Kolkata',
        note: '',
        amount: String(
          hasValue(paymentDetail.balance_payment) ? paymentDetail.balance_payment : ''
        ),
      }
    }
  }

  const hasDateAndTime = (
    reminders: PaymentRemindersDetail[],
    date: string,
    time: string,
    excludeReminderId: number | null = null
  ) => {
    return reminders.some(
      (reminder: PaymentRemindersDetail) =>
        reminder.date === date &&
        reminder.time === time &&
        reminder.reminder_id !== excludeReminderId
    )
  }

  const formik = useFormik<PostPaymentReminderDetail>({
    initialValues: getInitialValues(),
    validationSchema: validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      if (Number(values.amount) > paymentDetail.balance_payment) {
        setErrorMsgAmount('Payment amount cannot be greater than total cost.')
      } else if (
        hasValue(paymentDetail.reminders) &&
        hasDateAndTime(
          paymentDetail.reminders,
          moment(values.date).format('YYYY-MM-DD'),
          moment(values.time, 'h:mm A').format('HH:mm:ss'),
          selectedPaymentReminderId !== 0 ? selectedPaymentReminderId : null
        )
      ) {
        setErrorMsgDateAndTime(
          'Payment reminder date & time already exists. Please change date and time.'
        )
      } else {
        const reminderDetails: PostPaymentReminderDetail = {
          reminder_id: selectedPaymentReminderId === 0 ? 0 : selectedPaymentReminderId,
          doctor_id: Number(userId),
          patient_id: Number(patientId),
          date: moment(values.date).format('YYYY-MM-DD'),
          time: values.time,
          timezone: 'Asia/Kolkata',
          note: values.note,
          amount: values.amount,
        }

        await dispatchAction(
          selectedPaymentReminderId === 0
            ? postAddPaymentReminder(reminderDetails)
            : postUpdatePaymentReminder(reminderDetails)
        )
          .unwrap()
          .then((res: any) => {
            if (res) {
              // dispatchAction(setIsPaymentReminderModalVisible(false))
              if (selectedPaymentReminderId === 0) {
                SuccessToast('Payment reminder added successfully.')
              } else {
                SuccessToast('Payment reminder updated successfully.')
              }
            }
          })
          .catch((error: any) => {
            console.error('Error:', error)
          })
      }
    },
  })

  return (
    <ModalLayout className='md:w-[35%] py-8 px-8' isResponsive>
      <div className='flex justify-between items-center'>
        <div className='text-[24px] font-semibold mr-10'>Reminder details</div>
        <div
          className='cursor-pointer'
          // onClick={() => dispatchAction(setIsPaymentReminderModalVisible(false))}
        >
          <CommonSVG svg={SVG_CROSS} width='32' height='32' />
        </div>
      </div>

      <div className='mt-4'>
        <InputDateFormik
          {...{
            name: 'date',
            label: 'Remind me on',
            className: ' py-3',
            classNameLabel: 'font-medium',
            required: true,
            minDate: dayjs(nextDate),
            onChange: (date: dayjs.Dayjs, dateString: string | string[]) => {
              setErrorMsgDateAndTime('')
              formik.setFieldValue('date', dateString)
            },
          }}
          formik={formik}
          dateValue={formik?.values?.date}
        />
      </div>

      <div className='mt-4'>
        <InputTimeFormik
          required
          formik={formik}
          name='time'
          label='Remind me at'
          classNameLabel='font-medium'
          className=''
          onChange={(e) => {
            setErrorMsgDateAndTime('')
            formik.setFieldValue('time', e.target.value)
          }}
        />
      </div>
      {errorMsgDateAndTime && <div className='text-red text-xs'>{errorMsgDateAndTime}</div>}

      <div className='mt-4'>
        <InputText
          required
          formik={formik}
          prefix='₹'
          classNamePrefix={'w-12'}
          name='amount'
          label='Amount'
          placeholder='0'
          classNameLabel='font-medium'
          className=''
          maxLength={7}
          onChange={(e) => {
            setErrorMsgAmount('')
            const {value} = e.target
            const numericValue = value.replace(/[^0-9]/g, '')
            formik.setFieldValue('amount', numericValue)
          }}
          disablePrefix={true}
        />
        {errorMsgAmount && <div className='text-red text-xs'>{errorMsgAmount}</div>}
      </div>

      <div className='mt-4'>
        <InputText
          required={false}
          formik={formik}
          name='note'
          label='Notes (optional)'
          placeholder='Tab to add note'
          classNameLabel='font-medium'
          className=''
          maxLength={50}
          onChange={(value) => {
            formik.handleChange(value)
          }}
        />
      </div>

      <div className='flex mt-7 gap-4'>
        <When isTrue={selectedPaymentReminderId > 0}>
          <button
            className='w-full h-12 rounded-lg p-3 cursor-pointer bg-redSupport border border-red text-red'
            onClick={() => dispatchAction(setIsDeletePaymentReminderModalVisible(true))}
          >
            Delete reminder
          </button>
          <AntdButton
            text={'Update reminder'}
            className='h-12 !bg-primaryColor w-full hover:!bg-primaryColor text-[16px] font-semibold'
            loading={postUpdatePaymentReminderLoading}
            onClick={() => formik.handleSubmit()}
          />
        </When>
        <When isTrue={selectedPaymentReminderId === 0}>
          <AntdButton
            text={'Add reminder'}
            className='h-12 !bg-primaryColor w-full hover:!bg-primaryColor text-[16px] font-semibold'
            loading={postAddPaymentReminderLoading}
            onClick={() => formik.handleSubmit()}
          />
        </When>
      </div>
    </ModalLayout>
  )
}

export default PaymentReminderModal
