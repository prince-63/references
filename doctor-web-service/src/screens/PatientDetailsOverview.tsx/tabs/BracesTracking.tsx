import React, {useContext, useEffect, useMemo, useState} from 'react'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import useDispatchAction from '@hooks/useDispatchAction'
import {AuthContext} from 'context/AuthContext'
import {
  getBracesNotesList,
  setAppointmentDetails,
} from 'redux/Slices/AppSlice/BracesNotes/BracesNotes.slice'
import {getBracesTreatmentPlan} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileTreatmentPlan.slice'
import {identifyUser, safeParseInt} from 'utils/ConstFunctions'
import TableContainerForBracesNotes from 'screens/Patients/LeadsProfile/main/bracesNotes/components/TableContainerForBracesNotes'
import AddAppointment from 'screens/Patients/LeadsProfile/main/appointments/AddAppointment'
import {Progress} from 'antd'
import PlusIcon from 'assets/icons/PlusIcon'
import getColorPalette from 'utils/getColorPalette'
import AddAppointmentModal from 'components/addAppointment/AddAppointmentModal'
import AppointmentCreatedSuccessfully from 'components/addAppointment/AppointmentCreatedSuccessfully'
import {useNavigate} from 'react-router-dom'
import dayjs from 'dayjs'
import useProfileBasePath from '@hooks/useProfileBasePath'

interface BracesTrackingProps {
  patientId: number
  bracesJourneyId: number
  practiceLocationId?: number
}

