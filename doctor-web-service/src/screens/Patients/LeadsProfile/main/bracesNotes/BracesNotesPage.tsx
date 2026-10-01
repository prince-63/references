import {useContext, useEffect, useState} from 'react'
import Page from 'components/page/Page'
import When from 'components/when/When'
import {identifyUser, safeParseInt} from 'utils/ConstFunctions'
import {useSelector} from 'react-redux'
import {AuthContext} from 'context/AuthContext'
import {useNavigate, useParams} from 'react-router-dom'
import {RootState} from 'redux/store'

import useDispatchAction from '@hooks/useDispatchAction'
import {
  getBracesNotesList,
  setAppointmentDetails,
} from 'redux/Slices/AppSlice/BracesNotes/BracesNotes.slice'
import TableContainerForBracesNotes from './components/TableContainerForBracesNotes'
import {BracesNotesCard} from '../appointments/components/BracesNotesCard'
import PlusIcon from 'assets/icons/PlusIcon'
import getColorPalette from 'utils/getColorPalette'

import AddAppointment from '../appointments/AddAppointment'

const BracesNotesPage = () => {
  const {dispatchAction} = useDispatchAction()
  const {userId} = useContext(AuthContext)
  const navigate = useNavigate()
  const {patientId, bracesJourneyId} = useParams()

  const {dataLeadsOverview} = useSelector((state: RootState) => state.leadsProfile)
  const {bracesNotesList, getBracesNotesListLoading} = useSelector(
    (state: RootState) => state.bracesNotes
  )

  const [isAppointmentDeleted, setIsAppointmentDeleted] = useState(false)
  const [editingAppointmentId, setEditingAppointmentId] = useState<string | null>(null)

  useEffect(() => {
    if (dataLeadsOverview?.braces_journey_tracking_response?.enabled) {
      getTreatmentList()
    }
  }, [bracesJourneyId, isAppointmentDeleted, dataLeadsOverview])

  const getTreatmentList = () => {
    setIsAppointmentDeleted(false)

    dispatchAction(
      getBracesNotesList({
        doctor_id: safeParseInt(userId),
        patient_id: safeParseInt(patientId),
      })
    )
  }

  // If editing an existing appointment, show the inline AddAppointment form
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
    const effectiveBracesJourneyId =
      bracesJourneyId || dataLeadsOverview?.braces_journey_tracking_response?.braces_journey_id

    if (!patientId || !effectiveBracesJourneyId) {
      // Optionally show a toast here, e.g. "Braces journey not found"
      return
    }

    // 🔥 Directly open Attach Braces Notes form (no appointment / success popups)
    navigate(`/profile/${patientId}/bracesNotes/${effectiveBracesJourneyId}/attachNotes`)
  }

  return (
    <Page
      title='Appointment notes'
      showBorder
      showBackButton={false}
      loading={getBracesNotesListLoading}
      extraHeader={
        <button
          className='rounded-lg px-3 py-1 border border-secondaryColor bg-secondarySupport text-secondaryColor font-semibold flex items-center gap-3 justify-center'
          onClick={handleAddAppointmentNotesClick}
        >
          <PlusIcon color={getColorPalette().secondaryColor} />
          Add appointment Notes
        </button>
      }
    >
      <div>
        <div className='hidden md:block mt-6'>
          <TableContainerForBracesNotes setEditingAppointmentId={setEditingAppointmentId} />
        </div>
        <div className='md:hidden'>
          <When isTrue={bracesNotesList?.length > 0}>
            {bracesNotesList.map((element: any, index: number) => (
              <BracesNotesCard
                key={index}
                item={element}
                setIsAppointmentDeleted={setIsAppointmentDeleted}
              />
            ))}
          </When>
        </div>
      </div>
    </Page>
  )
}

export default BracesNotesPage
