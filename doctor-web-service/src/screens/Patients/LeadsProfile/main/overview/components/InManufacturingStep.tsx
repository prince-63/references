import {ReactNode} from 'react'
import CaseSubmittedOn from './CaseSubmittedOn'
import When from 'components/when/When'
import InfoCard from 'components/instruction/InfoCard'
import getColorPalette from 'utils/getColorPalette'
import CheckedCircleOutlineIcon from 'assets/icons/CheckedCircleOutlineIcon'
import OrdersIcon from 'assets/icons/ThreeDotIcons'
import WarehouseIcon from 'assets/icons/WarehouseIcon'
import TruckIcon from 'assets/icons/TruckIcon'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import CaretRightIcon from 'assets/icons/CaretRightIcon'
import CheckIcon from 'assets/icons/CheckIcon'
import moment from 'moment'
import StartManufacturingModal from './StartManufacturingModal'
import {ManufacturingStatus} from '../types/GettingStarted.types'
import {useNavigate, useParams} from 'react-router-dom'
import AddShippingModal from './AddShippingModal'
import CompleteManufacturingModal from './CompleteManufacturingModal'
import ConfirmShippedModal from './ConfirmShippedModal'
import hasValue from 'utils/hasValue'
import ClockIcon from 'assets/icons/ClockIcon'
import BorderedCard from 'components/BorderedCard/BorderedCard'
import InvitePatientInfoCard from './InvitePatientInfoCard'
import useDispatchAction from '@hooks/useDispatchAction'
import {
  getGettingStartedStepDetails,
  setOpenCompleteManufacturingModal,
  setOpenConfirmShippedModal,
  setOpenModalManufacturing,
  setOpenShippingDetailsModal,
  updateCurrentStepGettingStarted,
  getManufacturingListDetails,
} from 'redux/Slices/AppSlice/LeadsProfile/GettingStartedOverview/GettingStartedOverview.slice'
import {safeParseInt} from 'utils/ConstFunctions'
import {ManufacturingDetailsCard} from './ManufacturingDetailsCard'
import {useManufacturingDetails} from '../hooks/useManufacturingDetails'
import {useFeatureAccess} from '@hooks/useFeatureAccess'
import useAllUserPlan from '@hooks/useAllUserPlan'
import treatmentPlanStatusConstants from '@constants/treatmentPlanStatus.constants'

type DeliveredTotals = {
  totalAligners: number
  upperJaw: {start: number | null; end: number | null}
  lowerJaw: {start: number | null; end: number | null}
}

