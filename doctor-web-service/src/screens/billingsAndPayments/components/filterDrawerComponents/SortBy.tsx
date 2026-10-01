import sortByConstants from '@constants/sortBy.constants'
import cn from '@utils/cn'
import {useFormikContext} from 'formik'
import React, {useState, useEffect} from 'react'
import {FilterDrawerFormikContextType} from 'screens/billingsAndPayments/billingsAndPayments.types'

const alphabeticalOptions = [
  {
    label: 'Alphabetically',
    value: 'ALPHABETICALLY',
  },
  {
    label: 'Reverse Alphabetically',
    value: 'REVERSE_ALPHABETICALLY',
  },
]

const dateOptions = [
  {
    label: 'Newest to oldest',
    value: 'NEWEST_TO_OLDEST',
  },
  {
    label: 'Oldest to newest',
    value: 'OLDEST_TO_NEWEST',
  },
]

const numericOptions = [
  {
    label: 'Ascending',
    value: 'ASCENDING',
  },
  {
    label: 'Descending',
    value: 'DESCENDING',
  },
]

const SortBy = () => {
  const formik = useFormikContext<FilterDrawerFormikContextType>()
  const {sort_by} = formik.values
  const [selectedOption, setSelectedOption] = useState<string | null>(null)

  useEffect(() => {
    if (sort_by) setSelectedOption(sort_by.sort)
  }, [sort_by])
  const handleChange = (value: string, type: string) => {
    formik.setFieldValue('sort_by', {
      type,
      sort: value,
    })
    setSelectedOption(value)
  }

  return (
    <div className='flex flex-col gap-3'>
      <div className='flex flex-col '>
        <p className='uppercase text-textColor font-semibold text-xs'>by patient name</p>
        {alphabeticalOptions.map((option, index) => (
          <div key={index} className={cn('flex items-center gap-3 py-2 rounded-[4px]')}>
            <input
              type='radio'
              id={`patientName-${option.value}`}
              name='sortByOption'
              className='form-radio h-5 w-5 accent-primaryColor cursor-pointer'
              value={option.value}
              checked={
                selectedOption === option.value && sort_by.type === sortByConstants.PATIENT_NAME
              }
              onChange={() => handleChange(option.value, sortByConstants.PATIENT_NAME)}
            />
            <label
              htmlFor={`patientName-${option.value}`}
              className=' text-sm font-medium cursor-pointer w-full '
            >
              {option.label}
            </label>
          </div>
        ))}
      </div>
      <div className='flex flex-col '>
        <p className='uppercase text-textColor font-semibold text-xs'>by patient created on</p>
        {dateOptions.map((option, index) => (
          <div key={index} className={cn('flex items-center gap-3 py-2 rounded-[4px]')}>
            <input
              type='radio'
              id={`patientCreatedOn-${option.value}`}
              name='sortByOption'
              className='form-radio h-5 w-5 accent-primaryColor cursor-pointer'
              value={option.value}
              checked={
                selectedOption === option.value &&
                sort_by.type === sortByConstants.PATIENT_CREATED_ON
              }
              onChange={() => handleChange(option.value, sortByConstants.PATIENT_CREATED_ON)}
            />
            <label
              htmlFor={`patientCreatedOn-${option.value}`}
              className=' text-sm font-medium cursor-pointer w-full '
            >
              {option.label}
            </label>
          </div>
        ))}
      </div>
      <div className='flex flex-col '>
        <p className='uppercase text-textColor font-semibold text-xs'>by balance payment</p>
        {numericOptions.map((option, index) => (
          <div key={index} className={cn('flex items-center gap-3 py-2 rounded-[4px]')}>
            <input
              type='radio'
              id={`balancePayment-${option.value}`}
              name='sortByOption'
              className='form-radio h-5 w-5 accent-primaryColor cursor-pointer'
              value={option.value}
              checked={
                selectedOption === option.value && sort_by.type === sortByConstants.BALANCE_PAYMENT
              }
              onChange={() => handleChange(option.value, sortByConstants.BALANCE_PAYMENT)}
            />
            <label
              htmlFor={`balancePayment-${option.value}`}
              className=' text-sm font-medium cursor-pointer w-full '
            >
              {option.label}
            </label>
          </div>
        ))}
      </div>
      <div className='flex flex-col '>
        <p className='uppercase text-textColor font-semibold text-xs'>by last payment received</p>
        {dateOptions.map((option, index) => (
          <div key={index} className={cn('flex items-center gap-3 py-2 rounded-[4px]')}>
            <input
              type='radio'
              id={`lastPaymentReceived-${option.value}`}
              name='sortByOption'
              className='form-radio h-5 w-5 accent-primaryColor cursor-pointer'
              value={option.value}
              checked={
                selectedOption === option.value &&
                sort_by.type === sortByConstants.LAST_PAYMENT_RECEIVED
              }
              onChange={() => handleChange(option.value, sortByConstants.LAST_PAYMENT_RECEIVED)}
            />
            <label
              htmlFor={`lastPaymentReceived-${option.value}`}
              className=' text-sm font-medium cursor-pointer w-full '
            >
              {option.label}
            </label>
          </div>
        ))}
      </div>
    </div>
  )
}

export default SortBy
