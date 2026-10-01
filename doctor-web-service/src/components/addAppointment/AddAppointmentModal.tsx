import useDispatchAction from '@hooks/useDispatchAction'
import {Modal} from 'antd'
import {useContext, useEffect, useState} from 'react'
import {Formik, FormikHelpers, FormikProps} from 'formik'
import QuitEditingModal from 'components/quitEditingModal/QuitEditingModal'
import AntdButton from 'components/atom/Buttons/AntdButton'
import {AddAppointmentFormValues} from './addAppointment.types'
import AddAppointmentForm from './AddAppointmentForm'
import addAppointmentFormValidations from './addAppointmentFormValidations'
import getInitialValues from './helpers/getInitialValues'
import {useParams} from 'react-router-dom'
import {safeParseInt} from 'utils/ConstFunctions'
import {RootState} from 'redux/store'
import {useSelector} from 'react-redux'
import CustomDrawer from 'components/drawer/CustomDrawer'
import {useMediaQuery} from 'react-responsive'
import hasValue from 'utils/hasValue'
import SuccessToast from 'components/modal/Alert/SuccessToast'
import {
  addAppointmentEvent,
  getEventsInDateRange,
  setOpenPopover,
  setSelectedEvent,
  updateAppointmentEvent,
} from 'redux/Slices/AppSlice/Calendar/calendar.slice'
import {AuthContext} from 'context/AuthContext'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import {getAppointmentsList} from 'redux/Slices/AppSlice/Appointment/Appointments.slice'
import getActiveFilter from 'screens/Patients/PatientList/utils/getActiveFilter'
import {
  appointmentNavListFilter,
  appointmentNavTabs,
} from 'screens/Patients/LeadsProfile/main/appointments/types/appointments.types'
import {getBracesTreatmentPlanList} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileTreatmentPlan.slice'
import bracesTreatmentStages from '@constants/bracesTreatmentStages'
dayjs.extend(customParseFormat)
const now = dayjs().toString()
const endDate = dayjs().add(30, 'minutes').toString()

