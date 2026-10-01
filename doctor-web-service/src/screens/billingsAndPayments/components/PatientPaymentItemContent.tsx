import {useBillingAndPaymentsContext} from '../BillingAndPaymentsContext'
import {RowDataForBillingsAndPayments} from '../billingsAndPayments.types'
import When from 'components/when/When'
import hasValue from 'utils/hasValue'
import Tag from 'components/tags/Tag'
import dayjs from 'dayjs'
import formatAmount from 'screens/Calendar/helpers/formatAmount'
import EditButton from 'components/atom/Buttons/EditButton'
import {
  setIsPaymentModalVisible,
  setSelectedPaymentId,
} from 'redux/Slices/AppSlice/Payments/Payments.slice'
import useDispatchAction from '@hooks/useDispatchAction'
import AddNewButton from 'components/atom/Buttons/AddNewButton'
import {useNavigate} from 'react-router-dom'
import {capitalizeFirstLetter} from 'utils/ConstFunctions'

const PatientPaymentItemContent = ({patient}: {patient: RowDataForBillingsAndPayments}) => {
  const {
    toggleModal,

    setSelectedRow,
    setIsEditPaymentReminder,
  } = useBillingAndPaymentsContext()
  const formattedLastPaymentReceivedAmount = formatAmount(patient.last_payment_received?.amount)
  const formattedPaymentReminderAmount = formatAmount(patient.payment_reminder_details?.amount)
  const {dispatchAction} = useDispatchAction()
  const navigation = useNavigate()
  return (
    <div>
      {patient && (
        <div className='flex flex-col gap-3 text-sm'>
          <div className='flex justify-start gap-2 '>
            <When isTrue={hasValue(patient.treatments)}>
              {patient.treatments?.map((treatment, index) => (
                <Tag
                  key={index}
                  value={treatment === 'BRACES' ? capitalizeFirstLetter(treatment) : treatment}
                  className='bg-lightGray text-textColor text-xs font-semibold'
                />
              ))}
            </When>
            <When isTrue={!hasValue(patient.treatments)}>--</When>
          </div>
          <div className='text-textColor font-medium '>
            <p>Created on</p>
            <span className='text-black'>
              {dayjs(patient?.patient_created_on).format('DD MMM YYYY')}
            </span>
          </div>
          <div className='text-textColor font-medium '>
            <p>Last payment received</p>
            <div className='text-sm font-medium text-black flex items-center gap-2'>
              {hasValue(patient?.treatment_cost) ? (
                hasValue(formattedLastPaymentReceivedAmount) ? (
                  <div className='flex gap-2'>
                    ₹ {formattedLastPaymentReceivedAmount} •
                    <p className=' text-textColor'>
                      {dayjs(patient?.last_payment_received?.received_on).format('DD MMM YYYY')}
                    </p>
                  </div>
                ) : (
                  <AddNewButton
                    text='Add payment'
                    onClick={() => {
                      setSelectedRow(patient)
                      dispatchAction(setIsPaymentModalVisible(true))
                    }}
                  />
                )
              ) : (
                '--'
              )}
              <EditButton
                onClick={() => {
                  dispatchAction(setIsPaymentModalVisible(true))
                  setSelectedRow(patient)
                  dispatchAction(setSelectedPaymentId(patient?.last_payment_received?.payment_id))
                }}
                show={
                  hasValue(patient?.last_payment_received?.amount) &&
                  hasValue(patient?.treatment_cost)
                }
                className='block border-none'
              />
            </div>
          </div>
          <div className='text-textColor font-medium '>
            <p>Payment reminder</p>
            <div className='text-sm font-medium text-black flex items-center gap-2'>
              {hasValue(patient?.treatment_cost) ? (
                hasValue(formattedPaymentReminderAmount) ? (
                  <div className='flex gap-2'>
                    ₹ {formattedPaymentReminderAmount} •
                    <p className=' text-textColor'>
                      {dayjs(patient?.last_payment_received?.received_on).format('DD MMM YYYY')}
                    </p>
                  </div>
                ) : (
                  <AddNewButton
                    text='Add reminder'
                    onClick={() => {
                      setSelectedRow(patient)
                      toggleModal(true)
                    }}
                  />
                )
              ) : (
                '--'
              )}
              <EditButton
                onClick={() => {
                  setSelectedRow(patient)
                  setIsEditPaymentReminder(true)
                  toggleModal(true)
                }}
                show={
                  hasValue(patient?.payment_reminder_details?.amount) &&
                  hasValue(patient?.treatment_cost)
                }
                className='block border-none'
              />
            </div>
          </div>
          <button
            type='button'
            className={`  rounded-lg p-3 cursor-pointer bg-primarySupport border border-primaryColor text-primaryColor font-semibold`}
            onClick={() => {
              navigation(`/profile/${patient.patient_id}/payments`)
            }}
          >
            View profile
          </button>
        </div>
      )}
    </div>
  )
}

export default PatientPaymentItemContent
