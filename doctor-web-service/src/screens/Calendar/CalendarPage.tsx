import {useContext, useEffect, useRef, useState} from 'react'
import {CalendarApi} from '@fullcalendar/core'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import multiMonthPlugin from '@fullcalendar/multimonth'
import listPlugin from '@fullcalendar/list'
import {Modal, Spin} from 'antd'
import './calendar.css'
import AddReminderModal from 'components/AddReminder/AddReminderModal'
import {useMediaQuery} from 'react-responsive'
import AddAppointmentModal from 'components/addAppointment/AddAppointmentModal'
import EventContent from './components/EventContent'
import CreateAnEventModal from './components/CreateAnEventModal'
import moment from 'moment'
import cn from '@utils/cn'
import AppointmentCreatedSuccessfully from 'components/addAppointment/AppointmentCreatedSuccessfully'
import {CustomEventApi, CustomEventContentArg} from './calendar.types'
import getColorCombinationForEvent from './helpers/getColorCombinationForEvent'
import getEventTitle from './helpers/getEventTitle'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import useDispatchAction from '@hooks/useDispatchAction'
import {
  deleteEvent,
  getEventsInDateRange,
  setOpenPopover,
  setSelectedEvent,
} from 'redux/Slices/AppSlice/Calendar/calendar.slice'
import {AuthContext} from 'context/AuthContext'
import dayjs from 'dayjs'
import eventDidMount from './helpers/eventDidMount'
import DeleteEvent from 'components/deleteEvent/DeleteEvent'
import {safeParseInt} from 'utils/ConstFunctions'
import TextWithTooltip from 'components/section/TextWithTooltip'
import CommonEmptyState from 'components/emptyState/CommonEmptyState'
import {IMAGE_DASHBOARD_EMPTY_STATE} from 'utils/ImageConst'
import reminderTypeOptions from '@staticData/reminderTypeOptions'
import reminderTypeConstants from '@constants/reminderType.constants'
import {setAppointmentDetails} from 'redux/Slices/AppSlice/BracesNotes/BracesNotes.slice'
import {useLocation, useNavigate} from 'react-router-dom'
import SuccessToast from 'components/modal/Alert/SuccessToast'
import Spinner from 'components/spinner/Spinner'

