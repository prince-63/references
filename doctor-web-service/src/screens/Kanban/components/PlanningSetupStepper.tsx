import React, {useCallback, useContext, useEffect, useMemo, useState} from 'react'
import {useLocation, useNavigate, useParams} from 'react-router-dom'
import {Formik, Form as FormikForm} from 'formik'
import {Layout, Spin} from 'antd'
import {Content} from 'antd/es/layout/layout'
import {useSelector} from 'react-redux'
import AntdButton from 'components/atom/Buttons/AntdButton'
import {RootState} from 'redux/store'
import {AuthContext} from 'context/AuthContext'
import useDispatchAction from '@hooks/useDispatchAction'
import {
  resetPlanningProductSelection,
  setPlanningAssigneeSelected,
  setPlanningProductType,
  setProductType,
} from 'redux/Slices/AppSlice/ProductionSetup/Production.slice'
import {getVendorsList, cloneOrderV2} from 'redux/Slices/AppSlice/orders/orders.slice'
import {changeWorkFlow, getKanbanCountsByProfile} from 'redux/Slices/AppSlice/Kanban/Kanban.slice'
import {updateAssignee} from 'redux/Slices/AppSlice/accessControl/AccessControl.slice'
import SuccessToast from 'components/modal/Alert/SuccessToast'
import {safeParseInt} from 'utils/ConstFunctions'
import caseTypes from '@constants/caseTypes'
import useAllUserPlan from '@hooks/useAllUserPlan'
import FlowSelector from './PlanningSetup/FlowSelector'
import InHouseSection from './PlanningSetup/InHouseSection'
import OutsourceSection from './PlanningSetup/OutsourceSection'
import CustomSection from './PlanningSetup/CustomSection'
import {CaseType, CustomPlanningMode} from './PlanningSetup/types'
import useCreateOrder from '@hooks/useCreateOrder'
import ErrorToast from 'components/modal/Alert/ErrorToast'
import Spinner from 'components/spinner/Spinner'
import {getLeadsProfileDetails} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileDetails.slice'

type LocationState = {
  useIndividualTask?: boolean
}

