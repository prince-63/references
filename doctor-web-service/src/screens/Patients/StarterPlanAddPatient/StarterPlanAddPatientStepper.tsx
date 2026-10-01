import {useState, useEffect, useContext, useCallback} from 'react'
import {useNavigate, useSearchParams} from 'react-router-dom'
import {Steps} from 'antd'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import useDispatchAction from '@hooks/useDispatchAction'
import {resetPatientDetails} from 'redux/Slices/AppSlice/orders/orders.slice'
import {
  resetCaseRecordState,
  resetFilesUploadStatus,
} from 'redux/Slices/AppSlice/CaseRecords/CaseRecords.slice'
import {
  resetTreatmentPlan,
  getTreatmentPlanList,
  getTreatmentPlan,
  setTreatmentPlanBraces,
} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileTreatmentPlan.slice'
import {AuthContext} from 'context/AuthContext'
import {resetPrescriptionState} from 'redux/Slices/AppSlice/Prescription/Prescription.slice'
import CommonSVG from 'components/atom/SVG/CommonSVG'
import PatientDetailsStep from './steps/PatientDetailsStep'
import {PrescriptionSelector} from './steps/PrescriptionSelector'
import TreatmentPlanStep from './steps/TreatmentPlanStep'
import ProductionDetailsStep from './steps/ProductionDetailsStep'
import StartTreatmentStep from './steps/StartTreatmentStep'
import {SVG_CHECKED_GREEN} from 'utils/SvgConstants'
import {CustomNavigateContext} from 'context/CustomNavigationContext'
import {CaseFilesSelector} from './steps/CaseFilesSelector'
import {useMediaQuery} from 'react-responsive'
import clsx from 'clsx'
import useProfileBasePath from '@hooks/useProfileBasePath'
import cn from '@utils/cn'
import {setCurrentStep} from 'redux/Slices/AppSlice/StarterPlanUserAddPatientStepper/StarterPlanUserAddPatientStepper.slice'
import {safeParseInt} from 'utils/ConstFunctions'

const {Step} = Steps

type TreatmentTemplate = 'ALIGNER' | 'ORTHO'

