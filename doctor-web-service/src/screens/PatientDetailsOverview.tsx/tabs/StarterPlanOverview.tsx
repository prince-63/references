import {useContext, useEffect, useState} from 'react'
import TreatmentProgress from '../../Patients/NewPatientProfile/components/TreatmentProgress'
import Page from 'components/page/Page'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import {postApiDataTreatmentPlan} from 'redux/Slices/AppSlice/PatientProfile/TreatmentPlan/TreatmentPlan'
import useDispatchAction from '@hooks/useDispatchAction'
import When from 'components/when/When'
import treatmentPlanStatusConstants from '@constants/treatmentPlanStatus.constants'
import jawType from '@constants/jawType'
import {useNavigate, useParams, useSearchParams} from 'react-router-dom'
import {AuthContext} from 'context/AuthContext'
import {safeParseInt} from 'utils/ConstFunctions'
import productTypes from '@constants/productTypes'
import dayjs from 'dayjs'
import patientOverviewAlignerActionFilterConstants from '@constants/patientOverviewAlignerActionFilterConstants.constants'
import {
  getPatientTimeline,
  setSelectedFilter,
} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfile.slice'
import BorderedCardForDashBoardCards from 'screens/Dashboard/components/BorderedCard'
import CaretRightIcon from 'assets/icons/CaretRightIcon'
import {getDueMessageText} from 'utils/getDueMessageText'
import GetCompilance from 'screens/AlignerPatientAnalytics/components/GetCompilance'
import cn from '@utils/cn'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import hasValue from 'utils/hasValue'
import useProfileBasePath from '@hooks/useProfileBasePath'

dayjs.extend(isSameOrAfter)
export const jawTypeMap = {
  [jawType.BOTH]: 'Both',
  [jawType.LOWER]: 'Lower',
  [jawType.UPPER]: 'Upper',
}

type FilterOption = {
  key: keyof typeof patientOverviewAlignerActionFilterConstants
  label: string
}

const FILTER_OPTIONS: FilterOption[] = [
  {
    key: patientOverviewAlignerActionFilterConstants.ALL_ALIGNERS,
    label: 'All Aligners',
  },
  {
    key: patientOverviewAlignerActionFilterConstants.CURRENT_ALIGNER,
    label: 'Current Aligner',
  },
  {
    key: patientOverviewAlignerActionFilterConstants.PENDING_UPDATES,
    label: 'Pending Updates',
  },
  {
    key: patientOverviewAlignerActionFilterConstants.ISSUES_REPORTED,
    label: 'Issues Reported',
  },
  {
    key: patientOverviewAlignerActionFilterConstants.ALIGNER_CHECKINS,
    label: 'Aligner Check-ins',
  },
  {
    key: patientOverviewAlignerActionFilterConstants.ALIGNER_CHANGES,
    label: 'Aligner Changes',
  },
]

