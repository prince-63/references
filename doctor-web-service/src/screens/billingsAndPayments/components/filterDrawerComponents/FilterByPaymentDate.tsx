import FormikDatePicker from 'components/atom/Inputs/FormikDatePicker'
import {useFormikContext} from 'formik'
import {FilterDrawerFormikContextType} from 'screens/billingsAndPayments/billingsAndPayments.types'
import dayjs from 'dayjs'
import {useEffect} from 'react'

const FilterByPaymentDate = () => {
  const formik = useFormikContext<FilterDrawerFormikContextType>()
  useEffect(() => {
    if (
      dayjs(formik.values.filter_by_payment_date.from_date).isAfter(
        dayjs(formik.values.filter_by_payment_date.to_date)
      )
    ) {
      formik.setFieldValue(
        'filter_by_payment_date.to_date',
        formik.values.filter_by_payment_date.from_date
      )
    }
  }, [formik.values.filter_by_payment_date.from_date, formik.values.filter_by_payment_date.to_date])
  return (
    <div className='mb-2'>
      <div className='flex gap-2 items-center'>
        <FormikDatePicker
          {...{
            name: 'filter_by_payment_date.from_date',
            label: 'From',
            className: ' py-3',
            format: 'DD-MM-YYYY',
            size: 'small',
          }}
        />
        <div className='mt-6 text-textColor'>-</div>
        <FormikDatePicker
          {...{
            name: 'filter_by_payment_date.to_date',
            label: 'To',
            className: ' py-3',
            format: 'DD-MM-YYYY',
            size: 'small',
            minDate: dayjs(formik.values.filter_by_payment_date.from_date),
          }}
        />
      </div>
    </div>
  )
}

export default FilterByPaymentDate
