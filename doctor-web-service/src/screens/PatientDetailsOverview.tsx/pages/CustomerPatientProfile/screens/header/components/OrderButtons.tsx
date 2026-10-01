import useDispatchAction from '@hooks/useDispatchAction'
import useCreateOrder from '@hooks/useCreateOrder'
import caseTypes from '@constants/caseTypes'
import {AuthContext} from 'context/AuthContext'
import clsx from 'clsx'
import ErrorToast from 'components/modal/Alert/ErrorToast'
import {useContext, useState} from 'react'
import {useSelector} from 'react-redux'
import {useNavigate, useParams} from 'react-router-dom'
import useProfileBasePath from '@hooks/useProfileBasePath'
import {
  getPatientPlanningStepper,
  setActivePlanningStep,
  setSelectedOrderId,
} from 'redux/Slices/AppSlice/CustomerPatientProfile/CustomerPatientProfile.slice'
import {resetCaseRecordState} from 'redux/Slices/AppSlice/CaseRecords/CaseRecords.slice'
import {getNewTreatmentList} from 'redux/Slices/AppSlice/Kanban/Kanban.slice'
import {getLeadsProfileDetails} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileDetails.slice'
import {updateCurrentStep} from 'redux/Slices/AppSlice/orders/orders.slice'
import {
  resetPlanningProductSelection,
  setProductSelected,
} from 'redux/Slices/AppSlice/ProductionSetup/Production.slice'
import {RootState} from 'redux/store'
import {safeParseInt} from 'utils/ConstFunctions'
import ConfirmRefinementModal from '../../../components/ConfirmRefinementModal'
import useAllUserPlan from '@hooks/useAllUserPlan'

const OrderButtons = () => {
  const {dispatchAction} = useDispatchAction()
  const navigate = useNavigate()
  const {userId, profileId, organizationId} = useContext(AuthContext)
  const {patientId} = useParams()
  const profileBasePath = useProfileBasePath()
  const {isPractice} = useAllUserPlan()
  const {
    patientData: patient,
    selectedOrderId,
    active_order_id,
    orderList,
    planning_stepper,
  } = useSelector((state: RootState) => state.customerPatientProfile)
  const {data: patientDetailsResponse} = useSelector(
    (state: RootState) => state.apiGetLeadsProfileDetails
  )
  const {handleCreateOrder, creatingOrder} = useCreateOrder()
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)

  const handleNewRefinementClick = () => {
    const postData = {
      patient_id: safeParseInt(patientId),
      doctor_id: safeParseInt(userId),
    }
    dispatchAction(getLeadsProfileDetails(postData) as any)
    dispatchAction(resetCaseRecordState())
    if (planning_stepper?.order_status === 'DRAFT' && orderList?.length > 0) {
      dispatchAction(updateCurrentStep(1))
      navigate(`/customer/create-order/${active_order_id}?refinement-draft=true`, {
        state: {patientId, fromProfile: true},
      })
    } else if (planning_stepper?.order_status === 'DRAFT') {
      dispatchAction(updateCurrentStep(1))
      navigate(`/customer/create-order/${active_order_id}`, {
        state: {patientId, fromProfile: true},
      })
    } else {
      if (orderList?.length > 0 && active_order_id) {
        setIsConfirmModalOpen(true)
      } else {
        dispatchAction(updateCurrentStep(0))
        navigate('/customer/create-order', {
          state: {patientId, fromProfile: true},
        })
      }
    }
  }

  const handleStartRefinement = async () => {
    try {
      const serviceProduct = patient?.service_product
      if (!serviceProduct) {
        ErrorToast('Could not retrieve product details from the last order.')
        return
      }

      const assignedPractice = patientDetailsResponse?.patient_details?.assigned_practice

      const payload = {
        order_details: {
          lab_id: safeParseInt(profileId),
          lab_organization_id: safeParseInt(organizationId),
          lab_doctor_id: safeParseInt(userId),
          order_type: 'PLANNING_ORDER',
          due_by: null,
          delivery_preference: 'IN_BATCHES',
          target_user_details: {
            profile_id: safeParseInt(serviceProduct?.profile_id),
            organization_id: safeParseInt(serviceProduct?.organization_id),
            doctor_id: safeParseInt(serviceProduct?.doctor_id),
          },
        },
        status: 'DRAFT',
        doctor_id: userId,
        current_step: 1,
        organization_id: safeParseInt(organizationId),
        profile_id: safeParseInt(profileId),
        service_products: serviceProduct,
        case_type: caseTypes.OUTSOURCED_PLANNING_ORDER,
        practice_doctor_id: safeParseInt(assignedPractice?.practice_doctor_id),
        practice_profile_id: safeParseInt(assignedPractice?.practice_profile_id),
        practice_organization_id: safeParseInt(assignedPractice?.practice_organization_id),
        patient_id: patientDetailsResponse?.patient_details?.id,
        service_product_id: serviceProduct?.id,
      }

      const response = await handleCreateOrder({
        orderPayload: payload,
        product: serviceProduct,
        assignedCustomer: assignedPractice,
      })

      setIsConfirmModalOpen(false)
      dispatchAction(resetPlanningProductSelection())
      dispatchAction(setProductSelected(serviceProduct))
      dispatchAction(updateCurrentStep(1))
      navigate(`/customer/create-order/${response.order_id}?refinement=true`, {
        state: {
          patientId: patientDetailsResponse?.patient_details?.id,
          fromProfile: true,
          showRefinementInstructions: true,
        },
      })
    } catch {
      ErrorToast('Failed to create refinement order. Please try again.')
    }
  }

  const getButtonText = (orderStatus: string | undefined | null) => {
    if (orderStatus === undefined || orderStatus === null) return 'Create New Order'
    if (orderStatus === 'DRAFT') return 'Continue Draft'
    return orderList?.length > 0 ? 'New Refinement' : 'Start Refinement'
  }

  return (
    <>
      <ConfirmRefinementModal
        open={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleStartRefinement}
        loading={creatingOrder}
      />
      <div className='flex items-center gap-2 md:gap-3'>
        {orderList.map((option: string, index: number) => (
          <button
            key={option}
            onClick={() => {
              dispatchAction(
                getPatientPlanningStepper({
                  order_id: option,
                  patient_id: safeParseInt(patientId),
                  doctor_id: safeParseInt(userId),
                })
              )
              const payload = {
                patient_id: safeParseInt(patientId),
                doctor_id: safeParseInt(userId),
                treatment_subtype: 'ALIGNERS',
                order_id: option ?? null,
              }
              dispatchAction(getNewTreatmentList(payload))

              navigate(`${profileBasePath}/${patientId}/plans?order_id=${option}`)
              dispatchAction(setSelectedOrderId(option))
              dispatchAction(setActivePlanningStep('ORDER_DETAILS'))
            }}
            className={clsx(
              'px-3 md:px-4 py-1 md:py-1.5 rounded-lg border text-xs md:text-sm font-semibold transition-colors uppercase tracking-wide whitespace-nowrap',
              selectedOrderId === option
                ? 'bg-primaryColor text-white border-primaryColor'
                : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
            )}
          >
            {index === 0 ? 'Initial Plan' : 'Refinement'} {index === 0 ? '' : index}
          </button>
        ))}

        {isPractice && (
          <button
            className='flex items-center gap-1 text-sm font-semibold text-primaryColor hover:underline'
            onClick={handleNewRefinementClick}
          >
            <span>+</span>
            {getButtonText(planning_stepper?.order_status)}
          </button>
        )}
      </div>
    </>
  )
}

export default OrderButtons
