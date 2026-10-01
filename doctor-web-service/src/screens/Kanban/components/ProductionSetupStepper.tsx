import React, {useEffect, useMemo, useRef, useState} from 'react'
import {Steps, ConfigProvider} from 'antd'
import {useLocation, useNavigate, useParams} from 'react-router-dom'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import getColorPalette from 'utils/getColorPalette'
import HeaderTitle from 'components/header/HeaderTitle'
import ProductionTypeStep from './steps/ProductionTypeStep'
import ManufacturingSetup from '../screens/ProductionSetup/components/ManufacturingSetup'
import STLFiles from '../screens/ProductionSetup/components/STLFiles'
import ShippingForm from '../screens/ProductionSetup/components/ShippingForm'
import ChecklistWithProgress from '../../PatientDetailsOverview.tsx/components/ChecklistWithProgress'
import {
  setClearProductionSetupData,
  setInstructions,
  setProductSelected,
  setProductType,
} from 'redux/Slices/AppSlice/ProductionSetup/Production.slice'
import useDispatchAction from '@hooks/useDispatchAction'
import {AuthContext} from 'context/AuthContext'
import {
  getTreatmentPlan,
  resetTreatmentPlan,
} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileTreatmentPlan.slice'
import {ITreatmentPlan} from 'screens/Patients/LeadsProfile/main/treatment/types/treatmentPlan.types'
import {allFile} from 'redux/Slices/AppSlice/LeadsProfile/LeadsFiles.Slice'
import {safeParseInt} from 'utils/ConstFunctions'
import {getIndividualTask} from 'redux/Slices/AppSlice/workflow/workflow.slice'
import {clearProductionTaskList} from 'redux/Slices/AppSlice/Profile/Profile.slice'
import useAllUserPlan from '@hooks/useAllUserPlan'
import ProductionSetupReview from '../screens/ProductionReview/ProductionSetupReview'
import ProductionStepperActions from './ProductionStepperActions'
import {getLeadsProfileDetails} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileDetails.slice'
import {clearOrder, getVendorsList} from 'redux/Slices/AppSlice/orders/orders.slice'
import {Product} from '../screens/ProductionSetup/SelectTaskManufacturingType'

const colors = getColorPalette()