const BracesTracking: React.FC<BracesTrackingProps> = ({
  patientId,
  bracesJourneyId,
  practiceLocationId,
}) => {
  const {dispatchAction} = useDispatchAction()
  const {userId} = useContext(AuthContext)
  const navigate = useNavigate()
  const profileBasePath = useProfileBasePath()
  const [editingAppointmentId, setEditingAppointmentId] = useState<string | null>(null)

  const [isAddAppointmentModalVisible, setIsAddAppointmentModalVisible] = useState(false)
  const [appointmentCreatedSuccessfullyVisible, setAppointmentCreatedSuccessfullyVisible] =
    useState(false)
  const [appointmentSuccessResponse, setAppointmentSuccessResponse] = useState<{
    reminder_id: number
    braces_journey_id?: number | null
    is_tracking_added: boolean
    start_date: string
    end_date: string
    patient_id: number
  } | null>(null)

  const {bracesNotesList} = useSelector((state: RootState) => state.bracesNotes)

  const {treatmentPlanBraces} = useSelector(
    (state: RootState) => state.leadsProfileTreatmentPlanReducer
  )

  const getTreatmentList = () => {
    if (patientId && userId) {
      dispatchAction(
        getBracesNotesList({
          doctor_id: safeParseInt(userId),
          patient_id: patientId,
        })
      )
    }
  }

  useEffect(() => {
    getTreatmentList()
  }, [dispatchAction, patientId, userId, editingAppointmentId]) // Re-fetch when editing finishes

  useEffect(() => {
    if (bracesJourneyId && userId) {
      dispatchAction(
        getBracesTreatmentPlan({
          doctorId: safeParseInt(userId),
          bracesJourneyId: bracesJourneyId,
        })
      )
    }
  }, [dispatchAction, bracesJourneyId, userId])

  // Total planned duration (months)
  const totalDuration = useMemo(() => {
    return safeParseInt(treatmentPlanBraces?.tentative_treatment_duration_in_months) || 0
  }, [treatmentPlanBraces])

  const completedTotalMonths = useMemo(() => {
    const startDate = treatmentPlanBraces?.treatment_start_date
    if (!startDate) return 0

    // Your format is YYYY-MM-DD
    const start = dayjs(startDate, 'YYYY-MM-DD', true).startOf('day')
    const now = dayjs().startOf('day')

    // If invalid or start is in the future → 0 (treatment not started)
    if (!start.isValid() || start.isAfter(now)) return 0

    const diffDays = now.diff(start, 'day')

    let months: number
    if (diffDays >= 0 && diffDays < 30) {
      // Less than 30 days but started → count as 1 month
      months = 1
    } else {
      months = now.diff(start, 'month')
    }

    // Clamp to total planned duration if available
    const clamped = totalDuration > 0 ? Math.min(months, totalDuration) : months

    // If completed months is 0 (but treatment has started), show 1
    return clamped === 0 ? 1 : clamped
  }, [treatmentPlanBraces?.treatment_start_date, totalDuration])

  // Overall % based on completedTotalMonths
  const overallProgressPercentage =
    totalDuration > 0 ? Math.min((completedTotalMonths / totalDuration) * 100, 100) : 0

  // For jaw-wise UI, keep using notes-based count
  const completedMonthsFromNotes = bracesNotesList?.length || 0
  const jawProgressPercentage =
    totalDuration > 0 ? Math.min((completedMonthsFromNotes / totalDuration) * 100, 100) : 0

  const getStageBreakdown = (jawType: 'UPPER' | 'LOWER') => {
    const breakdown: Record<string, number> = {}

    bracesNotesList?.forEach((note: any) => {
      const jaw = note.jaws?.find((j: any) => j.jaw_type === jawType || j.jaw_type === 'BOTH')
      if (jaw && jaw.treatment_stage_type) {
        const stage = jaw.treatment_stage_type
        breakdown[stage] = (breakdown[stage] || 0) + 1
      }
    })

    return breakdown
  }

  const upperJawBreakdown = useMemo(() => getStageBreakdown('UPPER'), [bracesNotesList])
  const lowerJawBreakdown = useMemo(() => getStageBreakdown('LOWER'), [bracesNotesList])

  const renderProgressBar = (breakdown: Record<string, number>) => {
    const colors = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444']

    return (
      <div className='relative h-2 w-full bg-gray-200 rounded-full overflow-hidden flex'>
        {Object.entries(breakdown).map(([stage, count], index) => {
          const percent = totalDuration > 0 ? (count / totalDuration) * 100 : 0
          const color = colors[index % colors.length]

          return (
            <div
              key={stage}
              style={{width: `${percent}%`, backgroundColor: color}}
              className='h-full'
            />
          )
        })}
      </div>
    )
  }

  const renderStageLegend = (breakdown: Record<string, number>) => {
    const colors = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444']

    return (
      <div className='flex flex-wrap gap-4 mt-2 text-xs text-gray-600'>
        {Object.entries(breakdown).map(([stage, count], index) => (
          <div key={stage} className='flex items-center gap-1'>
            <div
              className='w-2 h-2 rounded-full'
              style={{backgroundColor: colors[index % colors.length]}}
            />
            <span>
              {stage} <span className='font-medium text-black'>{count} months</span>
            </span>
          </div>
        ))}
      </div>
    )
  }

  const toggleAddAppointmentModal = (value: boolean) => {
    setIsAddAppointmentModalVisible(value)
  }

  if (editingAppointmentId) {
    return (
      <AddAppointment
        isInline={true}
        propAppointmentId={editingAppointmentId}
        onCancel={() => setEditingAppointmentId(null)}
        onSuccess={() => {
          setEditingAppointmentId(null)
          getTreatmentList()
        }}
      />
    )
  }

  const handleAddAppointmentNotesClick = () => {
    identifyUser()

    // Clear any existing appointment details before navigating to new form
    dispatchAction(setAppointmentDetails(null))

    // Prefer bracesJourneyId from URL; fall back to overview data

    bracesJourneyId

    if (!patientId || !bracesJourneyId) {
      // Optionally show a toast here, e.g. "Braces journey not found"
      return
    }

    // 🔥 Directly open Attach Braces Notes form (no appointment / success popups)
    navigate(`${profileBasePath}/${patientId}/bracesNotes/${bracesJourneyId}/attachNotes`)
  }
  return (
    <div className='flex flex-col gap-6'>
      {/* Treatment Progress (overall) */}
      <div className='bg-white p-6 rounded-xl border border-gray-200 shadow-sm'>
        <h3 className='text-lg font-semibold mb-6'>Treatment progress</h3>

        {/* Overall Progress */}
        <div className='mb-8'>
          <div className='flex justify-between text-sm mb-2'>
            <div>
              <span className='font-bold text-lg'>{completedTotalMonths}</span>
              <span className='text-gray-500'> / {totalDuration} months completed</span>
            </div>
            <span className='font-medium'>{Math.round(overallProgressPercentage)}%</span>
          </div>
          <Progress
            percent={overallProgressPercentage}
            showInfo={false}
            strokeColor='#10B981'
            trailColor='#E5E7EB'
          />
        </div>

        {/* Jaw-wise breakdown (still notes-based) */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          {/* Upper Jaw */}
          <div className=' p-4 rounded-lg border border-pink-100'>
            <div className='flex justify-between text-sm mb-2'>
              <span className='font-medium'>Upper Jaw</span>
              <span className='text-gray-500'>{Math.round(jawProgressPercentage)}%</span>
            </div>
            <div className='mb-1'>
              <span className='font-bold'>{completedMonthsFromNotes}</span>
              <span className='text-gray-500'> / {totalDuration} months completed</span>
            </div>
            {renderProgressBar(upperJawBreakdown)}
            {renderStageLegend(upperJawBreakdown)}
          </div>

          {/* Lower Jaw */}
          <div className=' p-4 rounded-lg border border-pink-100'>
            <div className='flex justify-between text-sm mb-2'>
              <span className='font-medium'>Lower Jaw</span>
              <span className='text-gray-500'>{Math.round(jawProgressPercentage)}%</span>
            </div>
            <div className='mb-1'>
              <span className='font-bold'>{completedMonthsFromNotes}</span>
              <span className='text-gray-500'> / {totalDuration} months completed</span>
            </div>
            {renderProgressBar(lowerJawBreakdown)}
            {renderStageLegend(lowerJawBreakdown)}
          </div>
        </div>
      </div>

      {/* Appointments Table */}
      <div className='bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden p-4'>
        <div className='flex justify-between items-center mb-4'>
          <h3 className='text-lg font-semibold'>Appointment notes</h3>
          <button
            className='rounded-lg px-3 py-1 border border-secondaryColor bg-secondarySupport text-secondaryColor font-semibold flex items-center gap-3 justify-center'
            onClick={() => {
              handleAddAppointmentNotesClick()
              identifyUser()
            }}
          >
            <PlusIcon color={getColorPalette().secondaryColor} />
            Add appointment
          </button>
        </div>
        <TableContainerForBracesNotes setEditingAppointmentId={setEditingAppointmentId} />
      </div>

      <AppointmentCreatedSuccessfully
        {...{
          visible: appointmentCreatedSuccessfullyVisible,
          setQuitModalVisible: setAppointmentCreatedSuccessfullyVisible,
          bracesJourneyId: appointmentSuccessResponse?.braces_journey_id,
          isAlignerOrLeadPatient: false,
          onViewAppointmentClick: () => {
            if (appointmentSuccessResponse) {
              navigate('/calendar', {
                state: {
                  reminderId: appointmentSuccessResponse?.reminder_id,
                  eventDate: appointmentSuccessResponse?.start_date,
                },
              })
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
                  `${profileBasePath}/${patient_id}/bracesNotes/${braces_journey_id}/attachNotes?${queryParams}`
                )
              }
            }
          },
        }}
      />
      <AddAppointmentModal
        {...{
          isModalVisible: isAddAppointmentModalVisible,
          toggleModal: toggleAddAppointmentModal,
          setAppointmentCreatedSuccessfullyVisible,
          isOnAppointmentsPage: true,
          setAppointmentSuccessResponse,
          practiceLocationId: practiceLocationId,
        }}
      />
    </div>
  )
}

export default BracesTracking