const AddAppointmentModal = ({
  isModalVisible,
  toggleModal,
  setAppointmentCreatedSuccessfullyVisible,
  isOnAppointmentsPage,
  isOnBracesOverviewPage,
  practiceLocationId,
  dateRange,
  setAppointmentSuccessResponse,
  editAppointmentDetails,
  filter,
  onClose,
}: {
  isModalVisible: boolean
  practiceLocationId?: number
  isOnBracesOverviewPage?: boolean
  toggleModal: (value: boolean) => void
  setAppointmentCreatedSuccessfullyVisible: (value: boolean) => void
  isOnAppointmentsPage?: boolean
  dateRange?: {start: Date; end: Date} | null
  editAppointmentDetails?: Partial<AddAppointmentFormValues> & {appointment_id: number}
  onClose?: () => void
  filter?: appointmentNavListFilter
  setAppointmentSuccessResponse: (value: {
    reminder_id: number
    braces_journey_id?: number | null
    is_tracking_added: boolean
    start_date: string
    patient_id: number
    end_date: string
  }) => void
}) => {
  const [cancelSaveModalVisible, setCancelSaveModalVisible] = useState(false)
  const {patientId} = useParams()
  const {selectedEvent, addingAppointmentEvent} = useSelector((state: RootState) => state.calendar)
  const {patient_id, notes, end_date, start_date, amount, practice_location_id, reminder_id} =
    selectedEvent?.extendedProps.content?.details || {}
  const isEdit = hasValue(selectedEvent) || hasValue(editAppointmentDetails)
  const {userId} = useContext(AuthContext)
  const {dispatchAction} = useDispatchAction()
  const handleSubmit = async (
    values: AddAppointmentFormValues,
    formik: FormikHelpers<AddAppointmentFormValues>
  ) => {
    if (!isEdit) {
      const payload = {
        ...values,
        start_date: dayjs(values.start_date).format('YYYY-MM-DDTHH:mm:ss.SSSZ'),
        end_date: dayjs(values.end_date).format('YYYY-MM-DDTHH:mm:ss.SSSZ'),
        doctor_id: safeParseInt(userId),
      }

      dispatchAction(addAppointmentEvent(payload))
        .unwrap()
        .then(
          (res: {
            reminder_id: number
            braces_journey_id?: number | null
            is_tracking_added: boolean
            start_date: string
            end_date: string
            patient_id: number
          }) => {
            if (dateRange) {
              const formattedStartDate = dayjs(dateRange.start).format('YYYY-MM-DD')
              const formattedEndDate = dayjs(dateRange.end).format('YYYY-MM-DD')
              dispatchAction(
                getEventsInDateRange({
                  doctor_id: safeParseInt(userId),
                  start_date: formattedStartDate,
                  end_date: formattedEndDate,
                })
              )
            }
            setAppointmentSuccessResponse(res)
            dispatchAction(setOpenPopover(null))
            dispatchAction(setSelectedEvent(null))
            toggleModal(false)
            formik.resetForm()
            setAppointmentCreatedSuccessfullyVisible(true)
          }
        )
        .catch((error: string) => {
          if (error === 'AP005') {
            formik.setFieldError('start_date', 'Appointment is already created')
          }
        })
    } else {
      const reminderId = isOnAppointmentsPage
        ? safeParseInt(editAppointmentDetails?.appointment_id)
        : safeParseInt(reminder_id)
      const payload = {
        ...values,
        start_date: dayjs(values.start_date).format('YYYY-MM-DDTHH:mm:ss.SSSZ'),
        end_date: dayjs(values.end_date).format('YYYY-MM-DDTHH:mm:ss.SSSZ'),
        doctor_id: safeParseInt(userId),
        reminder_id: reminderId,
      }

      await dispatchAction(updateAppointmentEvent(payload))
        .unwrap()
        .then(() => {
          if (dateRange) {
            const formattedStartDate = dayjs(dateRange.start).format('YYYY-MM-DD')
            const formattedEndDate = dayjs(dateRange.end).format('YYYY-MM-DD')
            dispatchAction(
              getEventsInDateRange({
                doctor_id: safeParseInt(userId),
                start_date: formattedStartDate,
                end_date: formattedEndDate,
              })
            )
          }
          if (isOnAppointmentsPage && filter && patientId && userId) {
            if (!isOnBracesOverviewPage) {
              dispatchAction(
                getAppointmentsList({
                  doctor_id: safeParseInt(userId),
                  patient_id: safeParseInt(patientId),
                  status: getActiveFilter<appointmentNavTabs>({filter}),
                })
              )
            }
          }
          if (isOnBracesOverviewPage) {
            dispatchAction(
              getBracesTreatmentPlanList({
                doctor_id: String(userId),
                patient_id: String(patientId),
                braces_treatment_stage: bracesTreatmentStages.ACTIVE,
              })
            )
          }
          SuccessToast('Appointment updated')
          formik.resetForm()
          dispatchAction(setOpenPopover(null))
          dispatchAction(setSelectedEvent(null))
          toggleModal(false)
        })
    }
  }

  const handleClose = (formik: FormikProps<AddAppointmentFormValues>) => {
    if (formik.dirty) {
      setCancelSaveModalVisible(true)
    } else {
      onClose && onClose()
      dispatchAction(setOpenPopover(null))
      dispatchAction(setSelectedEvent(null))
      toggleModal(false)
      formik.resetForm()
    }
  }
  const isMobile = useMediaQuery({query: '(max-width: 768px)'})
  const [initialValues, setInitialValues] = useState<AddAppointmentFormValues>(() =>
    getInitialValues({
      isOnAppointmentsPage,
      practiceLocationId,
      now,
      endDate,
      patientId: safeParseInt(patientId),
      initialValues: getInitialFormValues(),
    })
  )

  useEffect(() => {
    if (isModalVisible) {
      const now = dayjs().toString()
      const endDate = dayjs().add(30, 'minutes').toString()
      const values = getInitialValues({
        isOnAppointmentsPage,
        practiceLocationId,
        now,
        patientId: safeParseInt(patientId),
        endDate,
        initialValues: getInitialFormValues(),
      })
      setInitialValues(values)
    }
  }, [
    isModalVisible,
    isOnAppointmentsPage,
    practiceLocationId,
    patientId,
    selectedEvent,
    editAppointmentDetails,
  ])

  function getInitialFormValues() {
    if (hasValue(selectedEvent)) {
      return {
        patient_id: patient_id,
        notes: notes ?? '',
        start_date: start_date,
        end_date: end_date,
        amount: amount,
        practice_location_id: practice_location_id,
      }
    } else if (editAppointmentDetails && isOnAppointmentsPage) {
      return {
        patient_id: safeParseInt(patientId),
        notes: editAppointmentDetails.notes ?? '',
        start_date: editAppointmentDetails.start_date,
        end_date: editAppointmentDetails.end_date,
        amount: editAppointmentDetails.amount,
        practice_location_id: editAppointmentDetails?.practice_location_id,
      }
    }
    return undefined
  }

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={handleSubmit}
      enableReinitialize
      validationSchema={addAppointmentFormValidations}
    >
      {(formik) => (
        <div>
          <Modal
            destroyOnClose={true}
            style={{fontFamily: 'figtree'}}
            styles={{
              content: {
                padding: '0',
              },
              footer: {
                paddingLeft: '20px',
                paddingRight: '20px',
                paddingTop: '10px',
                paddingBottom: '20px',
              },
            }}
            open={!isMobile ? isModalVisible : false}
            title={
              <div className='p-5'>
                <p className='font-semibold text-2xl'>
                  {!isEdit ? 'Add appointment' : 'Edit appointment'}
                </p>
                <p className='text-textColor font-medium text-sm'>
                  You can add braces notes after creating an appointment
                </p>
              </div>
            }
            width={600}
            footer={[
              <AntdButton
                key='submit'
                text={!isEdit ? 'Create appointment' : 'Save changes'}
                htmlType='submit'
                loading={addingAppointmentEvent}
                disabled={addingAppointmentEvent || (isEdit && !formik.dirty)}
                className='h-11 w-full bg-primaryColor text-center'
                onClick={() => formik.handleSubmit()}
              />,
            ]}
            onCancel={() => handleClose(formik)}
          >
            <AddAppointmentForm {...{formik, isOnAppointmentsPage, isEdit}} />
          </Modal>
          <CustomDrawer
            destroyOnClose={true}
            onClose={() => {
              handleClose(formik)
            }}
            style={{fontFamily: 'figtree'}}
            styles={{
              body: {
                padding: '0px',
              },
              content: {
                borderTopLeftRadius: '12px',
                borderTopRightRadius: '12px',
              },
              wrapper: {
                borderTopLeftRadius: '12px',
                borderTopRightRadius: '12px',
              },
              footer: {
                paddingLeft: '20px',
                paddingRight: '20px',
                paddingTop: '10px',
                paddingBottom: '20px',
              },
            }}
            placement='bottom'
            height={'80%'}
            open={isMobile ? isModalVisible : false}
            subTitle={
              <p className='text-sm'>You can add braces notes after creating an appointment</p>
            }
            title={'Add appointment'}
            width={'full'}
            footer={[
              <AntdButton
                key='submit'
                text={!isEdit ? 'Create appointment' : 'Save changes'}
                htmlType='submit'
                loading={addingAppointmentEvent}
                disabled={addingAppointmentEvent || (isEdit && !formik.dirty)}
                className='h-11 w-full bg-primaryColor text-center'
                onClick={() => formik.handleSubmit()}
              />,
            ]}
          >
            <AddAppointmentForm {...{formik, isOnAppointmentsPage, isEdit}} />
          </CustomDrawer>
          <QuitEditingModal
            {...{
              visible: cancelSaveModalVisible,
              setQuitModalVisible: setCancelSaveModalVisible,
              onOkClick: () => {
                toggleModal(false)
                dispatchAction(setOpenPopover(null))
                dispatchAction(setSelectedEvent(null))
                formik.resetForm()
              },
            }}
          />
        </div>
      )}
    </Formik>
  )
}

export default AddAppointmentModal
