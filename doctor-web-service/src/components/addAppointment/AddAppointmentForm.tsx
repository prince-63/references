import {Form, FormikProps} from 'formik'
import FormikDatePicker from 'components/atom/Inputs/FormikDatePicker'
import InputTextArea from 'components/atom/Inputs/InputTextArea'
import FormikSelectList from 'components/atom/Dropdown/FormikSelectList'
import {AddAppointmentFormValues} from './addAppointment.types'
import {useContext, useEffect} from 'react'
import dayjs, {Dayjs} from 'dayjs'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import {AuthContext} from 'context/AuthContext'
import useDispatchAction from '@hooks/useDispatchAction'
import {
  getPatientsList,
  getPracticeLocationsList,
} from 'redux/Slices/AppSlice/Calendar/calendar.slice'
import When from 'components/when/When'

const AddAppointmentForm = ({
  formik,
  isOnAppointmentsPage,
  isEdit,
}: {
  formik: FormikProps<AddAppointmentFormValues>
  isOnAppointmentsPage?: boolean
  isEdit?: boolean
}) => {
  const {practiceLocationsList, loadingPracticeLocationsList, loadingPatientsList, patientsList} =
    useSelector((state: RootState) => state.calendar)
  const {userId}: any = useContext(AuthContext)
  const {dispatchAction} = useDispatchAction()
  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([
          dispatchAction(getPracticeLocationsList({doctor_id: userId})),
          dispatchAction(getPatientsList({doctor_id: userId})),
        ])
      } catch (error) {
        throw error
      }
    }
    fetchData()
  }, [])

  const disableEndTime = (date: Dayjs) => {
    const startTime = dayjs(formik.values.start_date)
    if (!date || !startTime) return {}

    const isSameDay = date.isSame(startTime, 'day')

    const disabledHours = () => {
      const hours = []
      if (isSameDay) {
        for (let i = 0; i < 24; i++) {
          if (i < startTime.hour()) {
            hours.push(i)
          }
        }
      }
      return hours
    }

    const disabledMinutes = (hour: number) => {
      const minutes = []
      if (isSameDay && hour === startTime.hour()) {
        for (let i = 0; i <= startTime.minute(); i++) {
          minutes.push(i)
        }
      }
      return minutes
    }

    return {
      disabledHours,
      disabledMinutes,
    }
  }

  return (
    <div>
      <div className='w-full border border-lightGray mb-6'></div>
      <Form className='flex flex-col gap-3 px-5'>
        <When isTrue={!isOnAppointmentsPage}>
          <FormikSelectList
            {...{
              name: 'patient_id',
              showSearch: true,
              notFoundContent: 'No patient found',
              items: patientsList,
              loading: loadingPatientsList,
              required: true,
              label: 'Select patient',
              onChangeSuccess: (value) => {
                formik.setFieldValue('practice_location_id', value?.practice_location_id)
              },
            }}
          />
        </When>
        <FormikSelectList
          {...{
            name: 'practice_location_id',
            loading: loadingPracticeLocationsList,
            showSearch: true,
            notFoundContent: 'No practice location found',
            items: practiceLocationsList,
            required: true,
            label: 'Practice location',
          }}
        />
        <div className='flex flex-col md:flex-row gap-2'>
          <FormikDatePicker
            {...{
              name: 'start_date',
              label: 'Start date and time',
              className: ' py-3',
              required: true,
              showTime: true,
              format: 'DD-MM-YYYY h:mm A',
              needConfirm: false,
              onChangeCallback: (date) => {
                if (
                  (!isEdit && date) ||
                  (date &&
                    isEdit &&
                    formik.values.end_date &&
                    formik.values.start_date &&
                    dayjs(formik.values.end_date).isBefore(dayjs(formik.values.start_date)))
                ) {
                  const endTime = date.add(30, 'minutes')
                  formik.setFieldValue('end_date', endTime)
                }
              },
            }}
          />
          <FormikDatePicker
            {...{
              name: 'end_date',
              label: 'End date and time',
              className: ' py-3',
              required: true,
              showTime: true,
              format: 'DD-MM-YYYY h:mm A',
              minDate: dayjs(formik.values.start_date),
              needConfirm: false,
              disabledTime: disableEndTime,
            }}
          />
        </div>
        <InputTextArea
          {...{
            classNameLabel: 'text-base font-medium text-textColor ',
            rows: 2,
            className: 'border border-mediumGray rounded-lg p-2 card-wrapper ',
            name: 'notes',
            label: 'Notes for self (optional)',
            formik,
            maxLength: 200,
          }}
        />
      </Form>
      <div className='w-full border border-lightGray mt-2'></div>
    </div>
  )
}

export default AddAppointmentForm
