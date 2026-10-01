import bracesTreatmentStages from '@constants/bracesTreatmentStages'
import useDispatchAction from '@hooks/useDispatchAction'
import CalendarIcon from 'assets/icons/CalendarIcon'
import Page from 'components/page/Page'
import {AuthContext} from 'context/AuthContext'
import {useContext, useEffect, useState} from 'react'
import {useSelector} from 'react-redux'
import {useNavigate, useParams} from 'react-router-dom'
import {
  getBracesTreatmentPlanList,
  setTreatmentPlanBraces,
} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileTreatmentPlan.slice'
import {RootState} from 'redux/store'
import {IBracesTreatmentPlanDetails} from '../treatment/types/treatmentPlan.types'
import When from 'components/when/When'
import hasValue from 'utils/hasValue'
import JawDetails from './components/JawDetails'
import jawType from '@constants/jawType'
import {
  getBracesNotesDetails,
  getBracesNotesList,
  setAppointmentDetails,
  setAppointmentList,
} from 'redux/Slices/AppSlice/BracesNotes/BracesNotes.slice'
import {getImageUrl, safeParseInt} from 'utils/ConstFunctions'
import TreatmentEmptyState from 'screens/Patients/NewPatientProfile/components/EmptyState'
import UpcomingAppointmentCard from './components/UpcomingAppointmentCard'
import dayjs from 'dayjs'
import AttachmentIcon from 'assets/icons/AttachmentIcon'
import getColorPalette from 'utils/getColorPalette'
import PlusIcon from 'assets/icons/PlusIcon'
import CommonSVG from 'components/atom/SVG/CommonSVG'
import {SVG_EXPAND_RIGHT} from 'utils/SvgConstants'
import BorderedCard from 'components/BorderedCard/BorderedCard'
import treatmentPlanStatusConstants from '@constants/treatmentPlanStatus.constants'
import {Image} from 'assets/images/Images/Image'
import ImageViewer from 'screens/Patients/PatientProfile/Tabs/ImageViewer'

const getBracesTreatmentPlanDetail = (
  bracesTreatmentPlanList: IBracesTreatmentPlanDetails[]
): IBracesTreatmentPlanDetails => {
  return bracesTreatmentPlanList.length > 0
    ? bracesTreatmentPlanList[0]
    : ({} as IBracesTreatmentPlanDetails)
}

