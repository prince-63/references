import useDispatchAction from '@hooks/useDispatchAction'
import {ConfigProvider, Steps} from 'antd'
import {useSelector} from 'react-redux'
import {
  getGettingStartedStepDetails,
  getManufacturingListDetails,
  updateCurrentStepGettingStarted,
} from 'redux/Slices/AppSlice/LeadsProfile/GettingStartedOverview/GettingStartedOverview.slice'
import {RootState} from 'redux/store'
import GettingStartedSteps from './components/GettingStartedSteps'
import cn from '@utils/cn'
import {useNavigate, useParams} from 'react-router-dom'
import {safeParseInt} from 'utils/ConstFunctions'
import Page from 'components/page/Page'
import InvitePatientInfoCard from './components/InvitePatientInfoCard'
import InfoCard from 'components/instruction/InfoCard'
import getColorPalette from 'utils/getColorPalette'
import moment from 'moment'
import {SendCaseCard} from './components/SendCaseCard'
import When from 'components/when/When'
import {getStepItems} from './helpers/getStepItems'
import {useMediaQuery} from 'react-responsive'
import {useManufacturingDetails} from './hooks/useManufacturingDetails'
import {useContext, useEffect} from 'react'
import {IGettingStartedSteps} from './types/GettingStarted.types'
import hasValue from 'utils/hasValue'
import {getAllTreatmentPlanList} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileTreatmentPlan.slice'
import {AuthContext} from 'context/AuthContext'
import treatmentPlanStatusConstants from '@constants/treatmentPlanStatus.constants'
import orderStatusConstants from '@constants/orderStatus.constants'
import useAllUserPlan from '@hooks/useAllUserPlan'