const PlanningSetupStepper: React.FC = () => {
  const navigate = useNavigate()
  const {patientId: patientIdParam} = useParams()
  const {profileId, userId, organizationId} = useContext(AuthContext)
  const {dispatchAction} = useDispatchAction()
  const location = useLocation() as {state?: LocationState; search: string}
  const {handleCreateOrder} = useCreateOrder()
  const useIndividualTask = Boolean(location.state?.useIndividualTask)
  const {loadingActiveVendors} = useSelector((state: RootState) => state.orders)
  const {cardDetails} = useSelector((state: RootState) => state.kanban)
  const {getIndividualTaskList} = useSelector((state: RootState) => state.workFlow)
  const {isGrowthPlanUser} = useAllUserPlan()
  const {
    planningProductType,
    planningProductSelected,
    planningAssigneeSelected,
    manufacturingProductSelected,
    productList,
  } = useSelector((state: RootState) => state.productionSetup)
  const patientId = useMemo(
    () => safeParseInt(patientIdParam) || safeParseInt(cardDetails?.patient_id),
    [patientIdParam, cardDetails?.patient_id]
  )
  const customerOrderIdParam = useMemo(
    () => new URLSearchParams(location.search).get('customerOrderId'),
    [location.search]
  )

  const {search} = useLocation()
  const params = new URLSearchParams(search)
  const isPurchaseOrderType = params.get('orderType') === 'purchase-order'
  const [flow, setFlow] = useState<CaseType>(isGrowthPlanUser ? 'IN_HOUSE' : 'OUTSOURCE')
  const [customFlow, setCustomFlow] = useState<CustomPlanningMode>('IN_HOUSE')

  const {data: patientDetailsResponse} = useSelector(
    (state: RootState) => state.apiGetLeadsProfileDetails
  )

  const assignedPractice = patientDetailsResponse?.patient_details?.assigned_practice

  useEffect(() => {
    dispatchAction(resetPlanningProductSelection())
    dispatchAction(setPlanningProductType(isGrowthPlanUser ? 'IN_HOUSE' : 'OUTSOURCE'))
    dispatchAction(setPlanningAssigneeSelected(safeParseInt(profileId)))
    dispatchAction(
      getLeadsProfileDetails({
        doctor_id: safeParseInt(userId),
        patient_id: patientId,
      }) as any
    )
    dispatchAction(
      getVendorsList({
        doctor_id: safeParseInt(userId),
        withoutOwnDoctor: true,
      })
    )
  }, [])

  const handleFlowChange = useCallback(
    (flowType: CaseType) => {
      dispatchAction(resetPlanningProductSelection())
      setFlow(flowType)
      dispatchAction(setProductType(flowType as any))
      dispatchAction(setPlanningProductType(flowType === 'CUSTOM' ? 'IN_HOUSE' : flow))
      flowType === 'CUSTOM' && setCustomFlow('IN_HOUSE')
    },
    [dispatchAction]
  )

  // MAIN SUBMIT
  const handleSubmit = async () => {
    if (planningProductType === 'OUTSOURCE') {
      await handleSubmitOutsource()
    } else {
      await handleSubmitInHouse()
    }
  }

  // INHOUSE SUBMIT
  const handleSubmitInHouse = async () => {
    if (!planningAssigneeSelected) {
      ErrorToast('Please Select Assignee')
      return
    }
    const payloadUpdate: any = {
      task_id: useIndividualTask ? getIndividualTaskList?.id : cardDetails?.id,
      assignee_id: safeParseInt(planningAssigneeSelected),
      manufacturing_products: manufacturingProductSelected,
    }
    await dispatchAction(updateAssignee(payloadUpdate as any)).unwrap()

    const payloadChange: any = {
      manufacturing_id: null,
      order_type: 'ALIGNER',
      workflow_name: 'Planning In House',
      workflow_status_name: 'TO DO',
      order_id: null,
      patient_id: patientId,
      profile_id: profileId,
      lab_work_flow_name: null,
      lab_order_type: null,
      lab_workflow_status_name: null,
      case_type: 'IN_HOUSE_MANUFACTURING',
      lab_profile_id: null,
      organization_id: organizationId,
      doctor_id: userId,
      task_id: useIndividualTask ? getIndividualTaskList?.id : cardDetails?.id,
      service_product_id: productList?.owner_products[0]?.id,
      service_product: productList?.owner_products[0],
    }

    // payloadChange.service_products = planningProductSelected
    // payloadChange.serviceProductId = planningProductSelected?.id ?? null

    await dispatchAction(changeWorkFlow(payloadChange as any))
      .unwrap()
      .then(() => {
        dispatchAction(getKanbanCountsByProfile({profile_id: Number(profileId)}))
      })
    dispatchAction(resetPlanningProductSelection())
    SuccessToast('Case moved to In-House Planning')
    navigate('/aligner-orders?workFlow=planning-in-house')
  }

  // OUTSOURCE SUBMIT
  const handleSubmitOutsource = async () => {
    if (!planningProductSelected) {
      ErrorToast('Please Select product')
      return
    }
    if (isPurchaseOrderType) {
      await cloneOrderCall()
      return
    }
    await handleCreateOrderCall()
  }

  // Clone Order ( Purchase Order by enterprise)
  const cloneOrderCall = async () => {
    if (!customerOrderIdParam) return
    await dispatchAction(
      cloneOrderV2({
        customer_order_id: customerOrderIdParam,
        doctor_id: safeParseInt(userId),
        profile_id: safeParseInt(profileId),
        organization_id: safeParseInt(organizationId),
        receiver_doctor_id: safeParseInt(planningProductSelected?.doctor_id),
        receiver_profile_id: safeParseInt(planningProductSelected?.profile_id),
        receiver_organization_id: safeParseInt((planningProductSelected as any)?.organization_id),
        sender_doctor_id: safeParseInt(userId),
        sender_profile_id: safeParseInt(profileId),
        sender_organization_id: safeParseInt(organizationId),
        order_type: 'PLANNING_ORDER',
        service_products: planningProductSelected,
      })
    )
      .unwrap()
      .then(() => {
        dispatchAction(resetPlanningProductSelection())
        navigate('/aligner-orders?workFlow=planning-outsource')
      })
  }

  // Order Create
  const handleCreateOrderCall = async () => {
    const payload = {
      order_details: {
        lab_id: safeParseInt(profileId),
        lab_organization_id: safeParseInt(organizationId),
        lab_doctor_id: safeParseInt(userId),
        order_type:
          planningProductSelected?.product_type === 'ALIGNER' ? 'ALIGNER_ORDER' : 'PLANNING_ORDER',
        due_by: null,
        delivery_preference: 'IN_BATCHES',
        target_user_details: {
          profile_id: safeParseInt(planningProductSelected?.profile_id),
          organization_id: safeParseInt(planningProductSelected?.organization_id),
          doctor_id: safeParseInt(planningProductSelected?.doctor_id),
        },
      },
      status: 'DRAFT',
      doctor_id: userId,
      current_step: 1,
      organization_id: safeParseInt(organizationId),
      profile_id: safeParseInt(profileId),
      service_products: planningProductSelected,
      case_type: caseTypes.OUTSOURCED_PLANNING_ORDER,
      practice_doctor_id: safeParseInt(assignedPractice?.practice_doctor_id),
      practice_profile_id: safeParseInt(assignedPractice?.practice_profile_id),
      practice_organization_id: safeParseInt(assignedPractice?.practice_organization_id),
      patient_id: patientId,
      service_product_id: !!planningProductSelected && planningProductSelected?.id,
    }
    const response = await handleCreateOrder({
      orderPayload: payload,
      product: planningProductSelected,
      assignedCustomer: assignedPractice,
    })

    const queryParams = new URLSearchParams({
      is_aligner_order: planningProductSelected?.product_type === 'ALIGNER' ? 'true' : 'false',
    }).toString()

    navigate(`/orders/create-order/${response.order_id}?${queryParams}`, {
      state: {patientId},
    })
    dispatchAction(resetPlanningProductSelection())
  }

  return (
    <Formik
      initialValues={{}}
      onSubmit={async (_, {setSubmitting}) => {
        try {
          if (!flow) return
          await handleSubmit()
        } finally {
          setSubmitting(false)
        }
      }}
    >
      {({isSubmitting}) => {
        return (
          <FormikForm className='w-full'>
            <Spin indicator={<Spinner loading />} spinning={loadingActiveVendors}>
              <Layout className='flex flex-col flex-1 min-h-0 w-full'>
                <Content className='bg-white flex-1 overflow-y-auto'>
                  <div className='px-4 pt-4 pb-40 sm:pb-32 md:pb-28'>
                    <div className='flex flex-col gap-2 mb-4'>
                      <div className='flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-3'>
                        <div>
                          <div className='font-semibold text-2xl'>
                            {`Choose how you'd like to go ahead.`}
                          </div>
                          <div className='text-base text-textColor'>
                            {`Select how you want to handle treatment planning and aligner production for this patient`}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className='flex flex-col gap-6'>
                      <FlowSelector value={flow} onChange={handleFlowChange} />

                      {flow === 'IN_HOUSE' && <InHouseSection />}

                      {flow === 'OUTSOURCE' && <OutsourceSection />}

                      {flow === 'CUSTOM' && (
                        <CustomSection customFlow={customFlow} setCustomFlow={setCustomFlow} />
                      )}
                    </div>
                  </div>
                </Content>

                <div className='fixed inset-x-0 bottom-0 bg-white border-t border-mediumGray'>
                  <div className='px-4 md:px-12 py-4'>
                    <div className='flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end md:me-12 me-4'>
                      <button
                        className='flex gap-2 items-center justify-center w-full sm:w-auto text-textColor border border-mediumGray text-base font-semibold px-4 py-3 rounded-lg'
                        type='button'
                        onClick={() => navigate(-1)}
                      >
                        Cancel
                      </button>
                      <AntdButton
                        text='Continue'
                        htmlType='submit'
                        className='w-full sm:w-auto text-base bg-primaryColor text-white hover:!bg-primarySupport hover:!text-primaryColor font-semibold px-6 py-3 min-h-12'
                        loading={isSubmitting}
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                </div>
              </Layout>
            </Spin>
          </FormikForm>
        )
      }}
    </Formik>
  )
}

export default PlanningSetupStepper