const OverviewBraces = () => {
  const {userId} = useContext(AuthContext)
  const navigate = useNavigate()
  const {patientId, bracesJourneyId} = useParams()
  const {dispatchAction} = useDispatchAction()
  const palette = getColorPalette()
  const {dataLeadsOverview} = useSelector((state: RootState) => state.leadsProfile)

  const {bracesTreatmentPlanList, getBracesTreatmentPlanListLoading} = useSelector(
    (state: RootState) => state.leadsProfileTreatmentPlanReducer
  )
  const {bracesAppointmentDetails} = useSelector((state: RootState) => state.bracesNotes)
  const [isShowPhotos, setIsShowPhotos] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const bracesTreatmentPlanDetail = getBracesTreatmentPlanDetail(bracesTreatmentPlanList)

  useEffect(() => {
    dispatchAction(setTreatmentPlanBraces({}))
    dispatchAction(setAppointmentList([]))

    dispatchAction(
      getBracesTreatmentPlanList({
        doctor_id: String(userId),
        patient_id: String(patientId),
        braces_treatment_stage: bracesTreatmentStages.ACTIVE,
      })
    )
      .unwrap()
      .then((res: any) => {
        const plan = res?.[0]
        const appointmentId =
          plan?.last_appointment_details?.reminder_details?.appointment_id?.toString() ?? ''

        // ✅ If there is no previous appointment, just skip loading details
        if (!appointmentId) return

        dispatchAction(
          getBracesNotesDetails({
            appointment_id: appointmentId,
          })
        )
      })
      .catch((err: string) => {
        console.error('Error loading braces list:', err)
      })

    dispatchAction(
      getBracesNotesList({
        doctor_id: safeParseInt(userId),
        patient_id: safeParseInt(patientId),
      })
    )
  }, []) // (intentional) run once on mount

  const formattedStartDate = bracesTreatmentPlanDetail?.previous_appointment_date
    ? dayjs(bracesTreatmentPlanDetail.previous_appointment_date).format('DD MMMM YYYY')
    : null

  // 🔍 Check if there is any upcoming appointment in the future
  const hasUpcomingAppointment = (() => {
    const upcoming = (bracesTreatmentPlanDetail as any)?.upcoming_appointment_details
    if (!upcoming) return false

    const rawDate = upcoming.start_date || upcoming.appointment_date || upcoming.date
    if (!rawDate) return false

    return dayjs(rawDate).isAfter(dayjs())
  })()

  const handleAddAppointmentNotesClick = () => {
    dispatchAction(setAppointmentDetails(null))

    const effectiveBracesJourneyId =
      bracesJourneyId || dataLeadsOverview?.braces_journey_tracking_response?.braces_journey_id

    if (!patientId || !effectiveBracesJourneyId) {
      return
    }

    navigate(`/profile/${patientId}/bracesNotes/${effectiveBracesJourneyId}/attachNotes`)
  }

  const handleAddAppointmentNotesClickView = () => {
    const effectiveBracesJourneyId =
      bracesJourneyId || dataLeadsOverview?.braces_journey_tracking_response?.braces_journey_id

    if (!patientId || !effectiveBracesJourneyId) {
      return
    }

    navigate(`/profile/${patientId}/bracesNotes/${effectiveBracesJourneyId}/`)
  }

  const hasLastAppointment = Boolean(bracesTreatmentPlanDetail?.last_appointment_details)

  const hasAppointmentJaws =
    Array.isArray(bracesAppointmentDetails?.jaws) &&
    (bracesAppointmentDetails?.jaws?.length ?? 0) > 0

  return (
    <Page title='' loading={getBracesTreatmentPlanListLoading}>
      <div className='flex flex-col gap-4'>
        {/* Header + CTAs */}
        <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-3'>
          <div className='text-xl md:text-2xl font-semibold'>Overview</div>
          <div className='flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto'>
            <button
              className='rounded-lg px-3 py-2 border border-primaryColor bg-primarySupport text-primaryColor font-semibold flex items-center gap-3 justify-center w-full sm:w-auto'
              onClick={handleAddAppointmentNotesClick}
            >
              <PlusIcon color={palette.primaryColor} />
              Add appointment Notes
            </button>
            <button
              className='rounded-lg px-3 py-2 border border-gray-300 bg-white text-textColor font-medium flex items-center gap-3 justify-center w-full sm:w-auto'
              onClick={handleAddAppointmentNotesClickView}
            >
              View all
              <CommonSVG svg={SVG_EXPAND_RIGHT} height='14' width='14' />
            </button>
          </div>
        </div>
        <When isTrue={isShowPhotos}>
          <ImageViewer
            setIsShowPhotos={setIsShowPhotos}
            selectedImagesList={bracesAppointmentDetails?.files?.map((file, index) => ({
              id: index,
              src:
                typeof file === 'object' && file instanceof File
                  ? URL.createObjectURL(file)
                  : getImageUrl(file) || (file as {preview?: string})?.preview || '',
              width: '100%',
              height: '100%',
            }))}
            selectedIndex={selectedIndex}
          />
        </When>
        {/* Upcoming appointment card */}
        <When isTrue={hasUpcomingAppointment}>
          <UpcomingAppointmentCard bracesTreatmentPlanDetail={bracesTreatmentPlanDetail} />
        </When>

        {/* 🔹 Last appointment details (only if there *is* a last appointment) */}
        <When isTrue={hasLastAppointment}>
          <div className='w-full flex flex-col'>
            <div className='text-stone-500 text-sm font-medium leading-tight tracking-tight mb-2 mt-2'>
              Last appointment details
            </div>

            <div className='rounded-lg border border-zinc-300 p-4'>
              {/* Date row */}
              <div className='flex gap-3 items-center flex-wrap'>
                <div className='w-12 h-12 pt-1 pl-2 bg-secondarySupport rounded justify-center items-center gap-2.5 inline-flex shrink-0'>
                  <CalendarIcon height='24' width='24' color={palette.secondaryColor} />
                </div>
                <div className='flex flex-col text-sm'>
                  <p className='text-textColor font-medium'>Appointment date</p>
                  <p className='font-semibold'>
                    {hasValue(formattedStartDate) ? `${formattedStartDate} ` : ''}
                  </p>
                </div>
              </div>

              <div className='w-full border border-zinc-200 my-3' />

              {/* Notes (jaws) */}
              <When isTrue={hasAppointmentJaws}>
                {/* Both jaw single card */}
                <When isTrue={bracesAppointmentDetails?.jaws?.[0]?.jaw_type === jawType.BOTH}>
                  <div className='flex flex-col md:flex-row gap-4'>
                    <div className='md:w-[52%] w-full'>
                      <JawDetails
                        jawType='Both'
                        bracesTreatmentPlanDetail={bracesAppointmentDetails?.jaws?.[0]}
                      />
                    </div>
                  </div>
                </When>

                {/* Separate upper + lower cards */}
                <When isTrue={bracesAppointmentDetails?.jaws?.[0]?.jaw_type === jawType.UPPER}>
                  <div className='flex flex-col md:flex-row gap-4'>
                    <JawDetails
                      jawType='Upper'
                      bracesTreatmentPlanDetail={bracesAppointmentDetails?.jaws?.[0]}
                    />
                    <JawDetails
                      jawType='Lower'
                      bracesTreatmentPlanDetail={bracesAppointmentDetails?.jaws?.[1]}
                    />
                  </div>
                </When>
              </When>

              {/* No notes state (covers case where getBracesNotesDetails was never called) */}
              <When isTrue={!hasAppointmentJaws}>
                <div className='flex flex-col text-textColor justify-center items-center text-base gap-2 py-6'>
                  <div className='p-3 rounded-full w-fit h-fit bg-lighterGray'>
                    <AttachmentIcon color={'#666666'} />
                  </div>
                  <p>No notes added</p>
                </div>
              </When>
            </div>
          </div>

          {/* Photos */}
          <div className='my-4'>
            <BorderedCard
              header={{
                title: 'Photos',
              }}
            >
              <When
                isTrue={
                  hasValue(bracesAppointmentDetails) &&
                  bracesAppointmentDetails?.status === treatmentPlanStatusConstants.ACTIVE
                }
              >
                <When isTrue={(bracesAppointmentDetails?.files?.length ?? 0) > 0}>
                  <div className='flex flex-wrap gap-2'>
                    {bracesAppointmentDetails?.files?.map((file: any, index) => (
                      <div key={index} className='w-[22%] sm:w-[18%] md:w-[7%] gap-2'>
                        <Image
                          src={getImageUrl(file)}
                          alt='Uploaded file '
                          className='w-12 h-12 rounded-[4px] border border-lightGray object-cover cursor-pointer mt-2'
                          size={20}
                          onClick={() => {
                            setIsShowPhotos(true)
                            setSelectedIndex(index)
                          }}
                          fileName=''
                          showFileName={false}
                          showLoading={true}
                        />
                      </div>
                    ))}
                  </div>
                </When>

                <When isTrue={(bracesAppointmentDetails?.files?.length ?? 0) === 0}>
                  <div className='w-64 text-stone-500 text-base font-medium leading-normal'>
                    Not Added
                  </div>
                </When>
              </When>

              {/* If there was no notes-details API call at all */}
              <When
                isTrue={
                  !hasValue(bracesAppointmentDetails) ||
                  bracesAppointmentDetails?.status !== treatmentPlanStatusConstants.ACTIVE
                }
              >
                <div className='w-64 text-stone-500 text-base font-medium leading-normal'>
                  Not Added
                </div>
              </When>
            </BorderedCard>
          </div>
        </When>

        {/* No braces treatment at all */}
        <When isTrue={!hasValue(bracesTreatmentPlanDetail)}>
          <TreatmentEmptyState
            title=''
            text='No actions available!'
            showBorder={true}
            className='col-span-2'
          />
        </When>
      </div>
    </Page>
  )
}

export default OverviewBraces
