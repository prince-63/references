import BackGroundSVG from 'components/atom/SVG/BackGroundSVG'
import CommonSVG from 'components/atom/SVG/CommonSVG'
import ModalLayout from 'components/modal/ModalLayout'
import {SVG_CROSS, SVG_UPDATE} from 'utils/SvgConstants'
import ActionCard from './ActionCard'
import ActionListOptions from '@staticData/ActionListOptions'
import actionTypes from '@constants/actionTypes'
import {ActionItem} from 'screens/Patients/LeadsProfile/leadsProfile.types'
import {RootState} from 'redux/store'
import {useSelector} from 'react-redux'
import When from 'components/when/When'
import treatmentPlanStatusConstants from '@constants/treatmentPlanStatus.constants'
import Page from 'components/page/Page'
import hasValue from 'utils/hasValue'
import trackingTypes from '@constants/trackingTypes'
import {useNavigate, useParams} from 'react-router-dom'
import {useContext, useEffect, useState} from 'react'
import moment from 'moment'
import progressStatusConstants from '@constants/progressStatus.constants'
import creationStatusConstants from '@constants/creationStatus.constants'
import getPatientAssignedTo from '@utils/getPatientAssignedTo'
import {AuthContext} from 'context/AuthContext'
import {useFeatureAccess} from '@hooks/useFeatureAccess'
import useAllUserPlan from '@hooks/useAllUserPlan'

interface ActionListProps {
  setIsModalActionListOpen: (x: boolean) => void
  handleActionOnClick: (option: ActionItem) => void
}

