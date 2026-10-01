import CommonSVG from 'components/atom/SVG/CommonSVG'
import Page from 'components/page/Page'
import When from 'components/when/When'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import {IMAGE_TREATMENT_START_FUTURE, TREATMENT_EMPTY_STATUS} from 'utils/ImageConst'
import {SVG_COLLAPSE, SVG_EXPAND} from 'utils/SvgConstants'
import hasValue from 'utils/hasValue'
import TreatmentPlanCard from './components/TreatmentPlanCard'
import useDispatchAction from '@hooks/useDispatchAction'
import {useContext, useEffect, useState} from 'react'
import {
  getAllTreatmentPlanList,
  getTreatmentPlanList,
} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileTreatmentPlan.slice'
import {AuthContext} from 'context/AuthContext'
import {useNavigate, useParams} from 'react-router-dom'
import useProfileBasePath from '@hooks/useProfileBasePath'
import {
  getTrackingDetails,
  handlePostTrackingDetails,
} from 'redux/Slices/AppSlice/LeadsProfile/Tracking.slice'
import {identifyUser, safeParseInt} from 'utils/ConstFunctions'
import treatmentTypeMain from '@constants/treatmentTypeMain'
import trackingMethodTagTypes from '@constants/trackingMethodTagTypes'
import {AllTreatmentPlanListItem} from '../types/treatmentPlan.types'
import ModalSelectTreatment from '../ModalSelectTreatment'
import subTreatmentTypeConstants from '@constants/subTreatmentType.constants'
import treatmentPlanStatusConstants from '@constants/treatmentPlanStatus.constants'
import getPatientAssignedTo from '@utils/getPatientAssignedTo'
import {setSkipAssessmentTab} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfile.slice'
import orderStatusConstants from '@constants/orderStatus.constants'
import shouldShowRequestStlFilesSection from './helpers/shouldShowRequestStlFilesSection'
import CreateTreatmentPlanModal from 'screens/Orders/components/CreateTreatmentPlanModal'
import OrderStepper from './components/OrderStepper'
import ClipBoardIcon from 'assets/icons/ClipBoardIcon'
import PlusIcon from 'assets/icons/PlusIcon'
import getColorPalette from 'utils/getColorPalette'
import useAllUserPlan from '@hooks/useAllUserPlan'
import userOrderDetails from 'screens/Orders/hooks/userOrderDetails'