const StarterPlanAddPatientStepper = () => {
  const navigate = useNavigate()
  const profileBasePath = useProfileBasePath()
  const [searchParams] = useSearchParams()
  const {dispatchAction} = useDispatchAction()
  const {userId} = useContext(AuthContext)

  // NEW: use CustomNavigateContext to control blocking for quit modal
  const {setShouldBlock} = useContext(CustomNavigateContext)

  const initialStepParam = searchParams.get('step')
  const patientId = searchParams.get('patient_id')

  // Treatment type is now picked only via CTAs on step 4
  const [selectedTemplate, setSelectedTemplate] = useState<TreatmentTemplate | null>(null)

  const [isLoadingTreatmentPlan, setIsLoadingTreatmentPlan] = useState(false)
  const [patientData, setPatientData] = useState<any>(null)
  const isMobile = useMediaQuery({query: '(max-width: 768px)'})
  const {treatmentPlan} = useSelector((state: RootState) => state.leadsProfileTreatmentPlanReducer)
  const {currentStep} = useSelector((state: RootState) => state.starterPlanPatientAddStepper)
  const [hasVisitedProduction, setHasVisitedProduction] = useState(false)
  const isTreatmentPlanReady = Boolean(treatmentPlan?.treatment_plan_id)
  const hasPatientId = Boolean(patientId)
  const isStepDisabled = (index: number) => {
    if ((index === 1 || index === 2) && hasPatientId) return false
    if (index === 3) return !isTreatmentPlanReady
    if (index === 4) return !isTreatmentPlanReady
    if (index === 5) return !hasVisitedProduction
    return index > currentStep
  }
  const handleStepChange = (step: number) => {
    if (isStepDisabled(step)) return
    dispatchAction(setCurrentStep(step))
  }

  useEffect(() => {
    dispatchAction(setCurrentStep(initialStepParam ? parseInt(initialStepParam, 10) : 0))
  }, [initialStepParam])

  // Reset treatment only when starting from step 0 (fresh flow)
  useEffect(() => {
    if (!initialStepParam || initialStepParam === '0') {
      dispatchAction(resetTreatmentPlan())
      dispatchAction(setTreatmentPlanBraces(null))
    }
  }, [])

  // Resume flow: fetch treatment plan if landing directly on step 3 or beyond
  useEffect(() => {
    const stepNum = initialStepParam ? parseInt(initialStepParam, 10) : 0

    if (stepNum >= 3 && userId) {
      setIsLoadingTreatmentPlan(true)

      dispatchAction(
        getTreatmentPlanList({
          doctor_id: userId,
          patient_id: patientId!,
          treatment_subtype: 'ALIGNERS',
        })
      )
        .unwrap()
        .then((response: any) => {
          const plans = Array.isArray(response) ? response : response?.data || []

          const latestPlan = plans.find(
            (p: any) =>
              p.treatment_status === 'ACTIVE' ||
              p.treatment_status === 'DRAFT' ||
              p.status === 'ACTIVE' ||
              p.status === 'DRAFT'
          )

          if (latestPlan?.treatment_plan_id) {
            return dispatchAction(
              getTreatmentPlan({
                aligner_treatment_id: String(latestPlan.treatment_plan_id),
              })
            ).unwrap()
          } else {
            setIsLoadingTreatmentPlan(false)
            return Promise.reject('No treatment plan found')
          }
        })
        .then((plan: any) => {
          // If we can infer type from plan, preselect the CTA
          if (plan?.aligner_details_meta_data) {
            setSelectedTemplate('ALIGNER')
          } else {
            setSelectedTemplate('ORTHO')
          }
          setIsLoadingTreatmentPlan(false)
        })
        .catch((error: any) => {
          console.error('Error fetching treatment plan:', error)
          setIsLoadingTreatmentPlan(false)
        })
    }
  }, [initialStepParam, userId])

  useEffect(() => {
    if (isLoadingTreatmentPlan && treatmentPlan?.treatment_plan_id) {
      setIsLoadingTreatmentPlan(false)
    }
  }, [treatmentPlan, isLoadingTreatmentPlan])
  useEffect(() => {
    if (
      Array.isArray(treatmentPlan?.manufacturing_details) &&
      treatmentPlan.manufacturing_details.length > 0
    ) {
      setHasVisitedProduction(true)
    }
  }, [treatmentPlan?.manufacturing_details])

  // 🔐 Turn on navigation blocking for steps 2–6 (index 1–5)
  useEffect(() => {
    const shouldBlockNow = currentStep >= 1 && currentStep <= 5
    setShouldBlock(shouldBlockNow)

    return () => {
      // On unmount, always clear blocking
      setShouldBlock(false)
    }
  }, [currentStep, setShouldBlock])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      dispatchAction(resetCaseRecordState())
      dispatchAction(resetFilesUploadStatus())
      dispatchAction(resetPatientDetails())
      dispatchAction(resetTreatmentPlan())
      dispatchAction(resetPrescriptionState())
    }
  }, [])

  const handlePatientCreated = (newPatientId: number, data: any) => {
    setPatientData(data)

    // Persist patient_id (and optional order_id) in the URL for downstream steps/refreshes
    const params = new URLSearchParams(searchParams)
    params.set('patient_id', String(newPatientId))
    navigate(`/add-patient-starter?${params.toString()}`, {replace: true})
    dispatchAction(setCurrentStep(1))
  }

  const handlePrescriptionNext = () => {
    dispatchAction(setCurrentStep(3))
    dispatchAction(resetTreatmentPlan())
  }

  // After selecting an existing prescription → move to Treatment Plan.
  const handleExistingPrescriptionComplete = () => {
    dispatchAction(setCurrentStep(3))
  }

  const handleProductionComplete = useCallback(() => {
    setHasVisitedProduction(true)
  }, [])

  const renderPrescriptionStepContent = () => {
    return (
      <PrescriptionSelector
        onComplete={handleExistingPrescriptionComplete}
        onBack={() => dispatchAction(setCurrentStep(1))}
        onCancel={() => dispatchAction(setCurrentStep(1))}
        iframeClassName='block w-full border-0 min-h-[50vh] md:min-h-[700px] p-4 h-auto overflow-scroll'
        useFooter={true}
        onPrescriptionCreated={handlePrescriptionNext}
      />
    )
  }

  const steps = [
    {
      title: 'Patient details',
      content: <PatientDetailsStep onNext={handlePatientCreated} patientDataProp={patientData} />,
    },
    {
      title: 'Case Files',
      content: <CaseFilesSelector />,
    },
    {
      title: 'Prescription',
      content: renderPrescriptionStepContent(),
    },
    {
      title: 'Treatment Plan',
      content: (
        <TreatmentPlanStep
          treatmentType={selectedTemplate}
          onTreatmentTypeChange={setSelectedTemplate}
          patientIdProp={safeParseInt(patientId)}
        />
      ),
    },
    {
      title: 'Production details',
      content: (
        <ProductionDetailsStep
          onNext={() => {
            handleProductionComplete()
            dispatchAction(setCurrentStep(5))
          }}
          onProductionReady={handleProductionComplete}
          patientIdProp={safeParseInt(patientId)}
          treatmentPlanProp={treatmentPlan}
        />
      ),
    },
    {
      title: 'Start treatment',
      content: (
        <StartTreatmentStep
          onFinish={() => navigate(`${profileBasePath}/${patientId}`)}
          treatmentType={selectedTemplate || 'ALIGNER'}
          patientIdProp={safeParseInt(patientId)}
        />
      ),
    },
  ]

  return (
    <div className='flex flex-col md:flex-row h-screen'>
      {/* Sidebar */}
      <div
        className={clsx(
          'md:w-64 bg-white flex flex-col',
          isMobile ? '' : ' border-r border-mediumGray '
        )}
      >
        <div className=' border-b border-mediumGray p-4'>
          <h1 className='text-xl font-semibold'>Add patient</h1>
          {patientData && (
            <div className='text-sm text-gray-500 mt-1'>
              Patient:{' '}
              <span className='font-medium text-black'>
                {patientData.first_name} {patientData.last_name}
              </span>
            </div>
          )}
        </div>
        <div className='flex flex-col md:flex-row mx-auto w-full gap-2  md:w-3/4 px-2 md:px-0  mt-4'>
          <div className='flex flex-col gap-6'>
            <div className='hidden md:block'>
              <Steps
                direction='vertical'
                current={currentStep}
                size='small'
                onChange={handleStepChange}
              >
                {steps.map((item, index) => {
                  // Hide production and start treatment steps for braces
                  if ((index === 4 || index === 5) && selectedTemplate === 'ORTHO') return null

                  return (
                    <Step
                      key={index}
                      title={item.title}
                      disabled={isStepDisabled(index)}
                      icon={
                        index < currentStep ? (
                          <CommonSVG
                            svg={SVG_CHECKED_GREEN}
                            width='24'
                            height='24'
                            className='text-primaryColor'
                          />
                        ) : null
                      }
                    />
                  )
                })}
              </Steps>
            </div>
            <div className='flex md:hidden overflow-x-auto'>
              <Steps
                direction={'horizontal'}
                current={currentStep}
                size='small'
                responsive={false}
                onChange={handleStepChange}
                className='min-w-[250vw] flex overflow-x-auto'
              >
                {steps.map((item, index) => {
                  // Hide production and start treatment steps for braces
                  if ((index === 4 || index === 5) && selectedTemplate === 'ORTHO') return null

                  return (
                    <Step
                      key={index}
                      title={item.title}
                      disabled={isStepDisabled(index)}
                      icon={
                        index < currentStep ? (
                          <CommonSVG
                            svg={SVG_CHECKED_GREEN}
                            width='24'
                            height='24'
                            className='text-primaryColor'
                          />
                        ) : null
                      }
                    />
                  )
                })}
              </Steps>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div
        className={cn(
          'w-full flex flex-col flex-1 md:h-screen relative overflow-y-auto px-2 md:min-h-fit pb-8'
        )}
      >
        {isLoadingTreatmentPlan ? (
          <div className='flex flex-col items-center justify-center p-12'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primaryColor mb-4'></div>
            <p className='text-gray-600'>Loading treatment plan data...</p>
          </div>
        ) : (
          steps[currentStep].content
        )}
      </div>
    </div>
  )
}

export default StarterPlanAddPatientStepper
