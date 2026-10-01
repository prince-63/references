import InputDateFormik from 'components/atom/Inputs/InputDateFormik'
import InputNumber from 'components/atom/Inputs/InputNumber'
import Instructions from 'components/instruction/Instructions'
import {FormikProps} from 'formik'
import moment from 'moment'
import {useEffect} from 'react'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import hasValue from 'utils/hasValue'
import {TrackingFormValues} from '../Tracking/AddingTracking'
import dayjs from 'dayjs'
interface Props {
  formik: FormikProps<TrackingFormValues>
}

export const TrackingAdditionalDetailsForm = (props: Props) => {
  const {formik} = props

  useEffect(() => {
    const {startDate} = formik.values
    if (hasValue(startDate)) {
      formik.setFieldValue(
        'endDate',
        moment(startDate).add(treatmentPlan.days_to_wear_each_aligner, 'days').format('YYYY-MM-DD')
      )
    }
  }, [formik.values.startDate])
  const {treatmentPlan} = useSelector((state: RootState) => state.leadsProfileTreatmentPlanReducer)

  return (
    <div className='w-full'>
      <Instructions info='For new treatment patients, set the aligner number to 1 and add the start and end dates. You can update the start date later if it’s still in the future.' />
      <div className='w-full flex flex-col  md:flex-row gap-3 mt-6'>
        <div className='md:w-1/3 w-full'>
          <InputNumber
            formik={formik}
            name='currentAlignerNumber'
            className='!w-full !bg-white'
            classNameLabel='font-semibold'
            label='Current aligner number'
            isDisabled={formik.values.askForPatientToFill}
          />
        </div>
        <div className='md:w-1/3 w-full'>
          <InputDateFormik
            {...{
              name: 'startDate',
              label: 'Aligner start date',
              className: '!w-full !bg-white py-3',
              required: false,
              classNameLabel: 'font-semibold',
              value: formik.values.startDate ? dayjs(formik.values.startDate) : null,
              disabled: formik.values.askForPatientToFill,
              minDate: dayjs().subtract(treatmentPlan?.days_to_wear_each_aligner, 'days'),
              onChange: (date: dayjs.Dayjs, dateString: string | string[]) => {
                formik?.setFieldValue('startDate', dateString)
              },
            }}
            dateValue={formik?.values?.startDate}
            formik={formik}
          />
        </div>
        <div className='md:w-1/3 w-full'>
          <InputDateFormik
            {...{
              name: 'endDate',
              label: 'Aligner end date',
              classNameLabel: 'font-semibold',
              className: '!w-full !bg-white py-3',
              minDate: dayjs().add(1, 'day'),
              required: true,
              value: formik.values.endDate ? dayjs(formik.values.endDate) : null,
              disabled: !hasValue(formik.values.startDate) || formik.values.askForPatientToFill,
              onChange: (date: dayjs.Dayjs, dateString: string | string[]) => {
                formik?.setFieldValue('endDate', dateString)
              },
            }}
            dateValue={formik?.values?.endDate}
            formik={formik}
          />
        </div>
      </div>
    </div>
  )
}
