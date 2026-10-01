import {Modal} from 'antd'
import {useContext, useState} from 'react'
import {AddReminderFormValues} from './addReminder.types'
import {Formik, FormikHelpers, FormikProps, useFormikContext} from 'formik'
import QuitEditingModal from 'components/quitEditingModal/QuitEditingModal'
import AddReminderForm from './AddReminderForm'
import AntdButton from 'components/atom/Buttons/AntdButton'
import addReminderValidationSchema from './addReminderFormValidations'
import getInitialValues from './helpers/getInitialValues'
import {useParams} from 'react-router-dom'
import {safeParseInt} from 'utils/ConstFunctions'
import CustomDrawer from 'components/drawer/CustomDrawer'
import {useMediaQuery} from 'react-responsive'
import useDispatchAction from '@hooks/useDispatchAction'
import {
  updateReminderEvent,
  getEventsInDateRange,
  addReminderEvent,
  setOpenPopover,
  setSelectedEvent,
} from 'redux/Slices/AppSlice/Calendar/calendar.slice'
import {AuthContext} from 'context/AuthContext'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import SuccessToast from 'components/modal/Alert/SuccessToast'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import hasValue from 'utils/hasValue'
import reminderTypeConstants from '@constants/reminderType.constants'
import {getPaymentDetail} from 'redux/Slices/AppSlice/Payments/Payments.slice'
import {getAppointmentReminderList} from 'redux/Slices/AppSlice/BracesNotes/BracesNotes.slice'
import {postApiDataProductionSlice} from 'redux/Slices/AppSlice/production/production.slice'
import When from 'components/when/When'
import {FilterDrawerFormikContextType} from 'screens/billingsAndPayments/billingsAndPayments.types'
import useServiceConfigurationState from 'screens/settings/services/hooks/useServiceConfigurationState'
import {ServiceConfigurationItemName} from 'redux/Slices/AppSlice/ServiceConfiguration/ServiceConfiguration.slice'
dayjs.extend(customParseFormat)