const StarterPlanOverview = ({
  alignerJourneyId,
  treatmentStatus,
}: {
  alignerJourneyId?: number | null
  treatmentStatus: keyof typeof treatmentPlanStatusConstants | null
}) => {
  const {dispatchAction} = useDispatchAction()
  const {userId} = useContext(AuthContext)
  const [searchParams] = useSearchParams()
  const {patientId} = useParams<{patientId: string}>()
  const patientTimelineFilter = searchParams.get('patient_timeline_filter')
  useEffect(() => {
    const filterParam = searchParams.get('patient_timeline_filter')

    const initialFilter =
      FILTER_OPTIONS.find((option) => option.key === filterParam) ?? FILTER_OPTIONS[1]

    dispatchAction(setSelectedFilter(initialFilter))
  }, [patientTimelineFilter])

  useEffect(() => {
    const parsedPatientId = safeParseInt(patientId)
    if (!parsedPatientId) return

    const postData: any = {
      data: {
        patient_id: parsedPatientId,
        alignerJourneyId: alignerJourneyId,
      },
    }
    dispatchAction(postApiDataTreatmentPlan(postData))
  }, [dispatchAction, patientId, alignerJourneyId])

  const selectedFilter = useSelector((state: RootState) => state.leadsProfile.selectedFilter)

  const handleFilterChanges = (
    filter: keyof typeof patientOverviewAlignerActionFilterConstants
  ) => {
    const filterOption = FILTER_OPTIONS.find((opt) => opt.key === filter)!

    dispatchAction(setSelectedFilter(filterOption))
    dispatchAction(
      getPatientTimeline({
        doctor_id: safeParseInt(userId),
        patient_id: safeParseInt(patientId),
        filter,
      })
    )

    navigate(`${profileBasePath}/${patientId}/aligner-tracking`, {
      state: {selectedFilterKey: filter}, // optional, but useful
    })
  }
  const {loading: loadingTreatmentPlan, data: dataTreatmentPlan}: any = useSelector(
    (state: RootState) => state.apiTreatmentPlan
  )
  const {patientTimeline, dataLeadsOverview} = useSelector((state: RootState) => state.leadsProfile)
  const navigate = useNavigate()
  const profileBasePath = useProfileBasePath()
  // const is_your_patient = patientData?.assigned_practice?.practice_doctor_id == userId
  const [, setForceAlignerDisabled] = useState(false)

  useEffect(() => {
    const parsedDoctorId = safeParseInt(userId)
    const parsedPatientId = safeParseInt(patientId)
    if (!parsedDoctorId || !parsedPatientId) return

    dispatchAction(
      getPatientTimeline({
        doctor_id: parsedDoctorId,
        patient_id: parsedPatientId,
        filter: selectedFilter.key,
      })
    )
  }, [dispatchAction, selectedFilter, userId, patientId])

  // const {isVisible} = useFeatureAccess(controlledFeaturesConstants.EXTEND_WEAR_DAYS)

  const overdue = patientTimeline?.patient_profile_overview_response?.over_due ?? 0
  const isManualTracking = dataLeadsOverview?.tracking?.type === 'MANUAL'
  const pendingActionsCount =
    patientTimeline?.patient_profile_overview_response?.pending_actions_count

  const patientTimeLineClassName = 'w-full flex flex-col gap-4'

  useEffect(() => {
    if (loadingTreatmentPlan) return
    if (!hasValue(dataTreatmentPlan?.aligner_journeys?.[0])) {
      setForceAlignerDisabled(false)
      return
    }

    const alignerJourneyData: any = dataTreatmentPlan?.aligner_journeys?.[0]
    const currentAligner =
      alignerJourneyData?.aligners?.find(
        (aligner: any) => aligner?.sr_no === alignerJourneyData?.current_aligner_no
      ) ?? null

    if (!currentAligner) {
      setForceAlignerDisabled(false)
      return
    }

    const isCurrentAlignerStartToday = currentAligner?.start_date
      ? dayjs(currentAligner.start_date).isSame(dayjs(), 'day')
      : false
    setForceAlignerDisabled(isCurrentAlignerStartToday)
  }, [dataTreatmentPlan, loadingTreatmentPlan])

  return (
    <Page title={''} loading={loadingTreatmentPlan}>
      <div className='w-full'>
        <div className={patientTimeLineClassName}>
          <div className='flex flex-col md:flex-row gap-2'>
            <div className='md:w-5/6 w-full'>
              <TreatmentProgress
                productType={productTypes.ALIGNERS}
                status={treatmentStatus}
                currentAligner={
                  patientTimeline?.patient_profile_overview_response?.current_aligner ?? 0
                }
                totalAligners={
                  patientTimeline?.patient_profile_overview_response?.total_aligner ?? 0
                }
              />
            </div>
            <div className='flex w-full gap-2'>
              <BorderedCardForDashBoardCards className='w-full h-auto'>
                <div className='flex flex-col gap-1'>
                  <GetCompilance
                    app_invite_status={
                      overdue < -7 ? 'NEED_ATTENTION' : overdue < 0 ? 'AT_RISK' : 'ON_TRACK'
                    }
                  />

                  <div className={cn('text-base text-black')}>
                    {getDueMessageText({
                      offSetDays: overdue,
                    })}
                  </div>
                </div>
              </BorderedCardForDashBoardCards>
              <BorderedCardForDashBoardCards className='w-full h-auto'>
                <div className='flex flex-col gap-1'>
                  <div className='text-sm text-textColor font-medium'>Aligner updates</div>
                  <div className='text-base text-black'>{pendingActionsCount} pending review</div>
                  <When
                    isTrue={
                      !isManualTracking &&
                      pendingActionsCount != undefined &&
                      pendingActionsCount > 0
                    }
                  >
                    <button
                      type='button'
                      className='text-primaryColor text-sm font-medium mt-1 flex items-center gap-1 hover:underline'
                      onClick={() => {
                        handleFilterChanges('PENDING_UPDATES')
                      }}
                    >
                      View all pending updates <CaretRightIcon color='#735BF2' />
                    </button>
                  </When>
                </div>
              </BorderedCardForDashBoardCards>
            </div>
          </div>
        </div>
      </div>
    </Page>
  )
}

export default StarterPlanOverview
