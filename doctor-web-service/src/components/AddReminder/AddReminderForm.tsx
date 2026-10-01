import {Form, FormikProps} from 'formik'
import {AddReminderFormValues} from './addReminder.types'
import FormikInput from 'components/atom/Inputs/FormikInput'
import FieldContainerForRadioGroups from 'screens/Patients/LeadsProfile/main/caseInformation/components/FieldContainerForRadioGroups'
import reminderTypeOptions from '@staticData/reminderTypeOptions'
import FormikDatePicker from 'components/atom/Inputs/FormikDatePicker'
import FormikTimePicker from 'components/atom/Inputs/FormikTimePicker'
import InputTextArea from 'components/atom/Inputs/InputTextArea'
import When from 'components/when/When'
import FormikSelectList from 'components/atom/Dropdown/FormikSelectList'
import dayjs from 'dayjs'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import {useContext, useEffect} from 'react'
import {AuthContext} from 'context/AuthContext'
import useDispatchAction from '@hooks/useDispatchAction'
import {getPatientsList} from 'redux/Slices/AppSlice/Calendar/calendar.slice'
import FormikInputNumber from 'components/atom/Inputs/FormikInputNumber'
import reminderTypeConstants from '@constants/reminderType.constants'
import PatientDetails from 'components/patientDetails/PatientDetails'

const AddReminderForm = ({
  formik,
  isOnPaymentsPage,
  isOnAppointmentsPage,
  initialReminderCategory,
  isEdit,
  isOnProductionPage,
  isOnBillingsAndPaymentsPage,
  patientData,
  allowPaymentReminder = true,
}: {
  formik: FormikProps<AddReminderFormValues>
  isOnPaymentsPage?: boolean
  isOnAppointmentsPage?: boolean
  initialReminderCategory?: keyof typeof reminderTypeConstants
  isEdit?: boolean
  isOnProductionPage?: boolean
  isOnBillingsAndPaymentsPage?: boolean
  patientData?: {
    profileUrl?: string | null
    patientName?: string | null
  }
  allowPaymentReminder?: boolean
}) => {
  const {patientsList, loadingPatientsList} = useSelector((state: RootState) => state.calendar)
  const {userId}: any = useContext(AuthContext)
  const {dispatchAction} = useDispatchAction()

  useEffect(() => {
    dispatchAction(getPatientsList({doctor_id: userId}))
  }, [])
  const onOptionChange = (key: string, value: string, toggle: boolean = false) => {
    formik.setFieldValue('amount', '')
    formik.setFieldValue('patient_id', null)
    if (!toggle && value === formik.getFieldProps(key).value) {
      return
    }
    formik.setFieldValue(key, value === formik.getFieldProps(key).value ? null : value)
  }
  // const now = dayjs()
  // const disabledTime = (current: dayjs.Dayjs) => {
  //   if (!current) {
  //     return {}
  //   }

  //   const currentHour = now.hour()
  //   const currentMinute = now.minute()
  //   const currentSecond = now.second()

  //   return {
  //     disabledHours: () =>
  //       Array.from({length: 24}, (_, i) => i).filter((hour) => hour < currentHour),
  //     disabledMinutes: () =>
  //       Array.from({length: 60}, (_, i) => i).filter((minute) => minute < currentMinute),
  //     disabledSeconds: () =>
  //       Array.from({length: 60}, (_, i) => i).filter((second) => second < currentSecond),
  //   }
  // }
  return (
    <div>
      <div className='w-full border border-lightGray mb-5'></div>
      <Form className='flex flex-col gap-3 px-5'>
        <When isTrue={isOnBillingsAndPaymentsPage}>
          {patientData?.patientName && (
            <PatientDetails
              {...{
                patient: {
                  patient_name: patientData?.patientName,
                  profile_url: patientData?.profileUrl,
                },
              }}
            />
          )}
        </When>
        <FormikInput name={'title'} label={'Add title'} required className='py-3' maxLength={50} />
        <div className='w-full border border-lightGray'></div>
        <When isTrue={!isOnPaymentsPage && !isOnAppointmentsPage && !isOnProductionPage}>
          <FieldContainerForRadioGroups
            selectedOption={formik.getFieldProps('reminder_category').value}
            onOptionChange={onOptionChange}
            options={reminderTypeOptions.filter((option) => {
              if (option.value === 'PAYMENT_REMINDER' && !allowPaymentReminder) {
                // Only keep visible if editing an existing payment reminder
                return isEdit && initialReminderCategory === 'PAYMENT_REMINDER'
              }
              if (
                option.value === 'TREATMENT_START_REMINDER' ||
                option.value === 'UNPROCESSED_ALIGNER_REMINDER'
              ) {
                return false
              }
              return true
            })}
            toggle={false}
            name='reminder_category'
            disabled={isEdit}
            label=''
            showSideLabel={false}
            className='overflow-x-auto'
            radioGroupClassName=' rounded-md'
          />
        </When>
        <div className='flex gap-2'>
          <FormikDatePicker
            {...{
              name: 'date',
              label: 'Remind me on',
              className: ' py-3',
              required: true,
              minDate: dayjs(),
              format: 'DD-MM-YYYY',
            }}
          />
          <FormikTimePicker
            {...{
              name: 'time',
              // disabledTime,
              label: 'Remind me at',
              className: ' py-3',
              required: true,
            }}
          />
        </div>
        <When isTrue={!isOnPaymentsPage && !isOnAppointmentsPage && !isOnProductionPage}>
          <FormikSelectList
            {...{
              name: 'patient_id',
              showSearch: true,
              disabled:
                loadingPatientsList ||
                (isEdit ? initialReminderCategory !== 'GENERAL_REMINDER' : false),
              loading: loadingPatientsList,
              items: patientsList.filter((item) => {
                if (formik.values.reminder_category === 'PRODUCTION_REMINDER') {
                  return item.is_tracking_added
                }
                if (formik.values.reminder_category === 'PAYMENT_REMINDER') {
                  return item.treatment_cost_added
                }
                return true
              }),
              notFoundContent: 'No patient found',
              required: formik.values.reminder_category !== 'GENERAL_REMINDER',
              label: `${
                formik.values.reminder_category === 'GENERAL_REMINDER'
                  ? 'Select patient (optional)'
                  : 'Select patient'
              }`,
            }}
          />
        </When>

        <When isTrue={formik.values.reminder_category === 'PAYMENT_REMINDER'}>
          <FormikInputNumber
            name={'amount'}
            className='py-2'
            label={'Amount'}
            required
            prefix={
              <div className=' text-grayDisabled font-medium text-base'>
                <p className='pr-3 border-r border-r-mediumGray mr-2'>₹</p>
              </div>
            }
          />
        </When>
        <InputTextArea
          {...{
            classNameLabel: 'text-base font-medium text-textColor ',
            rows: 2,
            className: 'border border-mediumGray rounded-lg p-2 card-wrapper ',
            name: 'notes',
            label: 'Notes (optional)',
            formik,
            maxLength: 200,
          }}
        />
      </Form>
      <div className='w-full border border-lightGray mt-2'></div>
    </div>
  )
}

export default AddReminderForm