const ModalActionList = ({setIsModalActionListOpen, handleActionOnClick}: ActionListProps) => {
  const {patientId, alignerJourneyId} = useParams()
  const {dataLeadsOverview} = useSelector((state: RootState) => state.leadsProfile)
  const {alignerUpdates} = useSelector((state: RootState) => state.alignerTracking)
  const navigate = useNavigate()
  const [forceAlignerDisabled, setForceAlignerDisabled] = useState(false)
  const {loading: loadingTreatmentPlan, data: dataTreatmentPlan}: any = useSelector(
    (state: RootState) => state.apiTreatmentPlan
  )
  const {profileId} = useContext(AuthContext)
  const {permissionChecks} = useFeatureAccess()
  const isAccessibleProduction = permissionChecks?.production?.addNotes?.isEditable ?? false

  useEffect(() => {
    if (!loadingTreatmentPlan && hasValue(dataTreatmentPlan?.aligner_journeys[0])) {
      const alignerJourneyData = dataTreatmentPlan?.aligner_journeys[0]
      alignerJourneyData?.aligners.forEach((aligner: any) => {
        if (aligner.sr_no === alignerJourneyData.current_aligner_no) {
          setForceAlignerDisabled(aligner?.start_date === moment().format('YYYY-MM-DD'))
        }
      })
    }
  }, [dataTreatmentPlan])
  const treatmentDetail = dataTreatmentPlan?.aligner_journeys[0]

  const [isResponsive, setIsResponsive] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      setIsResponsive(window.innerWidth <= 767)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  const {data} = useSelector((state: RootState) => state.apiGetLeadsProfileDetails)
  const patientData = data.patient_details
  const patientAssignedTo = getPatientAssignedTo(profileId, patientData)
  const {userId} = useContext(AuthContext)
  const {isOrganization, isPractice, isStarterPlanUser} = useAllUserPlan()
  const is_your_patient = patientData?.assigned_practice?.practice_doctor_id == userId

  const isAccessibleActionButton =
    (isOrganization && is_your_patient) || isStarterPlanUser || isPractice

  return (
    <ModalLayout
      isResponsive={isResponsive}
      className='w-[45rem] md:max-h-full max-h-[95vh] overflow-y-auto'
    >
      <div className='flex justify-between items-center mx-4 mt-2'>
        <BackGroundSVG
          svg={SVG_UPDATE}
          width='26'
          height='26'
          className='w-16 h-16 bg-primarySupport rounded-full'
        />
        <div
          className='cursor-pointer'
          onClick={() => {
            setIsModalActionListOpen(false)
          }}
        >
          <CommonSVG svg={SVG_CROSS} width='47' height='47' />
        </div>
      </div>
      <Page title=''>
        <div className='mx-4'>
          <div className='text-[24px] font-semibold mt-4'>Action list</div>
          <div className='text-[16px] font-normal text-textColor'>
            Click on any of the buttons to perform the actions
          </div>
        </div>
        <div className='grid md:grid-cols-2 grid-cols-1 gap-4 md:max-h-[70vh] max-h-full overflow-y-auto mt-[22px] px-3'>
          <When
            isTrue={
              dataLeadsOverview.treatment_plan.aligner_treatment_status !==
                treatmentPlanStatusConstants.PAUSED &&
              dataLeadsOverview.tracking.type === trackingTypes.PATIENTAPP &&
              treatmentDetail?.creation_status === creationStatusConstants.DONE &&
              treatmentDetail?.progress_status === progressStatusConstants.NOT_STARTED
            }
          >
            <ActionCard
              Icon={ActionListOptions[actionTypes.UPDATE_START_DATE].icon}
              title={ActionListOptions[actionTypes.UPDATE_START_DATE].title}
              text={ActionListOptions[actionTypes.UPDATE_START_DATE].text}
              onClick={() => handleActionOnClick(actionTypes.UPDATE_START_DATE)}
            />
          </When>
          <When isTrue={dataLeadsOverview.tracking.type === trackingTypes.PATIENTAPP}>
            <ActionCard
              Icon={ActionListOptions[actionTypes.VIEW_ALIGNER_CHANGES].icon}
              title={ActionListOptions[actionTypes.VIEW_ALIGNER_CHANGES].title}
              text={ActionListOptions[actionTypes.VIEW_ALIGNER_CHANGES].text}
              onClick={() => {
                handleActionOnClick(actionTypes.VIEW_ALIGNER_CHANGES)
              }}
              disabled={!hasValue(alignerUpdates.actions)}
            />
          </When>
          <When
            isTrue={
              isAccessibleActionButton &&
              dataLeadsOverview.treatment_plan.aligner_treatment_status ===
                treatmentPlanStatusConstants.ACTIVE &&
              patientAssignedTo !== 'ASSIGNED_TO_PRACTICE'
            }
          >
            <ActionCard
              Icon={ActionListOptions[actionTypes.PAUSE_TREATMENT].icon}
              title={ActionListOptions[actionTypes.PAUSE_TREATMENT].title}
              text={ActionListOptions[actionTypes.PAUSE_TREATMENT].text}
              onClick={() => handleActionOnClick(actionTypes.PAUSE_TREATMENT)}
            />
          </When>
          <When
            isTrue={
              isAccessibleActionButton &&
              dataLeadsOverview.treatment_plan.aligner_treatment_status ===
                treatmentPlanStatusConstants.PAUSED
            }
          >
            <ActionCard
              Icon={ActionListOptions[actionTypes.RESUME_TREATMENT].icon}
              title={ActionListOptions[actionTypes.RESUME_TREATMENT].title}
              text={ActionListOptions[actionTypes.RESUME_TREATMENT].text}
              onClick={() => handleActionOnClick(actionTypes.RESUME_TREATMENT)}
            />
          </When>
          <When isTrue={dataLeadsOverview.tracking.type === trackingTypes.PATIENTAPP}>
            <ActionCard
              Icon={ActionListOptions[actionTypes.VIEW_WEAR_STATS].icon}
              title={ActionListOptions[actionTypes.VIEW_WEAR_STATS].title}
              text={ActionListOptions[actionTypes.VIEW_WEAR_STATS].text}
              onClick={() => {
                navigate(`/profile/${patientId}/aligner-tracking/${alignerJourneyId}/wear-stats`)
              }}
            />
          </When>
          <When
            isTrue={
              dataLeadsOverview.tracking.type === trackingTypes.PATIENTAPP &&
              patientAssignedTo !== 'ASSIGNED_TO_PRACTICE'
            }
          >
            <ActionCard
              Icon={ActionListOptions[actionTypes.FORCE_CHANGE_ALIGNER].icon}
              title={ActionListOptions[actionTypes.FORCE_CHANGE_ALIGNER].title}
              text={
                !forceAlignerDisabled ||
                dataLeadsOverview.treatment_plan.aligner_treatment_status ===
                  treatmentPlanStatusConstants.PAUSED
                  ? ActionListOptions[actionTypes.FORCE_CHANGE_ALIGNER].text
                  : 'This feature will be available after 24 hours.'
              }
              onClick={() => handleActionOnClick(actionTypes.FORCE_CHANGE_ALIGNER)}
              disabled={
                dataLeadsOverview.treatment_plan.aligner_treatment_status ===
                  treatmentPlanStatusConstants.PAUSED || forceAlignerDisabled
              }
            />
          </When>
          <When isTrue={isAccessibleProduction}>
            <ActionCard
              Icon={ActionListOptions[actionTypes.VIEW_LOGS].icon}
              title={ActionListOptions[actionTypes.VIEW_LOGS].title}
              text={ActionListOptions[actionTypes.VIEW_LOGS].text}
              onClick={() => handleActionOnClick(actionTypes.VIEW_LOGS)}
            />
          </When>
          <When isTrue={patientAssignedTo !== 'ASSIGNED_TO_PRACTICE'}>
            <ActionCard
              Icon={ActionListOptions[actionTypes.COMPLETE_TREATMENT].icon}
              title={ActionListOptions[actionTypes.COMPLETE_TREATMENT].title}
              text={ActionListOptions[actionTypes.COMPLETE_TREATMENT].text}
              onClick={() => handleActionOnClick(actionTypes.COMPLETE_TREATMENT)}
              disabled={true}
            />
          </When>
        </div>
      </Page>
    </ModalLayout>
  )
}

export default ModalActionList