const ProductionSetupStepper: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const {patientId, treatmentId} = useParams()
  const {isPractice, isEnterprisePlanUser} = useAllUserPlan()
  const searchParamsInit = new URLSearchParams(location.search)
  const initialStep = Number(searchParamsInit.get('step') ?? '0')
  const [current, setCurrent] = useState(Number.isFinite(initialStep) ? initialStep : 0)
  const sessionResetRef = useRef<string | null>(null)
  const skipNextUrlSyncRef = useRef(false)
  const {dispatchAction} = useDispatchAction()
  const {productSelected, productType, instructions} = useSelector(
    (s: RootState) => s.productionSetup
  )
  const {userId, organizationId} = React.useContext(AuthContext)
  const rawTask = useSelector((s: RootState) => s.workFlow.getIndividualTaskList)
  const prefillState = (location.state as any)?.prefill
  const queryPrefill = new URLSearchParams(location.search).get('prefill')
  const isNextBatchPrefill = prefillState === 'next-batch' || queryPrefill === 'next-batch'
  const {plansList} = useSelector((state: RootState) => state.kanban)
  const [makeUnableManufacturing, setMakeUnableManufacturing] = useState(false)
  const existingCaseSelectedProduct = plansList?.plans_list?.find(
    (plan) => String(plan.plan_id) === String(treatmentId)
  )?.manufacturing_service_product

  const task: any = useMemo(() => {
    if (!rawTask) return null
    const candidate = Array.isArray(rawTask) ? rawTask[0] : rawTask
    const candidatePatientId = safeParseInt(
      candidate?.patient_id ?? candidate?.patient_details?.id ?? candidate?.patient?.id
    )
    const currentPatientId = safeParseInt(patientId)
    if (candidatePatientId && currentPatientId && candidatePatientId !== currentPatientId) {
      return null
    }
    return candidate
  }, [rawTask, patientId])

  const taskProduct = useMemo(() => {
    const base = (task?.service_products ??
      task?.manufacturing_products ??
      existingCaseSelectedProduct ??
      null) as Product | null
    if (!base) return null
    if (!!base && base.product_type === 'SERVICE') return null
    const taskProductName =
      typeof task?.product_name === 'string' && task.product_name.trim()
        ? task.product_name
        : base.product_name
    return {
      ...base,
      product_name: taskProductName,
      product_type: (task?.product_type as Product['product_type']) ?? base.product_type,
      product_description:
        task?.product_description !== undefined
          ? task.product_description
          : base.product_description,
      product_image: task?.product_image !== undefined ? task.product_image : base.product_image,
    }
  }, [task, existingCaseSelectedProduct])

  const [prevSelectedProduct, setPrevSelectedProduct] = useState<Product | null>(taskProduct)
  const productionSessionKey = `${patientId ?? ''}:${treatmentId ?? ''}`

  useEffect(() => {
    if (sessionResetRef.current === productionSessionKey) return

    sessionResetRef.current = productionSessionKey
    skipNextUrlSyncRef.current = true

    const sp = new URLSearchParams(location.search)
    const stepFromUrl = Number(sp.get('step') ?? '0')
    const nextStep = Number.isFinite(stepFromUrl) ? stepFromUrl : 0

    dispatchAction(setClearProductionSetupData())
    dispatchAction(clearProductionTaskList())
    dispatchAction(resetTreatmentPlan())
    dispatchAction(clearOrder())
    setMakeUnableManufacturing(false)
    setPrevSelectedProduct(null)
    setCurrent(nextStep)
  }, [dispatchAction, location.search, productionSessionKey])

  useEffect(() => {
    dispatchAction(setProductSelected(taskProduct))
    dispatchAction(setProductType('IN_HOUSE'))
    setPrevSelectedProduct(taskProduct)
  }, [dispatchAction, taskProduct])

  useEffect(() => {
    if (!treatmentId) return
    dispatchAction(
      getTreatmentPlan({
        aligner_treatment_id: String(treatmentId),
      })
    )
  }, [dispatchAction, treatmentId])

  useEffect(() => {
    if (!organizationId || !patientId || !userId) return
    dispatchAction(
      getLeadsProfileDetails({
        patient_id: safeParseInt(patientId),
        doctor_id: safeParseInt(userId),
      })
    )
    dispatchAction(
      getVendorsList({
        doctor_id: safeParseInt(userId),
        isInternalUserToShow: false,
      })
    )

    dispatchAction(
      getIndividualTask({
        doctor_id: safeParseInt(userId),
        patient_id: safeParseInt(patientId),
        organization_id: safeParseInt(organizationId),
      })
    )
  }, [organizationId, patientId, userId])

  const taskServiceProduct = task?.service_products
  const taskWorkflowName: string | undefined = task?.workflow_name

  const isEmptyObject = (obj: any) =>
    obj && typeof obj === 'object' && Object.keys(obj).length === 0

  const shouldShowPreselectedProductFromWorkflow =
    taskServiceProduct &&
    !isEmptyObject(taskServiceProduct) &&
    (taskWorkflowName === 'Planning In House' || taskWorkflowName === 'Plan Outsourced')

  useEffect(() => {
    if (shouldShowPreselectedProductFromWorkflow && taskServiceProduct) {
      dispatchAction(setProductType('IN_HOUSE' as any))
      dispatchAction(setProductSelected(taskProduct))
      setPrevSelectedProduct(
        taskProduct?.product_category_name === 'ALIGNERS(PLANNING + MANUFACTURING)'
          ? taskProduct
          : null
      )
    }
  }, [shouldShowPreselectedProductFromWorkflow, taskServiceProduct, taskProduct, dispatchAction])

  useEffect(() => {
    if (!isNextBatchPrefill) return
    const candidate = productSelected || taskProduct
    if (candidate && !isEmptyObject(candidate)) {
      if (!productSelected) dispatchAction(setProductSelected(candidate))
      if (!productType) dispatchAction(setProductType('IN_HOUSE' as any))
    }
  }, [isNextBatchPrefill, taskProduct, productSelected, productType, dispatchAction])

  const steps = useMemo(
    () =>
      productType === 'OUTSOURCE' || isPractice || isEnterprisePlanUser
        ? [
            {id: 'setup', title: 'Production Setup'},
            {id: 'batch', title: 'Batch Configuration'},
            {id: 'stl', title: 'STL Files'},
            {id: 'shipping', title: 'Shipping Address'},
            {id: 'instructions', title: 'Production Instructions'},
            {id: 'review', title: 'Review & Finalize'},
          ]
        : [
            {id: 'setup', title: 'Production Setup'},
            {id: 'batch', title: 'Batch Configuration'},
            {id: 'stl', title: 'STL Files'},
            {id: 'instructions', title: 'Production Instructions'},
            {id: 'review', title: 'Review & Finalize'},
          ],
    [productType]
  )

  const items = useMemo(() => steps.map((s) => ({title: s.title})), [steps])

  useEffect(() => {
    setCurrent((c) => Math.min(c, steps.length - 1))
  }, [steps.length])

  useEffect(() => {
    const sp = new URLSearchParams(location.search)
    const prev = sp.get('step')
    const next = String(current)
    if (skipNextUrlSyncRef.current) {
      skipNextUrlSyncRef.current = false
      return
    }
    if (prev !== next) {
      sp.set('step', next)
      navigate(`${location.pathname}?${sp.toString()}`, {replace: true, state: location.state})
    }
  }, [current, navigate, location.pathname, location.search, location.state])

  useEffect(() => {
    return () => {
      dispatchAction(setClearProductionSetupData())
      dispatchAction(clearProductionTaskList())
      dispatchAction(resetTreatmentPlan())
      dispatchAction(clearOrder())
    }
  }, [dispatchAction])

  const getPlanData = () => {
    dispatchAction(
      getTreatmentPlan({
        aligner_treatment_id: String(treatmentId),
      })
    )
      .unwrap()
      .then((res: ITreatmentPlan) => {
        dispatchAction(
          allFile({
            doctor_id: String(userId),
            patient_id: String(patientId),
            path: `/Orders/STL ${res?.treatment_plan_name + res.treatment_plan_id}`,
          })
        )
      })
  }

  const stepId = steps[current]?.id
  const headerTitle = `${steps[current]?.title ?? ''}`

  const setManufacturingForAll = (value: boolean) => {
    setMakeUnableManufacturing(value)
  }

  return (
    <div className='grid grid-cols-1 md:grid-cols-[260px_1fr] md:gap-4 pb-[150px] md:pb-[70px]'>
      <div className='md:sticky md:top-0 md:self-start'>
        <HeaderTitle title='Production Setup' subTitle='Review key details.' />
        <div className='bg-white rounded-lg p-3 md:p-4'>
          <ConfigProvider
            theme={{
              token: {colorPrimary: colors.primaryColor, fontFamily: 'figtree', fontSize: 12},
            }}
          >
            <Steps
              direction='vertical'
              current={current}
              items={items}
              onChange={(i) => setCurrent(i)}
            />
          </ConfigProvider>
        </div>
      </div>

      <div className='md:mt-2'>
        <div className='md:mb-3'>
          <h2 className='text-xl font-semibold md:mt-16'>{headerTitle}</h2>
        </div>

        {stepId === 'setup' && (
          <ProductionTypeStep
            key={`setup-${productionSessionKey}`}
            prevSelectedProduct={prevSelectedProduct}
          />
        )}
        {stepId === 'batch' && (
          <ManufacturingSetup
            key={`batch-${productionSessionKey}`}
            setManufacturingForAll={setManufacturingForAll}
          />
        )}
        {stepId === 'stl' && (
          <STLFiles key={`stl-${productionSessionKey}`} refreshData={getPlanData} />
        )}
        {stepId === 'shipping' && <ShippingForm key={`shipping-${productionSessionKey}`} />}

        {stepId === 'instructions' && (
          <div className='space-y-4  pb-[50px] md:pb-0'>
            <div className='rounded-lg border bg-white'>
              <ChecklistWithProgress />
            </div>
            <div className='rounded-lg border p-4 bg-white'>
              <div className='text-sm text-neutral-600 mb-2'>
                Add specific instructions for the production team
              </div>
              <textarea
                value={instructions}
                onChange={(e) => dispatchAction(setInstructions(e.target.value))}
                placeholder='Provide any specific instructions here'
                className='min-h-[160px] w-full resize-y rounded-2xl border border-neutral-300 bg-white p-4 text-sm outline-none ring-violet-600 focus:ring-2'
              />
            </div>
          </div>
        )}

        {stepId === 'review' && <ProductionSetupReview key={`review-${productionSessionKey}`} />}
      </div>

      <ProductionStepperActions
        current={current}
        items={items}
        setCurrent={setCurrent}
        steps={steps}
        makeUnableManufacturing={makeUnableManufacturing}
      />
    </div>
  )
}

export default ProductionSetupStepper