const InManufacturingStep = () => {
  const {patientId: id} = useParams()
  const {dispatchAction} = useDispatchAction()
  const {isOrganization, isPractice} = useAllUserPlan()
  const {
    gettingStartedStepData,
    openModalManufacturing,
    openCompleteManufacturingModal,
    openConfirmShippedModal,
    openShippingDetailsModal,
  } = useSelector((state: RootState) => state.GettingStartedOverview)

  const {latest_manufacturing_data, processed, unprocessed} = useManufacturingDetails({})
  const deliveredBatches = processed.filter((b) => b.status === 'DELIVERED')

  const deliveredTotals = deliveredBatches.reduce<DeliveredTotals>(
    (acc, batch) => ({
      totalAligners: acc.totalAligners + batch.totalAligners,
      upperJaw: {
        start: acc.upperJaw.start ?? batch.upperJaw.start,
        end: batch.upperJaw.end,
      },
      lowerJaw: {
        start: acc.lowerJaw.start ?? batch.lowerJaw.start,
        end: batch.lowerJaw.end,
      },
    }),
    {
      totalAligners: 0,
      upperJaw: {start: null, end: null},
      lowerJaw: {start: null, end: null},
    }
  )

  const shipping_details = gettingStartedStepData?.in_manufacturing?.shipping_details
  const active_treatment_plan = gettingStartedStepData?.in_manufacturing?.active_treatment_plan
  const {order} = useSelector((state: RootState) => state.orders)
  const patientId = hasValue(order) ? order?.patient_details?.id : id
  const navigate = useNavigate()
  const invited_patient = gettingStartedStepData?.invited_patient
  const {dataLeadsOverview} = useSelector((state: RootState) => state.leadsProfile)
  const {permissionChecks} = useFeatureAccess()
  const manufacturingPermissions = permissionChecks?.practiceOrderManagement
  const current_treatment_plan_status = dataLeadsOverview?.current_treatment_plan_status

  const getNotificationForOrg = (status: ManufacturingStatus) => {
    switch (status) {
      case 'MANUFACTURING_STARTED':
        return (
          <InfoCard
            title={'Complete manufacturing'}
            subTitle={'Received aligners in stock? Change status to In Inventory.'}
            color={getColorPalette().secondaryColor}
            className='bg-secondarySupport border-secondaryColor'
            buttonText='Complete'
            classNameButton=' text-secondaryColor bg-secondarySupport border border-secondaryColor'
            onClick={() => {
              dispatchAction(setOpenCompleteManufacturingModal(true))
            }}
          />
        )

      case 'COMPLETED':
        return (
          <InfoCard
            title={'Order ready to ship?'}
            subTitle={'When you have aligners in inventory, add shipping details.'}
            color={getColorPalette().secondaryColor}
            className='bg-tertiarySupport border-tertiaryColor'
            buttonText='Ship order'
            classNameButton=' text-tertiaryColor bg-tertiarySupport border border-tertiaryColor'
            onClick={() => {
              dispatchAction(setOpenShippingDetailsModal(true))
            }}
            Icon={<CheckedCircleOutlineIcon height='29' width='29' />}
          />
        )

      default:
        return (
          <>
            {!hasValue(gettingStartedStepData?.in_manufacturing?.manufacturing_details_list) && (
              <InfoCard
                title={'What’s next? - Start manufacturing'}
                subTitle={'Review details and confirm batch to start order.'}
                color={getColorPalette().secondaryColor}
                className='bg-secondarySupport border-secondaryColor'
                buttonText='Start manufacturing'
                classNameButton=' text-secondaryColor bg-secondarySupport border border-secondaryColor'
                onClick={() => {
                  dispatchAction(setOpenModalManufacturing(true))
                }}
              />
            )}
          </>
        )
    }
  }

  const getNotificationForPractice = (status: ManufacturingStatus) => {
    switch (status) {
      case 'SHIPPED':
        return (
          <InfoCard
            title={'Order shipped'}
            subTitle={'View tracking details on transit page.'}
            color={getColorPalette().secondaryColor}
            className='bg-tertiarySupport border-tertiaryColor'
            buttonText='Message lab'
            classNameButton=' text-tertiaryColor bg-tertiarySupport border border-tertiaryColor'
            onClick={() => {
              navigate(`/orders/${gettingStartedStepData?.order_id}`)
            }}
            Icon={<CheckedCircleOutlineIcon height='29' width='29' />}
          />
        )

      default:
        return (
          <>
            {!hasValue(gettingStartedStepData?.in_manufacturing?.manufacturing_details_list) && (
              <InfoCard
                title={'Manufacturing in progress'}
                subTitle={
                  'Confirm details below. If you need any modifications, you can message the lab'
                }
                color={getColorPalette().secondaryColor}
                className='bg-secondarySupport border-secondaryColor'
                buttonText='Message lab'
                classNameButton=' text-secondaryColor bg-secondarySupport border border-secondaryColor'
                onClick={() => {
                  navigate(`/orders/${gettingStartedStepData?.order_id}`)
                }}
              />
            )}
          </>
        )
    }
  }

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
        filter_by_step: processed[0]?.status === 'COMPLETED' ? 'IN_TRANSIT' : null,
      })
    )
    if (processed[0]?.status === 'COMPLETED') {
      dispatchAction(updateCurrentStepGettingStarted(3))
    }
  }

  return (
    <div className='w-full flex flex-col gap-3'>
      <StartManufacturingModal
        openModal={openModalManufacturing}
        refreshData={refreshData}
        treatment_plan_id={active_treatment_plan?.treatment_plan_id}
        status={
          latest_manufacturing_data && latest_manufacturing_data?.status === 'MANUFACTURING_STARTED'
            ? latest_manufacturing_data?.status
            : undefined
        }
      />
      <CompleteManufacturingModal
        openModal={openCompleteManufacturingModal}
        refreshData={refreshData}
      />
      <AddShippingModal openModal={openShippingDetailsModal} refreshData={refreshData} />

      <ConfirmShippedModal openModal={openConfirmShippedModal} refreshData={refreshData} />

      <div className='text-xl font-semibold '>Manufacturing</div>
      <CaseSubmittedOn />
      <div className='flex flex-col gap-3'>
        <When isTrue={isOrganization}>
          {getNotificationForOrg(latest_manufacturing_data?.status ?? 'PENDING')}
        </When>

        <When isTrue={isPractice}>
          {getNotificationForPractice(latest_manufacturing_data?.status ?? 'PENDING')}
        </When>

        <When isTrue={active_treatment_plan && !isPractice}>
          <div className='md:flex-row flex flex-col gap-2 justify-between'>
            <ManufacturingDetailsCard
              totalAligners={active_treatment_plan?.total_aligners}
              upperJaw={{
                start: active_treatment_plan?.start_upper_jaw,
                end: active_treatment_plan?.end_upper_jaw,
              }}
              lowerJaw={{
                start: active_treatment_plan?.start_lower_jaw,
                end: active_treatment_plan?.end_lower_jaw,
              }}
              title={'TOTAL ALIGNER'}
            />

            <ManufacturingDetailsCard
              totalAligners={safeParseInt(unprocessed?.total_aligners)}
              upperJaw={{
                start: safeParseInt(unprocessed?.upperJaw?.start),
                end: safeParseInt(unprocessed?.upperJaw?.end),
              }}
              lowerJaw={{
                start: safeParseInt(unprocessed?.lowerJaw?.start),
                end: safeParseInt(unprocessed?.lowerJaw?.end),
              }}
              title={'UNPROCESSED'}
            />

            <ManufacturingDetailsCard
              title='IN MANUFACTURING'
              status={latest_manufacturing_data?.status}
              totalAligners={
                ['MANUFACTURING_STARTED', 'COMPLETED'].includes(
                  latest_manufacturing_data?.status ?? ''
                )
                  ? latest_manufacturing_data?.total_aligners
                  : 0
              }
              upperJaw={{
                start: ['MANUFACTURING_STARTED', 'COMPLETED'].includes(
                  latest_manufacturing_data?.status ?? ''
                )
                  ? safeParseInt(latest_manufacturing_data?.upper_aligner_start)
                  : '',
                end: ['MANUFACTURING_STARTED', 'COMPLETED'].includes(
                  latest_manufacturing_data?.status ?? ''
                )
                  ? safeParseInt(latest_manufacturing_data?.upper_aligner_end)
                  : '',
              }}
              lowerJaw={{
                start: ['MANUFACTURING_STARTED', 'COMPLETED'].includes(
                  latest_manufacturing_data?.status ?? ''
                )
                  ? safeParseInt(latest_manufacturing_data?.lower_aligner_start)
                  : '',
                end: ['MANUFACTURING_STARTED', 'COMPLETED'].includes(
                  latest_manufacturing_data?.status ?? ''
                )
                  ? safeParseInt(latest_manufacturing_data?.lower_aligner_end)
                  : '',
              }}
            />

            <ManufacturingDetailsCard
              title='DELIVERED'
              status={deliveredTotals.totalAligners > 0 ? 'DELIVERED' : undefined}
              totalAligners={deliveredTotals.totalAligners}
              upperJaw={{
                start: safeParseInt(deliveredTotals.upperJaw.start),
                end: safeParseInt(deliveredTotals.upperJaw.end),
              }}
              lowerJaw={{
                start: safeParseInt(deliveredTotals.lowerJaw.start),
                end: safeParseInt(deliveredTotals.lowerJaw.end),
              }}
            />
          </div>
        </When>

        <When isTrue={isOrganization}>
          {manufacturingPermissions?.startManufacturing?.isAddable && (
            <ManufacturingSteps
              Icon={<OrdersIcon color={getColorPalette().primaryColor} />}
              title='Start manufacturing'
              subTitle='Review and confirm production type and the aligner batch for production.'
              completedDate={latest_manufacturing_data?.started_on ?? ''}
              buttonText='Start manufacturing'
              onClick={() => {
                dispatchAction(setOpenModalManufacturing(true))
              }}
              isCompletedManufacturingStep={
                !hasValue(gettingStartedStepData?.in_manufacturing?.manufacturing_details_list)
              }
            />
          )}
          {manufacturingPermissions?.completeManufacturing?.isAddable && (
            <ManufacturingSteps
              Icon={<WarehouseIcon color={getColorPalette().primaryColor} />}
              title='Complete manufacturing'
              subTitle='Mark batch as ready and stored for shipment.'
              completedDate={latest_manufacturing_data?.completed_on ?? ''}
              buttonText='Complete'
              onClick={() => {
                dispatchAction(setOpenCompleteManufacturingModal(true))
              }}
              isCompletedManufacturingStep={
                latest_manufacturing_data?.status === 'MANUFACTURING_STARTED'
              }
            />
          )}
          {manufacturingPermissions?.addShippingDetails?.isAddable && (
            <ManufacturingSteps
              Icon={<TruckIcon color={getColorPalette().primaryColor} />}
              title='Add shipping details'
              subTitle='Enter tracking info to move stage to Transit.'
              completedDate={
                latest_manufacturing_data?.delivered_on ??
                latest_manufacturing_data?.shipping_added_on ??
                ''
              }
              buttonText='Ship order'
              onClick={() => {
                dispatchAction(setOpenShippingDetailsModal(true))
              }}
              onClickShipOrder={() => {
                dispatchAction(setOpenConfirmShippedModal(true))
              }}
              isCompletedManufacturingStep={latest_manufacturing_data?.status === 'COMPLETED'}
            />
          )}
        </When>

        <When isTrue={isPractice && shipping_details !== null}>
          <BorderedCard>
            <div className='text-textColor font-medium'>Shipping details</div>
            <div className='font-normal'>{shipping_details?.addressed_to}</div>
            <div className='font-normal'>{shipping_details?.name}</div>
            <div className='font-normal'>{shipping_details?.address_line}</div>
            <div className='font-normal'>
              {shipping_details?.city},{shipping_details?.state}
            </div>
            <div className='font-normal'>{shipping_details?.country}</div>
            <div className='font-normal'>{shipping_details?.pincode}</div>
            <div className='text-textColor font-medium flex gap-2 items-center'>
              Need any modifications?{' '}
              <button
                className='text-primaryColor font-semibold flex gap-1 items-center'
                onClick={() => navigate(`/orders/${gettingStartedStepData?.order_id}`)}
              >
                <div>Message lab</div>
                <CaretRightIcon color={getColorPalette().primaryColor} />
              </button>
            </div>
          </BorderedCard>
        </When>
        <When
          isTrue={
            isPractice &&
            !invited_patient &&
            current_treatment_plan_status !==
              (treatmentPlanStatusConstants.DEACTIVATED || treatmentPlanStatusConstants.COMPLETE)
          }
        >
          <InvitePatientInfoCard />
        </When>
      </div>
    </div>
  )
}

