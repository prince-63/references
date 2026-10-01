import {PatientRowDetails} from '../types/patientsList.types'
import When from 'components/when/When'
import useDispatchAction from '@hooks/useDispatchAction'
import {setTreatmentPlan} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileTreatmentPlan.slice'
import {useNavigate} from 'react-router-dom'
import DropDownOutline from 'assets/icons/DropDownOutline'
import getColorPalette from 'utils/getColorPalette'
import useAllUserPlan from '@hooks/useAllUserPlan'
import useProfileBasePath from '@hooks/useProfileBasePath'

const GetPatientTreatmentStageRevamp = (
  patientData: PatientRowDetails,
  isArchived: boolean,
  showOnlyCTA = true
) => {
  const {dispatchAction} = useDispatchAction()
  const navigation = useNavigate()
  const {isOrganization, isPractice, isAlignerCompanyOrg} = useAllUserPlan()
  const profileBasePath = useProfileBasePath()

  const isAssessButtonBasedOnRole = (patient_belongs_to: string) => {
    const access =
      (patient_belongs_to === 'ORG_PATIENT' && isOrganization) ||
      (patient_belongs_to === 'ASSIGNED_TO_PRACTICE' && !isOrganization) ||
      (patient_belongs_to === 'ORTHODONTIC_PATIENT' && !isOrganization)

    return access
  }
  const now = new Date()
  const raw = patientData?.treatment_start_date
  const date: Date | null = raw ? new Date(raw) : null
  const isFutureDate =
    date instanceof Date && !isNaN(date.getTime()) && date.getTime() > now.getTime()

  // Small helper to render the angle icon
  const AngleIcon = () => (
    <div className='-rotate-90'>
      <DropDownOutline color={getColorPalette().primaryColor} />
    </div>
  )

  if (isArchived) {
    return <div className='text-sm font-medium text-black'>Archived</div>
  }

  return (
    <div>
      {/* ASSESSMENT – only label, no CTA */}
      <When isTrue={patientData.treatment_stage === 'ASSESSMENT'}>
        {!showOnlyCTA && <div className='text-sm font-medium text-black'>In Assessment</div>}
      </When>

      {/* ONGOING – only label, no CTA */}
      <When isTrue={patientData?.treatment_stage === 'ONGOING'}>
        {!showOnlyCTA && <div className='text-sm font-medium text-black'>Ongoing</div>}
      </When>

      {/* IN_PLANNING – label + CTA, or CTA only */}
      <When isTrue={patientData?.treatment_stage === 'IN_PLANNING'}>
        {showOnlyCTA ? (
          <button
            className='flex gap-1 items-center text-primaryColor font-semibold text-sm'
            onClick={(e) => {
              e.stopPropagation()
              navigation(
                `/add-patient-starter?patient_id=${patientData?.patient_id}&step=${patientData?.current_step - 2}`
              )
            }}
          >
            <div>Complete Set up</div>
            <AngleIcon />
          </button>
        ) : (
          <div className='flex md:flex-col flex-row items-center md:gap-0 gap-2'>
            <div className='text-sm font-medium text-black'>In Planning</div>
            <button
              className='flex gap-1 items-center text-primaryColor font-semibold text-sm'
              onClick={(e) => {
                e.stopPropagation()
                navigation(
                  `/add-patient-starter?patient_id=${patientData?.patient_id}&step=${patientData?.current_step - 2}`
                )
              }}
            >
              <div>Complete set up</div>
              <AngleIcon />
            </button>
          </div>
        )}
      </When>

      {/* ADD_TRACKING – label + CTA, or CTA only */}
      <When isTrue={patientData.treatment_stage === 'ADD_TRACKING'}>
        {showOnlyCTA ? (
          <When
            isTrue={
              isAssessButtonBasedOnRole(patientData.patient_belongs_to) &&
              !isPractice &&
              !isAlignerCompanyOrg
            }
          >
            <button
              className='flex gap-1 items-center text-primaryColor font-semibold text-sm'
              onClick={(e) => {
                e.stopPropagation()
                if (patientData?.treatment_type === 'BRACES') {
                  navigation(`/leads-profile/${patientData.patient_id}`)
                } else {
                  navigation(
                    `/add-patient-starter?patient_id=${patientData?.patient_id}&step=${patientData?.current_step - 2}`
                  )
                }
              }}
            >
              <div>Add tracking</div>
              <AngleIcon />
            </button>
          </When>
        ) : (
          <div className='flex md:flex-col flex-row items-center md:gap-0 gap-2'>
            <div className='text-sm font-medium text-black'>Tracking Pending</div>
            <When
              isTrue={
                isAssessButtonBasedOnRole(patientData.patient_belongs_to) &&
                !isPractice &&
                !isAlignerCompanyOrg
              }
            >
              <button
                className='flex gap-1 items-center text-primaryColor font-semibold text-sm'
                onClick={(e) => {
                  e.stopPropagation()
                  if (patientData?.treatment_type === 'BRACES') {
                    navigation(`/leads-profile/${patientData.patient_id}`)
                  } else {
                    navigation(
                      `/add-patient-starter?patient_id=${patientData?.patient_id}&step=${patientData?.current_step - 2}`
                    )
                  }
                }}
              >
                <div>Add tracking</div>
                <AngleIcon />
              </button>
            </When>
          </div>
        )}
      </When>

      {/* STARTING_SOON – label + CTA, or CTA only */}
      <When isTrue={patientData.treatment_stage === 'STARTING_SOON'}>
        {showOnlyCTA ? (
          <When isTrue={isAssessButtonBasedOnRole(patientData?.patient_belongs_to)}>
            <button
              className='flex gap-1 items-center text-primaryColor font-semibold text-sm'
              onClick={(e) => {
                e.stopPropagation()
                navigation(`${profileBasePath}/${patientData?.patient_id}/aligner-tracking`)
              }}
            >
              <div>
                {patientData?.is_tracking_added && isFutureDate
                  ? 'Update start date'
                  : 'Start treatment'}
              </div>
              <AngleIcon />
            </button>
          </When>
        ) : (
          <div className='flex md:flex-col flex-row items-start md:items-start md:gap-0 gap-2'>
            <div className='text-sm font-medium text-black'>Starting Soon</div>
            <When isTrue={isAssessButtonBasedOnRole(patientData?.patient_belongs_to)}>
              <button
                className='flex gap-1 items-center text-primaryColor font-semibold text-sm'
                onClick={(e) => {
                  e.stopPropagation()
                  navigation(`${profileBasePath}/${patientData?.patient_id}/aligner-tracking`)
                }}
              >
                <div>
                  {patientData?.is_tracking_added && isFutureDate
                    ? 'Update start date'
                    : 'Start treatment'}
                </div>
                <AngleIcon />
              </button>
            </When>
          </div>
        )}
      </When>

      {/* REFINEMENT – label + CTA, or CTA only */}
      <When isTrue={patientData?.treatment_stage === 'REFINEMENT'}>
        {showOnlyCTA ? (
          <When isTrue={isAssessButtonBasedOnRole(patientData?.patient_belongs_to)}>
            <button
              className='flex gap-1 items-center text-primaryColor font-semibold text-sm'
              onClick={(e) => {
                e.stopPropagation()
                dispatchAction(setTreatmentPlan({}))
                navigation(
                  `/add-patient-starter?patient_id=${patientData?.patient_id}&step=${patientData?.current_step - 2}`
                )
              }}
            >
              <div>Complete set-up</div>
              <AngleIcon />
            </button>
          </When>
        ) : (
          <div className='flex md:flex-col flex-row items-start md:items-start md:gap-0 gap-2'>
            <div className='text-sm font-medium text-black'>In Refinement</div>
            <When isTrue={isAssessButtonBasedOnRole(patientData?.patient_belongs_to)}>
              <button
                className='flex gap-1 items-center text-primaryColor font-semibold  text-sm'
                onClick={(e) => {
                  e.stopPropagation()
                  dispatchAction(setTreatmentPlan({}))
                  navigation(
                    `/add-patient-starter?patient_id=${patientData?.patient_id}&step=${patientData?.current_step - 2}`
                  )
                }}
              >
                <div>Complete set-up</div>
                <AngleIcon />
              </button>
            </When>
          </div>
        )}
      </When>

      {/* PAUSED – label + CTA, or CTA only */}
      <When isTrue={patientData?.treatment_stage === 'PAUSED'}>
        {showOnlyCTA ? (
          <When isTrue={isAssessButtonBasedOnRole(patientData?.patient_belongs_to)}>
            <button
              className='flex gap-1 items-center text-primaryColor font-semibold text-sm'
              onClick={(e) => {
                e.stopPropagation()
                patientData?.aligner_journey_id &&
                  navigation(`${profileBasePath}/${patientData?.patient_id}/aligner-tracking`)
              }}
            >
              <div>Resume</div>
              <AngleIcon />
            </button>
          </When>
        ) : (
          <div className='flex md:flex-col flex-row items-center md:gap-0 gap-2'>
            <div className='text-sm font-medium text-black'>Paused</div>
            <When isTrue={isAssessButtonBasedOnRole(patientData?.patient_belongs_to)}>
              <button
                className='flex gap-1 items-center text-primaryColor font-semibold text-sm'
                onClick={(e) => {
                  e.stopPropagation()
                  patientData?.aligner_journey_id &&
                    navigation(`${profileBasePath}/${patientData?.patient_id}/aligner-tracking`)
                }}
              >
                <div>Resume</div>
                <AngleIcon />
              </button>
            </When>
          </div>
        )}
      </When>

      {/* MANUFACTURING / COMPLETE / IN_TRANSIT – only label */}
      <When isTrue={patientData?.treatment_stage === 'MANUFACTURING'}>
        {!showOnlyCTA && <div className='text-sm font-medium text-black'>In Manufacturing</div>}
      </When>
      <When isTrue={patientData?.treatment_stage === 'COMPLETE'}>
        {!showOnlyCTA && <div className='text-sm font-medium text-black'>Completed</div>}
      </When>
      <When isTrue={patientData?.treatment_stage === 'IN_TRANSIT'}>
        {!showOnlyCTA && <div className='text-sm font-medium text-black'>Transit</div>}
      </When>
    </div>
  )
}

export default GetPatientTreatmentStageRevamp
