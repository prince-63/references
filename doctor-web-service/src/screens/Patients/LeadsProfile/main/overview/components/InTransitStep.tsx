import CaseSubmittedOn from './CaseSubmittedOn'
import InfoCard from 'components/instruction/InfoCard'
import When from 'components/when/When'
import getColorPalette from 'utils/getColorPalette'
import ShippingDetailsContainer from './ShippingDetailsContainer'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import hasValue from 'utils/hasValue'
import moment from 'moment'
import InvitePatientInfoCard from './InvitePatientInfoCard'
import BorderedCard from 'components/BorderedCard/BorderedCard'
import useDispatchAction from '@hooks/useDispatchAction'
import {
  getGettingStartedStepDetails,
  updateCurrentStepGettingStarted,
  getManufacturingListDetails,
} from 'redux/Slices/AppSlice/LeadsProfile/GettingStartedOverview/GettingStartedOverview.slice'
import {safeParseInt} from 'utils/ConstFunctions'
import {useParams} from 'react-router-dom'
import ConfirmMarkAsDelivered from './ConfirmMarkAsDelivered'
import AddShippingModal from './AddShippingModal'
import useAllUserPlan from '@hooks/useAllUserPlan'

const InTransitStep = () => {
  const {isPractice} = useAllUserPlan()
  const {
    loadingGettingStartedStep,
    gettingStartedStepData,
    openConfirmMarkAsDeliveredModal,
    openShippingDetailsModal,
    loadingManufacturingList,
  } = useSelector((state: RootState) => state.GettingStartedOverview)
  const invited_patient = gettingStartedStepData?.invited_patient
  const in_transit = gettingStartedStepData?.in_transit
  const {dispatchAction} = useDispatchAction()
  const {patientId} = useParams()
  const {dataLeadsOverview} = useSelector((state: RootState) => state.leadsProfile)

  const refreshData = () => {
    dispatchAction(
      getManufacturingListDetails({
        patient_id: safeParseInt(patientId),
        treatment_plan_id: safeParseInt(dataLeadsOverview?.treatment_plan_id),
      })
    )
    dispatchAction(
      getGettingStartedStepDetails({
        patient_id: safeParseInt(patientId),
        filter_by_step: null,
      })
    )
    dispatchAction(updateCurrentStepGettingStarted(4))
  }

  return (
    <div className='w-full flex flex-col gap-3'>
      <ConfirmMarkAsDelivered
        openModal={openConfirmMarkAsDeliveredModal}
        refreshData={refreshData}
      />
      <AddShippingModal
        openModal={openShippingDetailsModal}
        refreshData={() => {
          dispatchAction(
            getGettingStartedStepDetails({
              patient_id: safeParseInt(patientId),
              filter_by_step: null,
            })
          )
        }}
      />
      <div className='text-xl font-semibold '>Transit</div>
      <CaseSubmittedOn />
      <div className='flex flex-col gap-3'>
        <When
          isTrue={
            isPractice &&
            hasValue(in_transit?.shipping_details) &&
            !hasValue(in_transit?.delivery_date)
          }
        >
          <InfoCard
            title={'What’s next? Mark shipment as delivered'}
            subTitle={
              'Your order has been dispatched. View details and mark it as delivered to start treatment.'
            }
            color={getColorPalette().secondaryColor}
            className='bg-secondarySupport border-secondaryColor'
          />
        </When>
        <When isTrue={hasValue(in_transit?.delivery_date)}>
          <InfoCard
            title={`Marked as received on ${moment(in_transit?.delivery_date).format(
              'DD-MMM-YYYY'
            )}`}
            subTitle={
              isPractice
                ? 'You can now confirm the start date in the next step.'
                : 'Wait for the practice to start the treatment.'
            }
            color={getColorPalette().secondaryColor}
            className='bg-secondarySupport border-secondaryColor'
          />{' '}
        </When>
        <When
          isTrue={
            !loadingGettingStartedStep &&
            !loadingManufacturingList &&
            hasValue(in_transit?.shipping_details) &&
            hasValue(in_transit?.shipping_details?.tentative_date)
          }
        >
          <BorderedCard>
            <ShippingDetailsContainer />
          </BorderedCard>
        </When>

        <When isTrue={hasValue(in_transit?.delivery_date)}>
          <div className='w-full border border-mediumGray p-4'>
            <div className='text-sm text-textColor  font-medium'>Delivered on</div>
            <div className='text-base  font-medium'>
              {moment(in_transit?.shipping_details?.delivered_on).format('DD-MMM-YYYY')}
            </div>
          </div>
        </When>

        <When isTrue={isPractice && !invited_patient}>
          <InvitePatientInfoCard />
        </When>
      </div>{' '}
    </div>
  )
}

export default InTransitStep
