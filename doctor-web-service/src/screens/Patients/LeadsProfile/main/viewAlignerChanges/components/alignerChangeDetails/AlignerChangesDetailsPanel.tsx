import Page from 'components/page/Page'
import DateComponent from './components/DateComponent'
import Statistics from './components/Statistics'
import AlignerChangeDetails from './components/AlignerChangeDetails'
import Comments from './components/Comments'
import PatientsFeedback from './components/PatientsFeedback'
import Photos from './components/Photos'
import When from 'components/when/When'
import {useContext} from 'react'
import {RootState} from 'redux/store'
import {useSelector} from 'react-redux'
import hasValue from 'utils/hasValue'
import {IAction} from 'screens/Patients/LeadsProfile/leadsProfile.types'
import alignerUpdateTypeConstants from '@constants/alignerUpdateType.constants'
import AlignerDetailsHeader from './components/AlignerDetailsHeader'
import {AuthContext} from 'context/AuthContext'
import useAllUserPlan from '@hooks/useAllUserPlan'

const AlignerChangesDetailsPanel = ({
  gettingAlignerUpdateDetails,
  alignerUpdateItem,
  gettingAlignerUpdates,
  showBackButton = false,
  backNavigationRoute,
}: {
  gettingAlignerUpdateDetails: boolean
  alignerUpdateItem: IAction
  gettingAlignerUpdates?: boolean
  showBackButton?: boolean
  backNavigationRoute: string
}) => {
  const {userId} = useContext(AuthContext)
  const {alignerUpdateDetails} = useSelector((state: RootState) => state.alignerTracking)
  const {data} = useSelector((state: RootState) => state.apiGetLeadsProfileDetails)
  const patientData = data.patient_details
  const {isOrganization, isPractice, isStarterPlanUser} = useAllUserPlan()
  const is_your_patient = patientData?.assigned_practice?.practice_doctor_id == userId

  const isAccessibleActionButton =
    (isOrganization && is_your_patient) || isStarterPlanUser || isPractice

  return (
    <Page
      title={
        <AlignerDetailsHeader
          {...{
            alignerUpdateItem,
          }}
        />
      }
      showBackButton={showBackButton}
      backNavigationRoute={backNavigationRoute}
      loading={
        gettingAlignerUpdates || gettingAlignerUpdateDetails || !hasValue(alignerUpdateDetails)
      }
    >
      <div className='flex flex-col gap-6'>
        <DateComponent {...{date: alignerUpdateDetails?.perform_at}} />
        <When isTrue={alignerUpdateDetails.type === alignerUpdateTypeConstants.ALIGNER_CHANGE}>
          <AlignerChangeDetails
            {...{
              changeDate: alignerUpdateDetails?.aligner?.change_date,
              endDate: alignerUpdateDetails?.aligner?.end_date,
              changeOffset: alignerUpdateDetails?.previous_aligner_details?.change_offset,
            }}
          />
        </When>
        <When isTrue={alignerUpdateDetails.type !== alignerUpdateTypeConstants.ISSUE_REPORT}>
          <Statistics
            {...{
              alignerUpdateDetails,
            }}
          />
          <When isTrue={alignerUpdateDetails.type === alignerUpdateTypeConstants.CHECK_IN}>
            <Photos
              {...{
                alignerUpdateDetails,
              }}
            />
          </When>
          <When
            isTrue={
              (alignerUpdateDetails.type === alignerUpdateTypeConstants.ALIGNER_CHANGE &&
                hasValue(alignerUpdateDetails.aligner_check_in_feedback?.feedbacks)) ||
              alignerUpdateDetails.type === alignerUpdateTypeConstants.CHECK_IN
            }
          >
            <PatientsFeedback
              {...{
                alignerUpdateDetails,
              }}
            />
          </When>
          <When
            isTrue={
              !alignerUpdateDetails.validated &&
              (alignerUpdateDetails.type === alignerUpdateTypeConstants.ALIGNER_CHANGE ||
                alignerUpdateDetails.type === alignerUpdateTypeConstants.CHECK_IN)
            }
          >
            <Comments
              isAccessibleActionButton={isAccessibleActionButton}
              comments={alignerUpdateDetails.comments!}
              alignerActionId={alignerUpdateDetails.aligner_action_id}
              alignerUpdateDetails={alignerUpdateDetails}
            />
          </When>
        </When>
        <When isTrue={alignerUpdateDetails.type === alignerUpdateTypeConstants.ISSUE_REPORT}>
          <PatientsFeedback
            {...{
              alignerUpdateDetails,
            }}
          />
        </When>
      </div>
    </Page>
  )
}

export default AlignerChangesDetailsPanel
