import useDispatchAction from '@hooks/useDispatchAction'
import {Modal} from 'antd'
import clsx from 'clsx'
import FormikDatePicker from 'components/atom/Inputs/FormikDatePicker'
import {AuthContext} from 'context/AuthContext'
import {Formik} from 'formik'
import moment from 'moment'
import {useContext} from 'react'
import {useSelector} from 'react-redux'
import {useParams} from 'react-router-dom'
import {RootState} from 'redux/store'
import {safeParseInt} from 'utils/ConstFunctions'
import * as Yup from 'yup'
import {addReminderEvent, updateReminderEvent} from 'redux/Slices/AppSlice/Calendar/calendar.slice'
import reminderTypeConstants from '@constants/reminderType.constants'
import {getLeadsProfileDetails} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileDetails.slice'
import dayjs from 'dayjs'

const schema = Yup.object().shape({
  reminder_date: Yup.string().required('Reminder date is required'),
})
const AddReminderForTreatment = ({
  openModal,
  setOpenModal,
}: {
  openModal: boolean
  setOpenModal: (x: boolean) => void
}) => {
  const {gettingStartedStepData} = useSelector((state: RootState) => state.GettingStartedOverview)
  const starting_soon = gettingStartedStepData?.starting_soon
  const {patientId} = useParams()
  const {userId} = useContext(AuthContext)
  const {dispatchAction} = useDispatchAction()
  return (
    <Formik
      initialValues={{
        reminder_date: starting_soon?.reminder_date
          ? moment(starting_soon?.reminder_date).format('YYYY-MM-DD')
          : '',
      }}
      validationSchema={schema}
      onSubmit={async (values) => {
        const reminderDetails = {
          reminder_category: reminderTypeConstants.TREATMENT_START_REMINDER,
          doctor_id: Number(userId),
          patient_id: Number(patientId),
          date: moment(values?.reminder_date).format('YYYY-MM-DD'),
          time: moment().format('HH:mm:ss'),
        }
        if (starting_soon?.reminder_date && starting_soon?.reminder_id) {
          const updatePayload = {...reminderDetails, reminder_id: starting_soon?.reminder_id}
          await dispatchAction(updateReminderEvent(updatePayload))
            .unwrap()
            .then(() => {
              dispatchAction(
                getLeadsProfileDetails({
                  patient_id: safeParseInt(patientId),
                  doctor_id: safeParseInt(userId),
                })
              )
              setOpenModal(false)
            })
        } else {
          await dispatchAction(addReminderEvent(reminderDetails))
            .unwrap()
            .then(() => {
              dispatchAction(
                getLeadsProfileDetails({
                  patient_id: safeParseInt(patientId),
                  doctor_id: safeParseInt(userId),
                })
              )
              setOpenModal(false)
            })
        }
      }}
    >
      {(formik) => {
        return (
          <Modal
            closable={true}
            destroyOnClose={true}
            open={openModal}
            onCancel={() => setOpenModal(false)}
            className={clsx('md:w-[566px] w-full')}
            maskClosable={false}
            width={566}
            footer={
              <div className={clsx('flex gap-2 px-5 pb-5')}>
                <button
                  className={clsx('w-full text-white bg-primaryColor py-3 px-6 rounded-lg')}
                  type='submit'
                  onClick={() => {
                    formik.handleSubmit()
                  }}
                >
                  Confirm
                </button>
              </div>
            }
          >
            <div className='flex flex-col gap-4 p-5'>
              <div>
                <div className={clsx('md:text-2xl text-xl font-semibold')}>
                  Treatment start date reminder
                </div>
                <div className={clsx(' text-base font-normal text-textColor')}>
                  Set a reminder for starting the treatment.{' '}
                </div>
              </div>
              <div className='flex flex-col gap-3'>
                <FormikDatePicker
                  name='reminder_date'
                  label='Start date'
                  required
                  placeholder='DD-MM-YYYY'
                  format='DD-MM-YYYY'
                  disabledDate={(current) =>
                    current && current.startOf('day').isBefore(dayjs().startOf('day'))
                  }
                />
              </div>
            </div>
          </Modal>
        )
      }}
    </Formik>
  )
}

export default AddReminderForTreatment
