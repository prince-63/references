import When from 'components/when/When'
import getColorPalette from 'utils/getColorPalette'
import InfoCard from 'components/instruction/InfoCard'
import InvitePatientInfoCard from './InvitePatientInfoCard'
import CaseSubmittedOn from './CaseSubmittedOn'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import {useNavigate, useParams} from 'react-router-dom'
import InPlanningTreatmentView from './InPlanningTreatmentView'
import {TreatmentPlanStatus} from '../types/GettingStarted.types'
import cn from '@utils/cn'
import CaretRightIcon from 'assets/icons/CaretRightIcon'
import PaperPlaneTiltIcon from 'assets/icons/PaperPlaneTiltIcon'
import orderStatusConstants from '@constants/orderStatus.constants'
import moment from 'moment'
import hasValue from 'utils/hasValue'
import InfoIcon from 'assets/icons/InfoIcon'
import ClipBoardIcon from 'assets/icons/ClipBoardIcon'
import useAllUserPlan from '@hooks/useAllUserPlan'
import treatmentPlanStatusConstants from '@constants/treatmentPlanStatus.constants'
import LeadsProfileInfoCard from '../../alignersTracking/components/InfoCard'
import {SendCaseCard} from './SendCaseCard'

const InPlanningStep = () => {
  const {patientId} = useParams()
  const {isOrganization, isPractice} = useAllUserPlan()
  const {gettingStartedStepData} = useSelector((state: RootState) => state.GettingStartedOverview)
  const in_planning = gettingStartedStepData?.in_planning
  const latest_order_treatment_plan_status =
    gettingStartedStepData?.latest_order_treatment_plan_status
  const navigate = useNavigate()
  const {dataLeadsOverview: dataLeadsData} = useSelector((state: RootState) => state.leadsProfile)

  const tracking_enabled_treatment_plan_status =
    dataLeadsData?.treatment_plan?.aligner_treatment_status

  const currentTreatmentPlanStatus = dataLeadsData?.current_treatment_plan_status
  const gettingStartedOrderStatus = dataLeadsData?.getting_started_order_status
  const gettingStartedOrderId = dataLeadsData?.getting_started_order_id

  const getNotificationForPractice = (treatment_plan_status: TreatmentPlanStatus) => {
    switch (treatment_plan_status) {
      case 'AWAITING_TREATMENT_PLAN':
        if (gettingStartedStepData?.order_status !== orderStatusConstants?.CANCELLED) {
          return (
            <InfoCard
              title={'Awaiting treatment plans'}
              subTitle={'You’ll be notified once you receive treatment plans.'}
              color={getColorPalette().secondaryColor}
              className='bg-secondarySupport border-secondaryColor'
            />
          )
        }
        break
      case 'AWAITING_APPROVAL':
        return (
          <InfoCard
            title={'Action required: Review and approve plans'}
            subTitle={'What’s next? - Review and approve plans or request for re-plan.'}
            color={getColorPalette().orange}
            className='bg-orangeSupport border-orange'
            buttonText='View details'
            classNameButton=' text-orange bg-orangeSupport border border-orange'
            onClick={() => {
              navigate(`/profile/${patientId}/plans-list`)
            }}
          />
        )

      case 'APPROVED':
        return (
          <InfoCard
            title={'What’s next? Send plans to patient'}
            subTitle={
              'Share the approved treatment plans with the patient for their review and confirmation.'
            }
            color={getColorPalette().secondaryColor}
            className='bg-secondarySupport border-secondaryColor'
            buttonText='View details'
            classNameButton=' text-secondaryColor bg-secondarySupport border border-secondaryColor'
            onClick={() => {
              navigate(`/profile/${patientId}/plans-list`)
            }}
          />
        )
      case 'SENT_TO_PATIENT':
      case 'APPROVED_BY_PATIENT':
        return (
          <InfoCard
            title={'What’s next? Finalize a plan'}
            subTitle={'Finalize a plan to begin manufacturing of aligners.'}
            color={getColorPalette().secondaryColor}
            className='bg-secondarySupport border-secondaryColor'
            buttonText='View details'
            classNameButton=' text-secondaryColor bg-secondarySupport border border-secondaryColor'
            onClick={() => {
              navigate(`/profile/${patientId}/plans-list`)
            }}
          />
        )
      case 'DEACTIVATED':
        return (
          <InfoCard
            title={'Awaiting treatment plans'}
            subTitle={'You’ll be notified once you receive treatment plans.'}
            color={getColorPalette().secondaryColor}
            className='bg-secondarySupport border-secondaryColor'
          />
        )
      default:
        return null
    }
  }

  const getNotificationForOrganization = (treatment_plan_status: TreatmentPlanStatus) => {
    switch (treatment_plan_status) {
      case 'AWAITING_TREATMENT_PLAN':
        if (gettingStartedStepData?.order_status !== orderStatusConstants?.CANCELLED) {
          return (
            <InfoCard
              title={'What’s next? Create and send treatment plans'}
              subTitle={'Create and send plans manually or after creating a purchase order.'}
              color={getColorPalette().secondaryColor}
              className='bg-secondarySupport border-secondaryColor'
              classNameButton=' text-secondaryColor bg-secondarySupport border border-secondaryColor'
              buttonText='Create'
              onClick={() => {
                navigate(`/orders/${gettingStartedStepData?.order_id}`)
              }}
            />
          )
        }
        break
      case 'AWAITING_APPROVAL':
        return (
          <InfoCard
            title={'Treatment plans sent'}
            subTitle={'Awaiting practice approval.'}
            color={getColorPalette().secondaryColor}
            className='bg-secondarySupport border-secondaryColor'
            classNameButton=' text-secondaryColor bg-secondarySupport border border-secondaryColor'
            buttonText='View details'
            onClick={() => {
              navigate(`/orders/${gettingStartedStepData?.order_id}`)
            }}
          />
        )

      case 'APPROVED':
        return (
          <InfoCard
            title={'Treatment plans were approved'}
            subTitle={'Awaiting practice to finalize plan.'}
            color={getColorPalette().secondaryColor}
            className='bg-secondarySupport border-secondaryColor'
            classNameButton=' text-secondaryColor bg-secondarySupport border border-secondaryColor'
            buttonText='View details'
            onClick={() => {
              navigate(`/orders/${gettingStartedStepData?.order_id}`)
            }}
          />
        )
      case 'SENT_TO_PATIENT':
      case 'APPROVED_BY_PATIENT':
        return (
          <InfoCard
            title={'Treatment plans were approved'}
            subTitle={'Awaiting practice to finalize plan.'}
            color={getColorPalette().secondaryColor}
            className='bg-secondarySupport border-secondaryColor'
            classNameButton=' text-secondaryColor bg-secondarySupport border border-secondaryColor'
            buttonText='View details'
            onClick={() => {
              navigate(`/orders/${gettingStartedStepData?.order_id}`)
            }}
          />
        )
      case 'DEACTIVATED':
        return (
          <InfoCard
            title={'What’s next? Create and send treatment plans'}
            subTitle={'Create and send plans manually or after creating a purchase order.'}
            color={getColorPalette().secondaryColor}
            className='bg-secondarySupport border-secondaryColor'
            classNameButton=' text-secondaryColor bg-secondarySupport border border-secondaryColor'
            buttonText='Create'
            onClick={() => {
              navigate(`/orders/${gettingStartedStepData?.order_id}`)
            }}
          />
        )
      default:
        return null
    }
  }
  return (
    <div className='w-full flex flex-col gap-3'>
      <When
        isTrue={
          !(
            currentTreatmentPlanStatus === treatmentPlanStatusConstants?.DEACTIVATED ||
            currentTreatmentPlanStatus === treatmentPlanStatusConstants.COMPLETE
          )
        }
      >
        <div className='text-xl font-semibold '>Planning</div>
        <CaseSubmittedOn />
      </When>

      <div className='flex flex-col gap-3'>
        <When isTrue={isPractice}>
          {getNotificationForPractice(in_planning?.treatment_plan_status)}
        </When>
        <When isTrue={isOrganization}>
          {getNotificationForOrganization(in_planning?.treatment_plan_status)}
        </When>
        <When
          isTrue={
            (currentTreatmentPlanStatus === treatmentPlanStatusConstants.DEACTIVATED ||
              currentTreatmentPlanStatus === treatmentPlanStatusConstants.COMPLETE) &&
            gettingStartedOrderStatus === orderStatusConstants.ORDERED
          }
        >
          <When isTrue={isOrganization}>
            <div className='mb-3'>
              <LeadsProfileInfoCard
                {...{
                  title: `You have received a new order!`,
                  className: 'bg-secondarySupport border border-secondaryColor',
                  showButton: true,
                  buttonText: 'View Details',
                  onClick: () => {
                    navigate(`/orders/${gettingStartedStepData?.order_id}`)
                  },
                  buttonClassName:
                    'text-secondaryColor bg-secondarySupport border border-secondaryColor',
                  titleClassName: 'text-black font-semibold',
                  infoIconColor: getColorPalette().secondaryColor,
                  iconColor: getColorPalette().secondaryColor,
                  content:
                    'What’s next? - Create and send treatment plans by creating manually or a purchase order.',
                }}
              />
            </div>
          </When>

          <When isTrue={isPractice}>
            <div className='mb-3'>
              <LeadsProfileInfoCard
                {...{
                  title: `Awaiting treatment plans`,
                  className: 'bg-secondarySupport border border-secondaryColor',
                  showButton: false,
                  titleClassName: 'text-black font-semibold',
                  infoIconColor: getColorPalette().secondaryColor,
                  iconColor: getColorPalette().secondaryColor,
                  content: 'You’ll be notified once you receive treatment plans.',
                }}
              />
            </div>
          </When>
        </When>

        <When
          isTrue={
            (currentTreatmentPlanStatus === treatmentPlanStatusConstants?.DEACTIVATED ||
              currentTreatmentPlanStatus === treatmentPlanStatusConstants.COMPLETE) &&
            (gettingStartedOrderStatus === orderStatusConstants.IN_REVIEW ||
              gettingStartedOrderStatus === orderStatusConstants.APPROVED)
          }
        >
          <When isTrue={isPractice}>
            {getNotificationForPractice(latest_order_treatment_plan_status)}
          </When>
          <When isTrue={isOrganization}>
            {getNotificationForOrganization(latest_order_treatment_plan_status)}
          </When>
        </When>

        <When
          isTrue={
            isPractice &&
            gettingStartedOrderStatus === orderStatusConstants?.DRAFT &&
            (tracking_enabled_treatment_plan_status === treatmentPlanStatusConstants.DEACTIVATED ||
              tracking_enabled_treatment_plan_status === treatmentPlanStatusConstants.COMPLETE) &&
            hasValue(gettingStartedOrderId)
          }
        >
          <SendCaseCard draft={true} orderId={gettingStartedOrderId} />
        </When>

        <When isTrue={gettingStartedStepData?.order_status === orderStatusConstants?.CANCELLED}>
          <div className='flex justify-between items-center bg-redSupport border border-red p-4 rounded-lg'>
            <div className='flex gap-2 items-center'>
              <InfoIcon color='red' width='20' height='20' />
              <div>
                <div className='font-semibold'>Order cancelled</div>
                <div className='font-medium text-textColor text-sm'>
                  This order was cancelled on{' '}
                  {moment(gettingStartedStepData?.assessment?.cancelled_on).format('DD-MMM-YYYY')}.
                </div>
              </div>
            </div>
            <div className='flex gap-2 items-center'>
              <button
                className={cn(
                  'text-red bg-redSupport border border-red px-3 py-2 rounded-lg font-semibold flex gap-2 items-center'
                )}
                onClick={() => navigate(`/orders/${gettingStartedStepData?.order_id}`)}
              >
                <div>View details</div>
                <CaretRightIcon color={'red'} />
              </button>

              {isPractice && (
                <button
                  className={cn(
                    'bg-red text-white py-2 px-4 flex items-center gap-2 rounded-lg font-semibold '
                  )}
                  onClick={() => {
                    navigate('/orders/create-order', {
                      state: {
                        patientId: patientId,
                      },
                    })
                  }}
                >
                  <div>Create order</div>
                  <CaretRightIcon color={'white'} />
                </button>
              )}
            </div>
          </div>
        </When>
        <When
          isTrue={
            hasValue(in_planning?.active_treatment_plan?.treatment_plan_finalized_at) &&
            in_planning?.active_treatment_plan?.status === 'ACTIVE'
          }
        >
          <InfoCard
            color={getColorPalette().secondaryColor}
            className='bg-secondarySupport border-secondaryColor'
            title={`Treatment plan finalized on ${moment(
              in_planning?.active_treatment_plan?.treatment_plan_finalized_at
            ).format('DD-MMM-YYYY')}.`}
          />
        </When>

        <When isTrue={gettingStartedStepData?.in_planning?.purchase_order_status === 'IN_REVIEW'}>
          <div className='flex items-center justify-between p-4 border border-mediumGray rounded-lg '>
            <div className='flex items-center gap-5'>
              <div className='flex items-center justify-center bg-primarySupport rounded-lg w-12 h-12'>
                <ClipBoardIcon color={getColorPalette().primaryColor} />
              </div>
              <div className='flex flex-col items-start'>
                <div className='text-xs uppercase text-textColor font-semibold'>
                  Purchase order status
                </div>
                <div className='font-semibold'>
                  {gettingStartedStepData?.in_planning?.purchase_order_treatment_plan_count === 0
                    ? 'In progress'
                    : `${gettingStartedStepData?.in_planning?.purchase_order_treatment_plan_count} treatment plans received`}
                </div>
                <div className='text-sm text-textColor font-normal'>
                  {gettingStartedStepData?.in_planning?.purchase_order_treatment_plan_count === 0
                    ? 'We will notify you once the organization takes action on the order.'
                    : 'Clone them from the purchase order and send them for approval.'}
                </div>
              </div>
            </div>

            <button
              className='rounded-lg bg-primaryColor flex gap-2 items-center py-1 px-3 text-white  font-semibold justify-center'
              onClick={() => {
                navigate(`/orders/${gettingStartedStepData?.in_planning?.purchase_order_id}`)
              }}
            >
              <div>View order</div>
              <CaretRightIcon color={getColorPalette().primaryColor} />
            </button>
          </div>
        </When>

        <When
          isTrue={gettingStartedStepData?.in_planning?.purchase_order_status === 'NEED_MORE_INFO'}
        >
          <div className='flex items-center justify-between p-4 border border-secondaryColor rounded-lg bg-secondarySupport '>
            <div className='flex items-center gap-5'>
              <div className='flex items-center justify-center bg-secondarySupport rounded-lg w-12 h-12 '>
                <ClipBoardIcon color={getColorPalette().secondaryColor} />
              </div>
              <div className='flex flex-col items-start'>
                <div className='text-xs uppercase text-textColor font-semibold'>
                  Purchase order status
                </div>
                <div className='font-semibold'>Need more information</div>
                <div className='text-sm text-textColor font-normal'>
                  More information requested. Please review remarks and update the order details.
                </div>
              </div>
            </div>

            <button
              className='rounded-lg bg-secondaryColor flex gap-2 items-center py-1 px-3 text-white  font-semibold justify-center'
              onClick={() => {
                navigate(`/orders/${gettingStartedStepData?.in_planning?.purchase_order_id}`)
              }}
            >
              <div>View details</div>
              <CaretRightIcon color={getColorPalette().secondaryColor} />
            </button>
          </div>
        </When>

        <When isTrue={gettingStartedStepData?.in_planning?.purchase_order_status === 'CANCELLED'}>
          <div className='flex items-center justify-between p-4 border border-red rounded-lg bg-redSupport '>
            <div className='flex items-center gap-5'>
              <div className='flex items-center justify-center bg-redSupport rounded-lg w-12 h-12 '>
                <ClipBoardIcon color={getColorPalette().red} />
              </div>
              <div className='flex flex-col items-start'>
                <div className='text-xs uppercase text-textColor font-semibold'>
                  Purchase order status
                </div>
                <div className='font-semibold'>Order cancelled</div>
                <div className='text-sm text-textColor font-normal'>
                  The purchase order was cancelled. You can view the remarks or create a new order.
                </div>
              </div>
            </div>

            <button
              className='rounded-lg bg-redSupport flex gap-2 items-center py-1 px-3 text-red  border border-red font-semibold justify-center'
              onClick={() => {
                navigate(`/orders/${gettingStartedStepData?.in_planning?.purchase_order_id}`)
              }}
            >
              <div>View remarks</div>
              <CaretRightIcon color={getColorPalette().redSupport} />
            </button>
          </div>
        </When>

        <When
          isTrue={
            isOrganization &&
            (in_planning?.treatment_plan_status === 'AWAITING_TREATMENT_PLAN' ||
              in_planning?.treatment_plan_status === 'DEACTIVATED')
          }
        >
          <div
            className={cn(
              ' border border-mediumGray p-4 flex gap-3 md:items-center items-start justify-between rounded-lg'
            )}
          >
            <div className='flex gap-3 md:items-center items-start '>
              <div className='w-12 h-12 rounded-lg bg-primarySupport flex justify-center items-center'>
                <PaperPlaneTiltIcon />
              </div>
              <div>
                <div className='font-semibold'>Create and send plans</div>
                <div className='font-medium text-textColor text-sm'>
                  Create plans manually or create a purchase order.
                </div>
              </div>
            </div>

            <button
              className={cn(
                'bg-primaryColor text-white border border-primaryColor py-2 px-4 flex items-center gap-2 rounded-lg font-semibold'
              )}
              onClick={() => {
                navigate(`/orders/${gettingStartedStepData?.order_id}`)
              }}
            >
              <div>{'Create'}</div>
              <CaretRightIcon color={getColorPalette().white} />
            </button>
          </div>
        </When>
        <When
          isTrue={
            !hasValue(currentTreatmentPlanStatus) &&
            isPractice &&
            !gettingStartedStepData?.invited_patient
          }
        >
          <InvitePatientInfoCard />
        </When>
        <When isTrue={in_planning?.treatment_plan_status === 'ACTIVE'}>
          <InPlanningTreatmentView />
        </When>
      </div>
    </div>
  )
}

export default InPlanningStep
