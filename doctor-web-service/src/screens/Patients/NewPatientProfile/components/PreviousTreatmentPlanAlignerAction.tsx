import {Collapse, ConfigProvider} from 'antd'
import {useContext, useEffect} from 'react'
import patientOverviewAlignerActionFilterConstantsConstants from '@constants/patientOverviewAlignerActionFilterConstants.constants'
import treatmentPlanStatusConstants from '@constants/treatmentPlanStatus.constants'
import ExpandIcon from 'screens/Patients/PatientProfile/Tabs/components/ExpandIcon'
import {useDispatch, useSelector} from 'react-redux'
import {AuthContext} from 'context/AuthContext'
import {safeParseInt} from 'utils/ConstFunctions'
import {getPatientTimeLineList} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfile.slice'
import {useParams} from 'react-router-dom'
import patientOverviewAlignerActionFilterConstants from '@constants/patientOverviewAlignerActionFilterConstants.constants'
import {RootState} from 'redux/store'
import PatientTimeLineReusable from './PatientTimeLineReusable'
import {IPatientTimeline} from '../patientTimeline.types'
import When from 'components/when/When'
import '../styles/previousPlan.css'

export const PreviousTreatmentPlanAlignerAction = ({
  showSendReminder,
  setShowSendReminder,
  onResumeTreatment,
  progressStatus,
}: {
  selectedFilter: keyof typeof patientOverviewAlignerActionFilterConstantsConstants
  showSendReminder: boolean
  setShowSendReminder: (showSendReminder: boolean) => void
  onResumeTreatment: () => void
  progressStatus: keyof typeof treatmentPlanStatusConstants | null
}) => {
  const dispatch = useDispatch()
  const {userId} = useContext(AuthContext)
  const {patientId} = useParams()
  const {patientTimelineList} = useSelector((state: RootState) => state.leadsProfile)

  useEffect(() => {
    // Your effect logic here
    dispatch(
      getPatientTimeLineList({
        doctor_id: safeParseInt(userId),
        patient_id: safeParseInt(patientId),
        filter: patientOverviewAlignerActionFilterConstants.ALL_ALIGNERS,
      }) as any
    )
  }, [])

  return (
    <When isTrue={patientTimelineList && patientTimelineList.length > 1}>
      <ConfigProvider
        theme={{
          components: {
            Collapse: {
              /* here is your component tokens */
              headerPadding: 0,
            },
          },
        }}
      >
        <Collapse
          bordered={false}
          expandIconPosition='end'
          expandIcon={({isActive}) => <ExpandIcon {...{isActive}} />}
          style={{
            padding: 0,
            fontFamily: 'figtree',
            backgroundColor: 'transparent',
            width: '100%',
          }}
        >
          <Collapse.Panel
            header={
              <div className='text-textColor font-figtree text-[18px] font-semibold leading-[26px] tracking-[-0.18px]'>
                Previous Plan
              </div>
            }
            key='parent'
          >
            <div className='p-0 flex flex-col gap-4'>
              {patientTimelineList && patientTimelineList.length > 1 && (
                <Collapse
                  bordered={false}
                  expandIconPosition='end'
                  expandIcon={({isActive}) => <ExpandIcon {...{isActive}} />}
                  style={{
                    padding: 4,
                    fontFamily: 'figtree',
                    backgroundColor: 'transparent',
                    borderBottom: '1px solid #E5E7EB',
                  }}
                >
                  {[...patientTimelineList].slice(1).map((patientTimeline: IPatientTimeline) => (
                    <Collapse.Panel
                      key={safeParseInt(
                        patientTimeline.patient_profile_overview_response.treatment_plan_id
                      )}
                      header={
                        <div className='text-textColor font-figtree text-[18px] font-semibold leading-[26px] tracking-[-0.18px]'>
                          {patientTimeline.patient_profile_overview_response.treatment_plan_name}
                        </div>
                      }
                    >
                      <PatientTimeLineReusable
                        key={
                          patientTimeline.patient_profile_overview_response.treatment_plan_id ??
                          `plan-${Math.random()}`
                        }
                        selectedFilter={
                          patientOverviewAlignerActionFilterConstantsConstants.ALL_ALIGNERS
                        }
                        showSendReminder={showSendReminder}
                        setShowSendReminder={setShowSendReminder}
                        progressStatus={progressStatus}
                        onResumeTreatment={onResumeTreatment}
                        timelineData={{aligners: patientTimeline.aligners}}
                        disable={true}
                      />
                    </Collapse.Panel>
                  ))}
                </Collapse>
              )}
            </div>
          </Collapse.Panel>
        </Collapse>
      </ConfigProvider>
    </When>
  )
}
