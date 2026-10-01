import {useContext, useEffect} from 'react'
import {AlertCircle} from 'lucide-react'
import HeaderTitle from 'components/header/HeaderTitle'
import ManufacturingSetup from './components/ManufacturingSetup'
import SectionCard from './components/SectionCard'
import STLFiles from './components/STLFiles'
import {useNavigate, useParams} from 'react-router-dom'
import {AuthContext} from 'context/AuthContext'
import useDispatchAction from '@hooks/useDispatchAction'
import {getTreatmentPlan} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileTreatmentPlan.slice'
import TreatmentPlanDetails from './components/TreatmentPlanDetails'
import {ITreatmentPlan} from 'screens/Patients/LeadsProfile/main/treatment/types/treatmentPlan.types'
import {setInstructions, setShipping} from 'redux/Slices/AppSlice/ProductionSetup/Production.slice'
import {RootState} from 'redux/store'
import {useSelector} from 'react-redux'
import ShippingForm from './components/ShippingForm'
import {Button} from 'antd'
import {allFile} from 'redux/Slices/AppSlice/LeadsProfile/LeadsFiles.Slice'

const ProductionSetupPage = () => {
  const {patientId, treatmentId} = useParams()
  const {userId} = useContext(AuthContext)
  const {dispatchAction} = useDispatchAction()
  const navigate = useNavigate()
  const {productType} = useSelector((state: RootState) => state.productionSetup)
  const {cardDetails} = useSelector((state: RootState) => state.kanban)

  useEffect(() => {
    if (!cardDetails?.id) {
      navigate(`/aligner-orders?workFlow=planning-in-house`)
    }
    // If this legacy page is reached, redirect to stepper for consistent UX
    if (patientId && treatmentId) {
      navigate(`/production-setup-stepper/${patientId}/${treatmentId}`, {replace: true})
      return
    }
    dispatchAction(
      getTreatmentPlan({
        aligner_treatment_id: String(treatmentId),
      })
    )
  }, [treatmentId])

  const getPlanData = () => {
    dispatchAction(
      getTreatmentPlan({
        aligner_treatment_id: String(treatmentId),
      })
    )
      .unwrap()
      .then((res: ITreatmentPlan) => {
        dispatchAction(setShipping(res.shipping_details_response || null))
        dispatchAction(
          allFile({
            doctor_id: String(userId),
            patient_id: String(patientId),
            path: `/Orders/STL ${res?.treatment_plan_name + res.treatment_plan_id}`,
          })
        )
      })
  }
  return (
    <div className='flex flex-col gap-3'>
      <HeaderTitle
        {...{
          title: 'Production Setup',
          subTitle: 'Confirm how you want to manufacture this case.',
        }}
      />
      <div className='w-full flex flex-col gap-6 pb-28'>
        <TreatmentPlanDetails />
        <ManufacturingSetup />
        {productType === 'OUTSOURCE' && <ShippingForm />}
        <STLFiles refreshData={getPlanData} />
        <Instructions />
      </div>
      <FooterActions />
    </div>
  )
}

function Instructions() {
  const {dispatchAction} = useDispatchAction()
  const {instructions} = useSelector((state: RootState) => state.productionSetup)

  return (
    <SectionCard
      id='instructions'
      icon={<AlertCircle className='h-5 w-5' />}
      title='Instructions'
      subtitle='Add any specific instructions for the production team'
    >
      <textarea
        value={instructions}
        onChange={(e) => dispatchAction(setInstructions(e.target.value))}
        placeholder='Provide any specific instructions here'
        className='min-h-[160px] w-full resize-y rounded-2xl border border-neutral-300 bg-white p-4 text-sm outline-none ring-violet-600 focus:ring-2'
      />
    </SectionCard>
  )
}

function FooterActions() {
  const {patientId, treatmentId} = useParams()
  const navigate = useNavigate()
  const {manufacturingData} = useSelector((state: RootState) => state.productionSetup)

  return (
    <div className='fixed inset-x-0 bottom-0 border-t border-neutral-200 bg-white'>
      <div className='mx-auto flex items-center justify-end gap-3 px-4 py-3'>
        <div className='flex w-full sm:w-auto flex-col sm:flex-row justify-end gap-2'>
          <Button
            type='default'
            onClick={() => navigate(-1)}
            className='px-5 py-2.5 text-slate-700 bg-white ring-1 ring-slate-200 shadow-sm hover:!bg-slate-50'
          >
            Back
          </Button>
          <Button
            type='primary'
            className='px-6 py-2.5 font-semibold shadow-sm'
            disabled={!manufacturingData.total}
            onClick={() => {
              navigate(`/production-review/${patientId}/${treatmentId}`)
            }}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ProductionSetupPage