const OverviewGettingStarted = () => {
  const {patientId} = useParams()
  const {currentStepGettingStarted, gettingStartedStepData, loadingGettingStartedStep} =
    useSelector((state: RootState) => state.GettingStartedOverview)
  const {dispatchAction} = useDispatchAction()
  const {isPractice} = useAllUserPlan()
  const navigate = useNavigate()
  const isMobile = useMediaQuery({query: '(max-width: 768px)'})
  const {dataLeadsOverview} = useSelector((state: RootState) => state.leadsProfile)
  const {data: patientData} = useSelector((state: RootState) => state.apiGetLeadsProfileDetails)
  const {userId, organizationId} = useContext(AuthContext)
  const gettingStartedOrderStatus = dataLeadsOverview?.getting_started_order_status
  const gettingStartedOrderId = dataLeadsOverview?.getting_started_order_id
  const tracking_enabled_treatment_plan_status =
    dataLeadsOverview?.treatment_plan?.aligner_treatment_status

  const getStepValue = (key: number) => {
    switch (key) {
      case 0:
        return 'ASSESSMENT'
      case 1:
        return 'PLANNING'
      case 2:
        return 'IN_MANUFACTURING'
      case 3:
        return 'IN_TRANSIT'
      case 4:
        return 'STARTING_SOON'
      default:
        return 'ASSESSMENT'
    }
  }
  const getStep = (key: string) => {
    switch (key) {
      case 'ASSESSMENT':
        return 0
      case 'PLANNING':
        return 1
      case 'IN_MANUFACTURING':
        return 2
      case 'IN_TRANSIT':
        return 3
      case 'STARTING_SOON':
        return 4
      default:
        return 0
    }
  }

  useManufacturingDetails({
    getFreshData: true,
    treatment_plan_id: safeParseInt(dataLeadsOverview?.treatment_plan_id),
  })

  useEffect(() => {
    if (!(patientData?.patient_details?.patient_type === 'EXISTING_PATIENT')) {
      dispatchAction(
        getGettingStartedStepDetails({
          patient_id: safeParseInt(patientId),
          filter_by_step: null,
        })
      )
        .unwrap()
        .then((res: IGettingStartedSteps) => {
          if (res?.treatment_plan_id) {
            dispatchAction(
              getManufacturingListDetails({
                patient_id: safeParseInt(patientId),
                treatment_plan_id: safeParseInt(res?.treatment_plan_id),
              })
            )
          }
          dispatchAction(updateCurrentStepGettingStarted(getStep(res?.current_step)))
        })

      dispatchAction(
        getAllTreatmentPlanList({
          doctor_id: userId!,
          patient_id: patientId!,
          organization_id: safeParseInt(organizationId),
        })
      )
    }
  }, [])

  const currentTreatmentPlanStatus = dataLeadsOverview?.current_treatment_plan_status

  return (
    <Page loading={loadingGettingStartedStep}>
      <div className='w-full gap-2'>
        {gettingStartedStepData?.assessment?.treatment_plan_status === 'DEACTIVATED' &&
        gettingStartedStepData?.order_status === null ? (
          <>
            <When isTrue={!hasValue(currentTreatmentPlanStatus)}>
              <div className='flex flex-col gap-3'>
                {isPractice ? (
                  <InfoCard
                    title={`Treatment deactivated on ${
                      gettingStartedStepData?.assessment?.deactivated_at &&
                      moment(gettingStartedStepData?.assessment?.deactivated_at ?? '').format(
                        'DD-MMM-YYYY'
                      )
                    }`}
                    subTitle={`Reason: ${
                      gettingStartedStepData?.assessment?.deactivation_reason ?? '-'
                    }. Remark: ${gettingStartedStepData?.assessment?.deactivation_remark ?? '-'}`}
                    color={getColorPalette().red}
                    className='bg-redSupport border-red'
                  />
                ) : (
                  <InfoCard
                    title={`Treatment deactivated on ${
                      gettingStartedStepData?.assessment?.deactivated_at &&
                      moment(gettingStartedStepData?.assessment?.deactivated_at ?? '').format(
                        'DD-MMM-YYYY'
                      )
                    }`}
                    subTitle={`Reason: ${
                      gettingStartedStepData?.assessment?.deactivation_reason ?? '-'
                    }. Remark: ${gettingStartedStepData?.assessment?.deactivation_remark ?? '-'}`}
                    color={getColorPalette().red}
                    className='bg-redSupport border-red'
                    classNameButton='text-red bg-redSupport border border-red'
                    buttonText='View plan'
                    onClick={() => {
                      navigate(`treatment`)
                    }}
                  />
                )}
                <When
                  isTrue={
                    isPractice &&
                    (gettingStartedStepData?.order_status === null ||
                      gettingStartedStepData?.order_status === 'DRAFT')
                  }
                >
                  <SendCaseCard />
                </When>
                {isPractice && <InvitePatientInfoCard />}
              </div>
            </When>
            <When
              isTrue={
                isPractice &&
                gettingStartedOrderStatus === orderStatusConstants?.DRAFT &&
                tracking_enabled_treatment_plan_status ===
                  treatmentPlanStatusConstants.DEACTIVATED &&
                hasValue(gettingStartedOrderId)
              }
            >
              <SendCaseCard draft={true} orderId={gettingStartedOrderId} />
            </When>
          </>
        ) : (
          <div>
            <When isTrue={!hasValue(currentTreatmentPlanStatus)}>
              <div className={`overflow-x-auto ${isMobile ? 'pb-2' : ''}`}>
                <div className='min-w-max'>
                  <ConfigProvider
                    theme={{
                      token: {
                        colorPrimary: '#00B383',
                      },
                    }}
                  >
                    <Steps
                      direction='horizontal'
                      current={getStep(gettingStartedStepData.current_step)}
                      onChange={(v) => {
                        dispatchAction(
                          getGettingStartedStepDetails({
                            patient_id: safeParseInt(patientId),
                            filter_by_step: getStepValue(v),
                          })
                        )
                        dispatchAction(updateCurrentStepGettingStarted(v))
                      }}
                      items={getStepItems({gettingStartedStepData})}
                    />
                  </ConfigProvider>
                </div>
              </div>
            </When>

            <div className={cn('flex flex-1 md:h-full overflow-y-auto p-2 md:min-h-fit ')}>
              {GettingStartedSteps[currentStepGettingStarted]?.content}
            </div>
          </div>
        )}
      </div>
    </Page>
  )
}

export default OverviewGettingStarted