const AddReminderModal = ({
  isModalVisible,
  toggleModal,
  isOnPaymentsPage,
  dateRange,
  isOnAppointmentsPage,
  isOnProductionPage,
  productionOrderReminderDetails,
  productionOrderAlignerJourneyId,
  productionOrderPatientId,
  paymentReminderData,
  billingAndPaymentsScreenPatientId,
  isOnBillingsAndPaymentsPage,
  onClose,
  onDeleteReminder,
  patientData,
}: {
  isModalVisible: boolean
  toggleModal: (value: boolean) => void
  isOnPaymentsPage?: boolean
  dateRange?: {start: Date; end: Date} | null
  isOnAppointmentsPage?: boolean
  isOnProductionPage?: boolean
  productionOrderPatientId?: number
  productionOrderAlignerJourneyId?: number
  isOnBillingsAndPaymentsPage?: boolean
  productionOrderReminderDetails?: Partial<AddReminderFormValues> & {
    productionOrderReminderId?: number
  }
  paymentReminderData?: Partial<AddReminderFormValues> & {
    reminder_id?: number
    aligner_journey_id?: number
  }
  billingAndPaymentsScreenPatientId?: number
  onClose?: () => void
  onDeleteReminder?: () => void
  patientData?: {
    profileUrl?: string | null
    patientName?: string | null
  }
}) => {
  const [cancelSaveModalVisible, setCancelSaveModalVisible] = useState(false)
  const {patientId: patientIdFromParams} = useParams()
  const patientId = !isOnBillingsAndPaymentsPage
    ? patientIdFromParams
    : billingAndPaymentsScreenPatientId
  const {userId} = useContext(AuthContext)
  const {addingReminderEvent, selectedEvent} = useSelector((state: RootState) => state.calendar)
  const {title, patient_id, notes, time, date, amount, reminder_id, aligner_journey_id} =
    selectedEvent?.extendedProps.content?.details || {}
  const {calendar_response_type} = selectedEvent?.extendedProps || {}
  const isEdit =
    hasValue(selectedEvent) ||
    hasValue(productionOrderReminderDetails) ||
    hasValue(paymentReminderData)
  const {dispatchAction} = useDispatchAction()
  const billingPageFormik = useFormikContext<FilterDrawerFormikContextType>()
  const {sections} = useServiceConfigurationState()
  const canShowAggregatedProgress = sections.some(
    (section) =>
      section.itemName === ServiceConfigurationItemName.PAYMENT_AND_BILLING && section.isActive
  )
  const handleSubmit = async (
    values: AddReminderFormValues,
    formik: FormikHelpers<AddReminderFormValues>
  ) => {
    try {
      if (!isEdit) {
        const payload = {
          ...values,
          date: dayjs(values.date).format('YYYY-MM-DD'),
          time: dayjs(values.time, 'h:mm A').format('HH:mm:ss'),
          doctor_id: safeParseInt(userId),
        }
        dispatchAction(addReminderEvent(payload))
          .unwrap()
          .then(async () => {
            if (isOnPaymentsPage) {
              await dispatchAction(
                getPaymentDetail({
                  doctor_id: safeParseInt(userId),
                  patient_id: safeParseInt(patientId),
                })
              )
            }
            if (isOnAppointmentsPage) {
              dispatchAction(
                getAppointmentReminderList({
                  doctor_id: safeParseInt(userId),
                  patient_id: safeParseInt(patientId),
                })
              )
            }
            if (isOnProductionPage) {
              dispatchAction(
                postApiDataProductionSlice({
                  status: '',
                  doctorId: safeParseInt(userId),
                })
              )
            }
            if (isOnBillingsAndPaymentsPage) {
              billingPageFormik.handleSubmit()
            }
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
              dispatchAction(setOpenPopover(null))
              dispatchAction(setSelectedEvent(null))
            }
            SuccessToast('Reminder added successfully')
            formik.resetForm()
            toggleModal(false)
          })
      } else {
        const payload = {
          ...values,
          date: dayjs(values.date).format('YYYY-MM-DD'),
          time: dayjs(values.time, 'h:mm A').format('HH:mm:ss'),
          doctor_id: safeParseInt(userId),
          reminder_id:
            !isOnProductionPage && !isOnBillingsAndPaymentsPage
              ? safeParseInt(reminder_id)
              : isOnBillingsAndPaymentsPage
                ? safeParseInt(paymentReminderData?.reminder_id)
                : safeParseInt(productionOrderReminderDetails?.productionOrderReminderId),
          aligner_journey_id:
            !isOnProductionPage && !isOnBillingsAndPaymentsPage
              ? safeParseInt(aligner_journey_id)
              : isOnBillingsAndPaymentsPage
                ? safeParseInt(paymentReminderData?.aligner_journey_id)
                : safeParseInt(productionOrderAlignerJourneyId),
        }
        dispatchAction(updateReminderEvent(payload))
          .unwrap()
          .then(async () => {
            if (isOnPaymentsPage) {
              await dispatchAction(
                getPaymentDetail({
                  doctor_id: safeParseInt(userId),
                  patient_id: safeParseInt(patientId),
                })
              )
            }
            if (isOnProductionPage) {
              dispatchAction(
                postApiDataProductionSlice({
                  status: '',
                  doctorId: safeParseInt(userId),
                })
              )
            }
            if (isOnBillingsAndPaymentsPage) {
              billingPageFormik.handleSubmit()
            }
            SuccessToast('Reminder updated')
            toggleModal(false)
            formik.resetForm()
            dispatchAction(setOpenPopover(null))
            dispatchAction(setSelectedEvent(null))
            if (dateRange) {
              const formattedStartDate = dayjs(dateRange.start).format('YYYY-MM-DD')
              const formattedEndDate = dayjs(dateRange.end).format('YYYY-MM-DD')
              await dispatchAction(
                getEventsInDateRange({
                  doctor_id: safeParseInt(userId),
                  start_date: formattedStartDate,
                  end_date: formattedEndDate,
                })
              )
            }
          })
      }
    } catch (error) {
      throw error
    }
  }

  const handleClose = (formik: FormikProps<AddReminderFormValues>) => {
    if (formik.dirty) {
      setCancelSaveModalVisible(true)
    } else {
      dispatchAction(setOpenPopover(null))
      dispatchAction(setSelectedEvent(null))
      onClose && onClose()
      toggleModal(false)
      formik.resetForm()
    }
  }
  const isMobile = useMediaQuery({query: '(max-width: 768px)'})

  return (
    <Formik
      initialValues={getInitialValues({
        isOnPaymentsPage,
        isOnAppointmentsPage,
        isOnProductionPage,
        isOnBillingsAndPaymentsPage,
        patientId: !isOnProductionPage
          ? safeParseInt(patientId)
          : safeParseInt(productionOrderPatientId),
        initialValues: hasValue(selectedEvent)
          ? {
              reminder_category:
                calendar_response_type as AddReminderFormValues['reminder_category'],
              patient_id,
              title,
              notes,
              date: dayjs(date).format('YYYY-MM-DD'),
              time: dayjs(time, 'HH:mm:ss').format('h:mm A'),
              amount,
            }
          : productionOrderReminderDetails && isOnProductionPage
            ? {
                reminder_category: 'PRODUCTION_REMINDER',
                patient_id: productionOrderPatientId,
                title: productionOrderReminderDetails.title,
                notes: productionOrderReminderDetails.notes,
                date: dayjs(productionOrderReminderDetails.date).format('YYYY-MM-DD'),
                time: dayjs(productionOrderReminderDetails.time, 'HH:mm:ss').format('h:mm A'),
              }
            : paymentReminderData && isOnBillingsAndPaymentsPage
              ? {
                  reminder_category: 'PAYMENT_REMINDER',
                  patient_id: billingAndPaymentsScreenPatientId,
                  title: paymentReminderData.title,
                  notes: paymentReminderData.notes,
                  date: dayjs(paymentReminderData.date).format('YYYY-MM-DD'),
                  time: dayjs(paymentReminderData.time, 'HH:mm:ss').format('h:mm A'),
                  amount: paymentReminderData.amount,
                }
              : undefined,
      })}
      enableReinitialize
      validationSchema={addReminderValidationSchema}
      validateOnBlur={false}
      onSubmit={handleSubmit}
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
                  {!isEdit ? 'Add reminder' : 'Edit reminder'}
                </p>
              </div>
            }
            width={600}
            footer={
              <div className='flex justify-between gap-2'>
                <When isTrue={isOnBillingsAndPaymentsPage && isEdit} key={'delete'}>
                  <AntdButton
                    text={'Delete reminder'}
                    htmlType='button'
                    className='h-11  w-full !bg-redSupport hover:!bg-redSupport text-center !text-red border !border-red'
                    onClick={() => onDeleteReminder && onDeleteReminder()}
                  />
                </When>
                <AntdButton
                  key='submit'
                  text={!isEdit ? 'Create reminder' : 'Save changes'}
                  htmlType='submit'
                  className='h-11 w-full bg-primaryColor text-center'
                  loading={addingReminderEvent}
                  disabled={addingReminderEvent || (isEdit && !formik.dirty)}
                  onClick={() => formik.handleSubmit()}
                />
              </div>
            }
            onCancel={() => handleClose(formik)}
          >
            <AddReminderForm
              {...{
                formik,
                isOnPaymentsPage: isOnPaymentsPage || isOnBillingsAndPaymentsPage,
                isOnAppointmentsPage,
                isOnProductionPage,
                initialReminderCategory:
                  calendar_response_type as keyof typeof reminderTypeConstants,
                isEdit,
                patientData,
                isOnBillingsAndPaymentsPage,
                allowPaymentReminder: canShowAggregatedProgress,
              }}
            />
          </Modal>
          <QuitEditingModal
            {...{
              visible: cancelSaveModalVisible,
              setQuitModalVisible: setCancelSaveModalVisible,
              onOkClick: () => {
                dispatchAction(setOpenPopover(null))
                dispatchAction(setSelectedEvent(null))
                toggleModal(false)
                formik.resetForm()
              },
            }}
          />
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
            open={isMobile ? isModalVisible : false}
            height={'80%'}
            title={!isEdit ? 'Add reminder' : 'Edit reminder'}
            width={'full'}
            footer={
              <div className='flex justify-between gap-2'>
                <When isTrue={isOnBillingsAndPaymentsPage && isEdit} key={'delete'}>
                  <AntdButton
                    text={'Delete reminder'}
                    htmlType='button'
                    className='h-11  w-full !bg-redSupport hover:!bg-redSupport text-center !text-red border !border-red'
                    onClick={() => onDeleteReminder && onDeleteReminder()}
                  />
                </When>
                <AntdButton
                  key='submit'
                  text={!isEdit ? 'Create reminder' : 'Save changes'}
                  htmlType='submit'
                  className='h-11 w-full bg-primaryColor text-center'
                  loading={addingReminderEvent}
                  disabled={addingReminderEvent || (isEdit && !formik.dirty)}
                  onClick={() => formik.handleSubmit()}
                />
              </div>
            }
          >
            <AddReminderForm
              {...{
                formik,
                isOnPaymentsPage: isOnPaymentsPage || isOnBillingsAndPaymentsPage,
                isOnAppointmentsPage,
                isOnProductionPage,
                initialReminderCategory:
                  calendar_response_type as keyof typeof reminderTypeConstants,
                isEdit,
                patientData,
                isOnBillingsAndPaymentsPage,
                allowPaymentReminder: canShowAggregatedProgress,
              }}
            />
          </CustomDrawer>
        </div>
      )}
    </Formik>
  )
}

export default AddReminderModal
