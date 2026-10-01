import {PatientRowDetails} from '../types/patientsList.types'
import When from 'components/when/When'
import useDispatchAction from '@hooks/useDispatchAction'
import {setTreatmentPlan} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileTreatmentPlan.slice'
import {useNavigate} from 'react-router-dom'
import DropDownOutline from 'assets/icons/DropDownOutline'
import getColorPalette from 'utils/getColorPalette'
import useAllUserPlan from '@hooks/useAllUserPlan'
import useProfileBasePath from '@hooks/useProfileBasePath'

const GetPatientTreatmentStage = (patientData: PatientRowDetails, isArchived: boolean) => {
  const {dispatchAction} = useDispatchAction()
  const navigation = useNavigate()
  const {isOrganization, isPractice, isAlignerCompanyOrg} = useAllUserPlan()
  const profileBasePath = useProfileBasePath()

  // Check if treatment is BRACES - if so, don't show CTAs
  const isBracesTreatment =
    patientData.treatment_type === 'BRACES' || patientData.treatments?.includes('BRACES')

  const isAssessButtonBasedOnRole = (patient_belongs_to: string) => {
    const access =
      (patient_belongs_to === 'ORG_PATIENT' && isOrganization) ||
      (patient_belongs_to === 'ASSIGNED_TO_PRACTICE' && !isOrganization) ||
      (patient_belongs_to === 'ORTHODONTIC_PATIENT' && !isOrganization)

    return access
  }
  const now = new Date()

  const raw = patientData?.treatment_start_date // string | undefined | null
  const date: Date | null = raw ? new Date(raw) : null

  const isFutureDate =
    date instanceof Date && !isNaN(date.getTime()) && date.getTime() > now.getTime()

  return (
    <div>
      <When isTrue={!isArchived}>
        <When isTrue={patientData.treatment_stage === 'ASSESSMENT'}>
          <div className='text-sm font-medium text-black'>In Assessment</div>
        </When>
        <When isTrue={patientData?.treatment_stage === 'ONGOING'}>
          <div className='text-sm font-medium text-black'>Ongoing</div>
        </When>
        <When isTrue={patientData?.treatment_stage === 'IN_PLANNING'}>
          <div className='flex md:flex-col flex-row items-center md:gap-0 gap-2'>
            <div className='text-sm font-medium text-black'>In Planning</div>
            <When isTrue={!isBracesTreatment}>
              <button
                className='flex gap-1 items-center text-primaryColor font-semibold text-sm'
                onClick={(e) => {
                  e.stopPropagation()
                  navigation(`/profile/${patientData?.patient_id}/plans-list`)
                }}
              >
                <div>Set up</div>
                <div className='-rotate-90'>
                  <DropDownOutline color={getColorPalette().primaryColor} />
                </div>
              </button>
            </When>
          </div>
        </When>
        <When isTrue={patientData.treatment_stage === 'ADD_TRACKING'}>
          <div className='flex md:flex-col flex-row items-center md:gap-0 gap-2'>
            <div className='text-sm font-medium text-black'>Tracking Pending</div>
            <When
              isTrue={
                !isBracesTreatment &&
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
                    navigation(`${profileBasePath}/${patientData.patient_id}`)
                  } else {
                    navigation(`${profileBasePath}/${patientData.patient_id}/aligner-tracking`)
                  }
                }}
              >
                <div>Add tracking</div>
                <div className='-rotate-90'>
                  <DropDownOutline color={getColorPalette().primaryColor} />
                </div>
              </button>
            </When>
          </div>
        </When>
        <When isTrue={patientData.treatment_stage === 'STARTING_SOON'}>
          <div className='flex md:flex-col flex-row items-start md:items-start md:gap-0 gap-2'>
            <div className='text-sm font-medium text-black'>Starting Soon</div>
            <When
              isTrue={
                !isBracesTreatment && isAssessButtonBasedOnRole(patientData?.patient_belongs_to)
              }
            >
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
                <div className='-rotate-90'>
                  <DropDownOutline color={getColorPalette().primaryColor} />
                </div>
              </button>
            </When>
          </div>
        </When>
        <When isTrue={patientData?.treatment_stage === 'REFINEMENT'}>
          <div className='flex md:flex-col flex-row items-start md:items-start md:gap-0 gap-2'>
            <div className='text-sm font-medium text-black'>In Refinement</div>
            <When
              isTrue={
                !isBracesTreatment && isAssessButtonBasedOnRole(patientData?.patient_belongs_to)
              }
            >
              <button
                className='flex gap-1 items-center text-primaryColor font-semibold  text-sm'
                onClick={(e) => {
                  e.stopPropagation()
                  dispatchAction(setTreatmentPlan({}))
                  navigation(`${profileBasePath}/${patientData?.patient_id}/plans-list`)
                }}
              >
                <div>Set-up</div>
                <div className='-rotate-90'>
                  <DropDownOutline color={getColorPalette().primaryColor} />
                </div>
              </button>
            </When>
          </div>
        </When>
        <When isTrue={patientData?.treatment_stage === 'PAUSED'}>
          <div className='flex md:flex-col flex-row items-center md:gap-0 gap-2'>
            <div className='text-sm font-medium text-black'>Paused</div>
            <When
              isTrue={
                !isBracesTreatment && isAssessButtonBasedOnRole(patientData?.patient_belongs_to)
              }
            >
              <button
                className='flex gap-1 items-center text-primaryColor font-semibold text-sm'
                onClick={(e) => {
                  e.stopPropagation()
                  patientData?.aligner_journey_id &&
                    navigation(`${profileBasePath}/${patientData?.patient_id}/aligner-tracking`)
                }}
              >
                <div>Resume</div>
                <div className='-rotate-90'>
                  <DropDownOutline color={getColorPalette().primaryColor} />
                </div>
              </button>
            </When>
          </div>
        </When>
        <When isTrue={patientData?.treatment_stage === 'MANUFACTURING'}>
          <div className='text-sm font-medium text-black'>In Manufacturing</div>
        </When>
        <When isTrue={patientData?.treatment_stage === 'COMPLETE'}>
          <div className='text-sm font-medium text-black'>Completed</div>
        </When>
        <When isTrue={patientData?.treatment_stage === 'IN_TRANSIT'}>
          <div className='text-sm font-medium text-black'>Transit</div>
        </When>
      </When>
      <When isTrue={isArchived}>
        <div className='text-sm font-medium text-black'>Archived</div>
      </When>
    </div>
  )
}

export default GetPatientTreatmentStage