const CalendarPage = ({showHeader = true}: {showHeader?: boolean}) => {
  const {currentEvents, gettingCalendarEvents, selectedEvent, openPopover} = useSelector(
    (state: RootState) => state.calendar
  )
  const currentEventsRef = useRef(currentEvents)
  useEffect(() => {
    currentEventsRef.current = currentEvents
    const earliestEvent = currentEvents.reduce(
      (earliest, event) => {
        const eventStart = moment(event.start)
        return eventStart.isBefore(earliest) ? eventStart : earliest
      },
      moment().startOf('day').add(7, 'hours')
    )

    const today7AM = moment().startOf('day').add(7, 'hours')
    const calendarApi = calendarRef.current?.getApi()
    if (calendarApi) {
      if (earliestEvent.isBefore(today7AM)) {
        calendarApi.scrollToTime(earliestEvent.format('HH:mm:ss'))
      } else {
        calendarApi.scrollToTime('07:00:00')
      }
    }
  }, [currentEvents])

  const location = useLocation()
  const {reminderId, eventDate, isToday} = location.state || {}

  const clearLocationState = () => {
    navigate(window.location.pathname, {state: {}, replace: true})
  }
  const {userId}: any = useContext(AuthContext)
  const [dateRange, setDateRange] = useState<{start: Date; end: Date} | null>(null)
  const {dispatchAction} = useDispatchAction()

  useEffect(() => {
    if (reminderId && eventDate) {
      const callViewAppointmentClick = async () => {
        onViewAppointmentClick(new Date(eventDate), safeParseInt(reminderId))
      }
      callViewAppointmentClick()
    }
  }, [reminderId])

  useEffect(() => {
    if (!dateRange) return
    if (eventDate) {
      calendarRef.current?.getApi().gotoDate(new Date(eventDate))
      clearLocationState()
      return
    }
    const fetchCurrentEvents = async () => {
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
    fetchCurrentEvents()
    return () => {
      dispatchAction(setSelectedEvent(null))
      dispatchAction(setOpenPopover(null))
    }
  }, [dateRange])

  const [isModalVisible, setIsModalVisible] = useState(false)
  const handleEventClick = ({event}: {event: CustomEventContentArg['event']}) => {
    dispatchAction(setOpenPopover(event.id))
    dispatchAction(setSelectedEvent(event))
  }
  const toggleModal = (value: boolean) => {
    setIsModalVisible(value)
  }
  const [isAddAppointmentModalVisible, setIsAddAppointmentModalVisible] = useState(false)
  const [appointmentCreatedSuccessfullyVisible, setAppointmentCreatedSuccessfullyVisible] =
    useState(false)
  const [deleteEventModalVisible, setDeleteEventModalVisible] = useState(false)
  const [isCreateEventModalVisible, setIsCreateEventModalVisible] = useState(false)
  const [appointmentSuccessResponse, setAppointmentSuccessResponse] = useState<{
    reminder_id: number
    braces_journey_id?: number | null
    is_tracking_added: boolean
    start_date: string
    end_date: string
    patient_id: number
  } | null>(null)
  const calendarRef = useRef<FullCalendar>(null)

  const onViewAppointmentClick = async (eventDate: Date, reminderId: number | null) => {
    const calendarApi: CalendarApi | undefined = calendarRef.current?.getApi()

    if (calendarApi) {
      calendarApi.gotoDate(eventDate)

      const findEvent = (attempts: number) => {
        const eventId = currentEventsRef.current
          .find((event) => event.content.details.reminder_id === reminderId)
          ?.id?.toString()

        if (eventId) {
          const event = calendarApi.getEventById(eventId) as CustomEventApi | null
          if (event) {
            handleEventClick({
              event: event as CustomEventContentArg['event'],
            })
            return
          }
        }

        if (attempts > 0) {
          setTimeout(() => findEvent(attempts - 1), 500)
        }
      }

      setTimeout(() => findEvent(5), 500)
    }
  }

  const isMobile = useMediaQuery({query: '(max-width: 768px)'})
  const toggleAddReminderFormContainer = (value: boolean) => {
    toggleModal(value)
  }
  const toggleAddAppointmentModal = (value: boolean) => {
    setIsAddAppointmentModalVisible(value)
  }

  const toggleAddAppointmentFormContainer = (value: boolean) => {
    toggleAddAppointmentModal(value)
  }
  const getCharacterCountForTextWithTooltip = (viewType: string) => {
    if (viewType === 'dayGridMonth') {
      return 20
    }
    if (viewType === 'timeGridDay') {
      return 100
    }
    if (viewType === 'listWeek') {
      return 100
    }
    return 20
  }
  const renderEventContent = (eventContent: CustomEventContentArg) => {
    const viewType = eventContent.view.type
    const isOpen = openPopover === eventContent.event.id

    const {primaryColor, secondaryColor} = getColorCombinationForEvent(
      eventContent.event.extendedProps.calendar_response_type
    )

    return (
      <div
        className='flex py-2 cursor-pointer w-full px-1 gap-2 border border-mediumGray rounded-[4px] text-black font-semibold'
        style={{backgroundColor: isOpen ? secondaryColor : 'white'}}
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          handleEventClick({event: eventContent.event})
        }}
      >
        <div
          style={{backgroundColor: primaryColor}}
          className='w-1 h-full text-transparent rounded'
        >
          |
        </div>
        <div className='text-wrap'>
          <div className='hidden md:block'>
            <TextWithTooltip desktopCharacterCount={getCharacterCountForTextWithTooltip(viewType)}>
              {getEventTitle(eventContent)}
            </TextWithTooltip>
          </div>
          <div className='md:hidden flex flex-wrap'>{getEventTitle(eventContent)}</div>
        </div>
      </div>
    )
  }
  const navigate = useNavigate()

  // Determine the initial view based on isToday and device
  const getInitialView = () => {
    if (isToday) {
      return 'timeGridDay'
    }
    if (isMobile || !showHeader) {
      return 'listWeek'
    }
    return 'dayGridMonth'
  }

  return (
    <div className='w-full md:pb-0 pb-[70px]'>
      <CreateAnEventModal
        {...{
          isCreateEventModalVisible,
          setIsCreateEventModalVisible,
          toggleAddAppointmentFormContainer,
          toggleAddReminderFormContainer,
        }}
      />
      <AddReminderModal
        {...{
          isModalVisible,
          toggleModal,
          dateRange,
        }}
      />
      <Modal
        open={openPopover === selectedEvent?.id}
        destroyOnClose={true}
        style={{fontFamily: 'figtree'}}
        closeIcon={null}
        centered
        styles={{
          content: {
            padding: '16px',
            zIndex: 1000,
          },
        }}
        width={isMobile ? '100%' : 382}
        footer={null}
        afterOpenChange={(visible) => {
          if (!visible) {
            dispatchAction(setOpenPopover(null))
          }
        }}
        onCancel={() => {
          dispatchAction(setOpenPopover(null))
          dispatchAction(setSelectedEvent(null))
        }}
      >
        {selectedEvent && (
          <EventContent
            event={selectedEvent}
            setDeleteEventModalVisible={setDeleteEventModalVisible}
            toggleAddReminderFormContainer={toggleAddReminderFormContainer}
            toggleAddAppointmentFormContainer={toggleAddAppointmentFormContainer}
            deleteEventModalVisible={deleteEventModalVisible}
            isAddAppointmentModalVisible={isAddAppointmentModalVisible}
            isCreateReminderModalVisible={isModalVisible}
          />
        )}
      </Modal>
      <AddAppointmentModal
        {...{
          isModalVisible: isAddAppointmentModalVisible,
          toggleModal: toggleAddAppointmentModal,
          setAppointmentCreatedSuccessfullyVisible,
          setAppointmentSuccessResponse,
          dateRange,
        }}
      />

      <AppointmentCreatedSuccessfully
        {...{
          visible: appointmentCreatedSuccessfullyVisible,
          setQuitModalVisible: setAppointmentCreatedSuccessfullyVisible,
          bracesJourneyId: appointmentSuccessResponse?.braces_journey_id,
          onViewAppointmentClick: () => {
            if (appointmentSuccessResponse?.start_date && appointmentSuccessResponse?.reminder_id) {
              onViewAppointmentClick(
                new Date(appointmentSuccessResponse?.start_date),
                appointmentSuccessResponse.reminder_id
              )
            }
          },
          onOkClick: () => {
            if (appointmentSuccessResponse) {
              const {reminder_id, braces_journey_id, start_date, patient_id, end_date} =
                appointmentSuccessResponse
              if (start_date && braces_journey_id && patient_id && end_date && reminder_id) {
                dispatchAction(setAppointmentDetails({}))
                const queryParams = new URLSearchParams({
                  startDate: start_date.toString(),
                  endDate: end_date.toString(),
                  reminderId: reminder_id.toString(),
                }).toString()
                navigate(
                  `/profile/${patient_id}/bracesNotes/${braces_journey_id}/attachNotes?${queryParams}`
                )
              }
            }
          },
        }}
      />
      <DeleteEvent
        {...{
          visible: deleteEventModalVisible,
          setDeleteModalVisible: setDeleteEventModalVisible,
          onOkClick: async () => {
            const {reminder_id, braces_journey_id} =
              selectedEvent?.extendedProps.content.details ?? {}
            if (reminder_id && selectedEvent) {
              dispatchAction(
                deleteEvent({
                  reminder_id,
                  isAppointment:
                    selectedEvent.extendedProps.calendar_response_type === 'APPOINTMENT',
                  isReminder: reminderTypeOptions
                    .map((item) => item.value)
                    .includes(
                      selectedEvent.extendedProps
                        .calendar_response_type as keyof typeof reminderTypeConstants
                    ),
                  braces_journey_id,
                  aligner_journey_id:
                    selectedEvent.extendedProps.content?.details?.aligner_journey_id,
                  reminder_category: selectedEvent.extendedProps
                    .calendar_response_type as keyof typeof reminderTypeConstants,
                  patient_id: selectedEvent.extendedProps.content?.details?.patient_id,
                })
              )
                .unwrap()
                .then(() => {
                  SuccessToast(
                    `${
                      selectedEvent.extendedProps.calendar_response_type === 'APPOINTMENT'
                        ? 'Appointment'
                        : 'Reminder'
                    } deleted successfully`
                  )
                  dispatchAction(
                    getEventsInDateRange({
                      doctor_id: safeParseInt(userId),
                      start_date: dayjs(dateRange?.start).format('YYYY-MM-DD'),
                      end_date: dayjs(dateRange?.end).format('YYYY-MM-DD'),
                    })
                  )
                })
            }
          },
          eventType: selectedEvent?.extendedProps.calendar_response_type,
        }}
      />
      <div className='w-full '>
        <Spin indicator={<Spinner loading />} spinning={gettingCalendarEvents}>
          <FullCalendar
            ref={calendarRef}
            plugins={[
              dayGridPlugin,
              timeGridPlugin,
              interactionPlugin,
              listPlugin,
              multiMonthPlugin,
            ]}
            views={{
              listWeek: {
                buttonText: 'Schedule',
                duration: {days: 7},
                dayHeaderContent: (arg) => {
                  const formattedDate = moment(arg.date).format('dddd D MMMM')
                  const isToday = moment(arg.date).isSame(moment(), 'day')

                  return (
                    <div
                      className={cn(
                        'uppercase font-semibold text-sm py-3',
                        isToday ? 'text-primaryColor bg-primarySupport ' : 'text-textColor'
                      )}
                    >
                      {formattedDate}
                    </div>
                  )
                },
              },
              timeGridWeek: {
                buttonText: 'Week',
                dayHeaderContent: (arg) => {
                  const isToday = moment(arg.date).isSame(moment(), 'day')
                  const day = moment(arg.date).format('ddd')
                  const date = moment(arg.date).format('D')

                  return (
                    <div
                      className={cn(
                        'flex gap-2 text-textColor items-center font-semibold',
                        isToday && 'bg-primarySupport'
                      )}
                    >
                      <p>{day}</p>
                      <div
                        className={cn(
                          'text-black',
                          isToday && 'bg-primaryColor text-white rounded-full px-2'
                        )}
                      >
                        {date}
                      </div>
                    </div>
                  )
                },
              },
              timeGridDay: {
                buttonText: 'Day',
                titleFormat: {year: 'numeric', month: 'short', day: 'numeric', weekday: 'short'},
                dayHeaderContent: (arg) => {
                  const formattedDate = moment(arg.date).format('dddd D MMMM')
                  const isToday = moment(arg.date).isSame(moment(), 'day')

                  return (
                    <div
                      className={cn(
                        'uppercase font-semibold text-sm',
                        isToday ? 'text-primaryColor bg-primarySupport ' : 'text-textColor'
                      )}
                    >
                      {formattedDate}
                    </div>
                  )
                },
              },
              dayGridMonth: {
                buttonText: 'Month',
              },
              multiMonthYear: {
                buttonText: 'Year',
                duration: {years: 1},
              },
            }}
            noEventsContent={
              <CommonEmptyState
                image={IMAGE_DASHBOARD_EMPTY_STATE}
                boxStyle='w-full h-full justify-center items-center'
                imageStyle='w-[138px] h-[134]'
                title='No events available'
                titleStyle=' text-textColor font-medium text-[16px] mt-4 text-center'
                subTitleStyle='md:w-[325px] w-full text-textColor font-medium text-[14px]  text-center'
              />
            }
            slotDuration='01:00:00'
            headerToolbar={
              showHeader
                ? {
                    left: 'titleText subTitleText',
                    right:
                      'title prev,next timeGridDay,timeGridWeek,dayGridMonth,listWeek,divider,createButton',
                    // right:
                    //   'title prev,next timeGridDay,timeGridWeek,dayGridMonth,listWeek,multiMonthYear,divider,createButton',
                  }
                : false
            }
            customButtons={
              showHeader
                ? {
                    titleText: {
                      text: 'Calendar',
                      click: () => {},
                    },
                    subTitleText: {
                      text: 'Keep track of and view details of patients under the doctors here.',
                      click: () => {},
                    },
                    divider: {
                      text: '|',
                      click: () => {},
                    },
                    createButton: {
                      text: 'Create',
                      click: () => {
                        setIsCreateEventModalVisible(true)
                      },
                    },
                  }
                : {}
            }
            initialView={getInitialView()}
            selectable={false}
            dayMaxEventRows={3}
            eventDidMount={eventDidMount}
            eventMaxStack={1}
            weekends={true}
            // initialEvents={INITIAL_EVENTS}
            eventContent={renderEventContent}
            events={currentEvents}
            defaultTimedEventDuration='00:30:00'
            slotMinTime='00:00:00'
            slotMaxTime='24:00:00'
            moreLinkClick={(arg) => {
              if (arg.view.type === 'dayGridMonth') {
                return 'day'
              }
              return 'popover'
            }}
            scrollTime={'07:00:00'}
            datesSet={(arg) => {
              setDateRange({start: arg.start, end: arg.end})
            }}
            allDaySlot={false}
          />
        </Spin>
      </div>
    </div>
  )
}

export default CalendarPage