const TreatmentPlansList = () => {
  const {allTreatmentPlanList: treatmentPlanList, getAllTreatmentPlanListLoading} = useSelector(
    (state: RootState) => state.leadsProfileTreatmentPlanReducer
  )
  const hasActiveTreatment = treatmentPlanList.some(
    (treatment: AllTreatmentPlanListItem) =>
      treatment.treatment_type === treatmentTypeMain.ALIGNERS &&
      treatment.treatment_status === 'ACTIVE'
  )

  const {userId, profileId, organizationId} = useContext(AuthContext)
  const [isModalSelectTreatmentOpen, setIsModalSelectTreatmentOpen] = useState(false)
  const {dispatchAction} = useDispatchAction()
  const {patientId} = useParams()
  const navigate = useNavigate()
  const profileBasePath = useProfileBasePath()
  const {data} = useSelector((state: RootState) => state.apiGetLeadsProfileDetails)
  const {dataLeadsOverview} = useSelector((state: RootState) => state.leadsProfile)
  const patientData = data.patient_details
  const patientAssignedTo = getPatientAssignedTo(profileId, patientData)
  const gettingStartedDataLeadsOverview = data.getting_started_details
  const {
    isPractice,

    isCustomer,
    isEnterprisePlanUser,
    isAlignerCompanyOrg,
    isProfessionalPlanUser,
    isStarterPlanUser,
    isGrowthPlanUser,
  } = useAllUserPlan()
  const {order} = userOrderDetails()

  const isAssessmentCompleted =
    gettingStartedDataLeadsOverview.mark_all_as_read ||
    (gettingStartedDataLeadsOverview.pre_treatment_photos_filled &&
      gettingStartedDataLeadsOverview.scan_files_filled)

  const is_your_patient = patientData?.assigned_practice?.practice_doctor_id == userId

  useEffect(() => {
    if (!userId || !patientId) return
    dispatchAction(
      getTreatmentPlanList({
        doctor_id: userId,
        patient_id: patientId,
        treatment_subtype: subTreatmentTypeConstants.ALIGNERS,
      })
    )
    dispatchAction(
      getAllTreatmentPlanList({
        doctor_id: userId,
        patient_id: patientId,
        organization_id: safeParseInt(organizationId),
      })
    )
  }, [])
  const orderId = gettingStartedDataLeadsOverview?.order_id

  const canCreateTreatmentPlan =
    gettingStartedDataLeadsOverview?.order_status === orderStatusConstants.ORDERED ||
    gettingStartedDataLeadsOverview?.order_status === orderStatusConstants.RE_PLAN ||
    gettingStartedDataLeadsOverview?.order_status === orderStatusConstants.IN_PROGRESS ||
    gettingStartedDataLeadsOverview?.order_status === orderStatusConstants.COMPLETED ||
    isStarterPlanUser ||
    isGrowthPlanUser

  const [open, setOpen] = useState(false)
  const [selectedLinkType, setSelectedLinkType] = useState<'practice' | 'purchase'>('practice')
  const [showAll, setShowAll] = useState(false)
  const lastTreatmentIsCompleted = order?.status === orderStatusConstants.COMPLETED
  const hasActiveOrApprovedPlan = treatmentPlanList.some((plan: any) => {
    const isActive = plan.treatment_status === treatmentPlanStatusConstants.ACTIVE
    const isApproved =
      plan.initiator_status === treatmentPlanStatusConstants.APPROVED &&
      plan.approver_status === treatmentPlanStatusConstants.APPROVED
    return isActive || isApproved
  })

  const isCustomerOrder = treatmentPlanList.some((plan: any) => {
    return plan.customer_order === true
  })

  const regularPlans = treatmentPlanList.filter((plan) => !plan?.purchase_order)
  const purchasePlans = treatmentPlanList.filter((plan) => plan?.purchase_order)

  const getFilteredPlans = (plans: any) => {
    if (!hasActiveOrApprovedPlan) return plans
    if (plans.length <= 1) return plans
    if (showAll) return plans

    return plans.filter((plan: any) => {
      const isActive = plan.treatment_status === treatmentPlanStatusConstants.ACTIVE
      const isApproved =
        plan.initiator_status === treatmentPlanStatusConstants.APPROVED &&
        plan.approver_status === treatmentPlanStatusConstants.APPROVED
      return isActive || isApproved
    })
  }

  const allPlans = isProfessionalPlanUser
    ? selectedLinkType === 'purchase'
      ? purchasePlans
      : regularPlans
    : [...regularPlans, ...purchasePlans]

  const currentPlans = getFilteredPlans(allPlans)

  const hasPermissionToCreatePlan = canCreateTreatmentPlan && !lastTreatmentIsCompleted

  return (
    <Page
      title='Treatment plans'
      showBorder
      loading={getAllTreatmentPlanListLoading}
      extraHeader={
        <div className='md:w-fit w-full flex gap-3 flex-wrap-reverse'>
          {hasPermissionToCreatePlan && (
            <button
              className='w-full md:w-fit flex justify-center items-center gap-2 bg-primarySupport border border-primaryColor text-primaryColor px-3 py-2 rounded-lg font-semibold '
              type='button'
              onClick={() => {
                identifyUser()
                if (!isAssessmentCompleted && is_your_patient && !hasValue(treatmentPlanList)) {
                  dispatchAction(setSkipAssessmentTab(true))
                  return
                }
                setIsModalSelectTreatmentOpen(true)
              }}
            >
              <PlusIcon color={getColorPalette().primaryColor} />
              Add treatment plan
            </button>
          )}

          <When
            isTrue={
              !hasActiveTreatment &&
              patientAssignedTo === 'ASSIGNED_TO_ME' &&
              !isCustomer &&
              !isPractice &&
              !isAlignerCompanyOrg
            }
          >
            <button
              disabled={true}
              className='w-full md:w-fit px-3 py-2  border bg-grayDisabled text-white font-semibold min-w-36 rounded-lg '
            >
              Add tracking
            </button>
          </When>
          <When isTrue={hasActiveTreatment && !isPractice && !isAlignerCompanyOrg}>
            {dataLeadsOverview?.tracking?.status === trackingMethodTagTypes.ACTIVE ||
            dataLeadsOverview?.tracking?.status === trackingMethodTagTypes.DRAFT ? (
              <button
                onClick={() => {
                  dispatchAction(
                    getTrackingDetails({
                      patient_id: String(patientId),
                      doctor_id: safeParseInt(userId),
                      treatment_subtype: treatmentTypeMain.ALIGNERS,
                    })
                  )
                  navigate(`${profileBasePath}/${patientId}/aligner-tracking`)
                }}
                className='rounded-lg px-3 py-2 w-full md:w-fit min-w-36  border text-[14px] border-secondaryColor bg-secondarySupport text-secondaryColor font-semibold'
              >
                View tracking
              </button>
            ) : (
              <When
                isTrue={
                  patientAssignedTo === 'ASSIGNED_TO_ME' && !isPractice && !isAlignerCompanyOrg
                }
              >
                <button
                  onClick={() => {
                    dispatchAction(handlePostTrackingDetails(null))

                    navigate(`${profileBasePath}/${patientId}/aligner-tracking`)
                  }}
                  className='w-full md:w-fit px-3 py-2  bg-primaryColor text-white  font-semibold min-w-36 rounded-lg '
                >
                  Add tracking
                </button>
              </When>
            )}
          </When>
        </div>
      }
    >
      <When isTrue={isModalSelectTreatmentOpen}>
        <ModalSelectTreatment setIsModalSelectTreatmentOpen={setIsModalSelectTreatmentOpen} />
      </When>
      <When isTrue={!hasValue(treatmentPlanList)}>
        <div className='flex flex-col justify-center items-center gap-7 h-[35rem]'>
          <img
            src={isPractice ? TREATMENT_EMPTY_STATUS : IMAGE_TREATMENT_START_FUTURE}
            alt=''
            width={'258px'}
            height={'216px'}
          />
          <p className='md:text-xl text-[16px] text-textColor break-before-all text-center md:w-[495px] w-full '>
            {isPractice
              ? 'No treatment plans yet. Send a case to the lab to get started. '
              : "You haven't set up any treatment plans yet. Create one now to track and monitor your patient effectively"}
          </p>
        </div>
      </When>
      <When isTrue={(isAlignerCompanyOrg || isEnterprisePlanUser) && hasValue(treatmentPlanList)}>
        <OrderStepper
          patientLinkType={isCustomerOrder ? 'customer' : 'practice'}
          selectedLinkType={selectedLinkType}
          onLinkTypeChange={setSelectedLinkType}
        />
      </When>
      <When isTrue={hasValue(treatmentPlanList)}>
        {hasValue(currentPlans) ? (
          <div className='flex flex-col gap-4'>
            {currentPlans.map((treatmentPlan: any, index: any, treatmentPlanList: any) => {
              const isPurchaseOrder = treatmentPlan?.purchase_order

              if (
                ((selectedLinkType === 'practice' && isPurchaseOrder) ||
                  (selectedLinkType === 'purchase' && !isPurchaseOrder)) &&
                (isAlignerCompanyOrg || isEnterprisePlanUser) &&
                hasValue(treatmentPlanList)
              ) {
                return
              }
              const showRequestStlFilesSection = shouldShowRequestStlFilesSection({
                treatmentPlanList,
                treatmentPlan,
                isCustomer,
              })
              return (
                <div key={index}>
                  <TreatmentPlanCard
                    treatmentPlan={treatmentPlan}
                    showRequestStlFilesSection={showRequestStlFilesSection}
                  />
                  {(treatmentPlan.treatment_status === treatmentPlanStatusConstants.ACTIVE ||
                    treatmentPlan.treatment_status === treatmentPlanStatusConstants.APPROVED) && (
                    <hr className='mt-3' />
                  )}
                </div>
              )
            })}
            {hasActiveOrApprovedPlan &&
              allPlans.length > 1 &&
              currentPlans.length < allPlans.length && (
                <button
                  onClick={() => setShowAll(true)}
                  className='self-start mt-2 flex items-center gap-2'
                >
                  Show All
                  <CommonSVG svg={SVG_EXPAND} width='16' />
                </button>
              )}

            {hasActiveOrApprovedPlan && allPlans.length > 1 && showAll && (
              <button
                onClick={() => setShowAll(false)}
                className='self-start mt-2 flex items-center gap-2'
              >
                Show Less
                <CommonSVG svg={SVG_COLLAPSE} width='16' />
              </button>
            )}
          </div>
        ) : (
          <div className='flex flex-col gap-2 items-center justify-center text-textColor border border-mediumGray rounded-lg py-10  text-base mt-2'>
            <div className='p-3 rounded-full w-fit h-fit bg-lightGray'>
              <ClipBoardIcon width='32' height='32' />
            </div>
            <p className='text-center'>No plans</p>
          </div>
        )}
      </When>
      <CreateTreatmentPlanModal {...{patientId, open, setOpen, orderId}} />
    </Page>
  )
}

export default TreatmentPlansList
