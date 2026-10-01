import React from 'react'
import {RowDataForBillingsAndPayments} from '../billingsAndPayments.types'
import {Image} from 'assets/images/Images/Image'
import hasValue from 'utils/hasValue'
import {getFirstLetterCapitalOfWord} from 'utils/ConstFunctions'
import formatAmount from 'screens/Calendar/helpers/formatAmount'
import AddNewButton from 'components/atom/Buttons/AddNewButton'
import useDispatchAction from '@hooks/useDispatchAction'
import {setIsTreatmentCostModalVisible} from 'redux/Slices/AppSlice/Payments/Payments.slice'
import {useBillingAndPaymentsContext} from '../BillingAndPaymentsContext'
import EditButton from 'components/atom/Buttons/EditButton'

const PatientPaymentItemHeader = ({patient}: {patient: RowDataForBillingsAndPayments}) => {
  const formattedTreatmentCost = formatAmount(patient.treatment_cost)
  const formattedBalancePayment = formatAmount(patient.balance_payment)
  const {setSelectedRow, setIsShowPhotos} = useBillingAndPaymentsContext()
  const {dispatchAction} = useDispatchAction()
  return (
    <div>
      {patient && (
        <div className='flex flex-col gap-2 font-medium text-base'>
          <div className='flex gap-2 cursor-default items-center'>
            {hasValue(patient.profile_url) ? (
              <Image
                className='w-8 h-8 rounded-full  object-cover cursor-pointer bg-transparent'
                src={patient.profile_url ?? ''}
                alt='patient photo'
                showLoading={true}
                onClick={(e: React.MouseEvent<HTMLImageElement>) => {
                  e.stopPropagation()
                  setSelectedRow(patient)
                  setIsShowPhotos(true)
                }}
              />
            ) : (
              <div className='bg-mediumGray text-textColor text-base font-medium rounded-full flex justify-center items-center min-w-8 min-h-8'>
                <span>
                  {hasValue(patient?.patient_name)
                    ? patient?.patient_name.split(' ')[0].charAt(0)
                    : ''}
                </span>
                <span>
                  {hasValue(patient?.patient_name)
                    ? getFirstLetterCapitalOfWord(
                        patient?.patient_name.split(' ').slice(-1)[0].charAt(0)
                      )
                    : ''}
                </span>
              </div>
            )}
            <div className='flex flex-col'>
              <p className='text-black text-base font-semibold'>{patient.patient_name}</p>
              <p className='text-textColor font-medium text-sm'>
                {patient.practice_location_name ?? ''}
              </p>
            </div>
          </div>
          <div className='w-full border border-mediumGray'></div>
          <div className='flex justify-between'>
            <div className='flex flex-col'>
              <p className='text-textColor'>Treatment cost</p>
              <div className='flex gap-2 items-center'>
                <div className='text-sm font-medium text-black'>
                  {hasValue(formattedTreatmentCost) ? (
                    `₹ ${formattedTreatmentCost}`
                  ) : (
                    <AddNewButton
                      text='Add new'
                      onClick={() => {
                        setSelectedRow(patient)
                        dispatchAction(setIsTreatmentCostModalVisible(true))
                      }}
                    />
                  )}
                </div>
                <EditButton
                  onClick={() => {
                    setSelectedRow(patient)
                    dispatchAction(setIsTreatmentCostModalVisible(true))
                  }}
                  show={hasValue(patient.treatment_cost) && patient?.treatment_cost !== 0}
                  className='block border-none'
                />
              </div>
            </div>
            <div className='flex flex-col'>
              <p className='text-textColor'>Balance payment</p>
              <div className='flex gap-2 items-center'>
                <div className='text-sm font-medium text-black'>
                  {hasValue(formattedBalancePayment) ? `₹ ${formattedBalancePayment}` : '--'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PatientPaymentItemHeader