export default InManufacturingStep

const ManufacturingSteps = ({
  Icon,
  title,
  subTitle,
  buttonText,
  completedDate,
  onClick,
  onClickShipOrder,
  isCompletedManufacturingStep,
}: {
  Icon: ReactNode
  title: string
  subTitle: string
  buttonText: string
  completedDate: string | null
  onClick?: () => void
  onClickShipOrder?: () => void
  isCompletedManufacturingStep: boolean
}) => {
  return (
    <div className='flex md:flex-row flex-col md:items-center items-start justify-between gap-2 border border-mediumGray p-4 rounded-lg'>
      <div className='flex md:items-center items-start gap-3'>
        <div className='bg-primarySupport p-4 rounded-lg w-fit'>{Icon}</div>
        <div className='text-base text-textColor'>
          <p className=' text-black font-semibold'>
            <div> {title}</div>
          </p>
          <p className='text-textColor font-normal text-sm'>{subTitle}</p>
        </div>
      </div>
      <div>
        {!isCompletedManufacturingStep ? (
          <div>
            {hasValue(completedDate) ? (
              <div className='flex gap-1 items-center text-textColor text-sm font-semibold'>
                <CheckIcon color='#00b383' width='16' height='16' /> On{' '}
                {moment(completedDate).format('DD-MMM-YYYY')}
              </div>
            ) : (
              <div className='flex gap-2 text-textColor text-sm font-semibold'>
                <ClockIcon color={'#666666'} />
                {buttonText === 'Complete' && 'Start manufacturing'}
                {buttonText === 'Ship order' && 'After manufacturing'}
              </div>
            )}
          </div>
        ) : (
          <div className='flex flex-row md:items-center gap-3'>
            <When isTrue={buttonText === 'Ship order'}>
              <button
                className={
                  'bg-primarySupport border border-primaryColor text-primaryColor py-2 px-4 flex items-center gap-2 rounded-lg font-semibold'
                }
                onClick={onClickShipOrder}
              >
                Already delivered?
              </button>
            </When>
            <button
              className={
                'bg-primaryColor text-white py-2 px-4 flex items-center gap-2 rounded-lg font-semibold w-fit'
              }
              onClick={onClick}
            >
              <div>{buttonText}</div>
              <CaretRightIcon color={getColorPalette().white} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
