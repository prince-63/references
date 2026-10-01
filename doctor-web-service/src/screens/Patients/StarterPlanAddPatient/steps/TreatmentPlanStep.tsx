import React, {useContext, useState, useEffect, useMemo} from 'react'
import {useNavigate} from 'react-router-dom'
import {Modal} from 'antd'
import {useSelector} from 'react-redux'
import SetupTreatmentPlan from 'screens/Patients/LeadsProfile/main/treatment/setUpTreatmentPlan/SetupTreatmentPlan'
import SetupTreatmentPlanBraces from 'screens/Patients/LeadsProfile/main/treatment/setupTreatmentPlanBraces/SetupTreatmentPlanBraces'
import userOrderDetails from 'screens/Orders/hooks/userOrderDetails'
import useDispatchAction from '@hooks/useDispatchAction'
import {postCreateTreatmentPlanBraces} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileTreatmentPlan.slice'
import {RootState} from 'redux/store'
import {getPatientDetails} from 'redux/Slices/AppSlice/Profile/Profile.slice'
import {safeParseInt} from 'utils/ConstFunctions'
import userTypes from '@constants/userTypes'
import {postApiLeadsProfileDetailsUpdate} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileUpdateDetails.slice'
import {AuthContext} from 'context/AuthContext'
import clsx from 'clsx'
import {setCurrentStep} from 'redux/Slices/AppSlice/StarterPlanUserAddPatientStepper/StarterPlanUserAddPatientStepper.slice'
import useServiceConfigurationState from 'screens/settings/services/hooks/useServiceConfigurationState'
import {ServiceConfigurationItemName} from 'redux/Slices/AppSlice/ServiceConfiguration/ServiceConfiguration.slice'
import When from 'components/when/When'
import hasValue from 'utils/hasValue'
import useProfileBasePath from '@hooks/useProfileBasePath'

interface TreatmentPlanStepProps {
  treatmentType?: 'ALIGNER' | 'ORTHO' | null
  onTreatmentTypeChange?: (type: 'ALIGNER' | 'ORTHO') => void
  patientIdProp?: number
}

const TreatmentPlanStep: React.FC<TreatmentPlanStepProps> = ({
  treatmentType,
  onTreatmentTypeChange,
  patientIdProp,
}) => {
  const navigate = useNavigate()
  const profileBasePath = useProfileBasePath()
  const {dispatchAction} = useDispatchAction()
  const {order} = userOrderDetails(true)
  const patientId = patientIdProp || order?.patient_details?.id
  const {userId, profileId} = useContext(AuthContext)

  // Global braces draft data from Redux
  const {treatmentPlanBraces} = useSelector(
    (state: RootState) => state.leadsProfileTreatmentPlanReducer
  )
  const {treatmentPlan} = useSelector((state: RootState) => state.leadsProfileTreatmentPlanReducer)

  const {sections} = useServiceConfigurationState()
  const isBracesAddOnActive = useMemo(
    () =>
      sections.some(
        (section) =>
          section.itemName === ServiceConfigurationItemName.BRACES_ADD_ON && section.isActive
      ),
    [sections]
  )

  // Local selection for this step (aligner vs braces)
  const [selectedType, setSelectedType] = useState<'ALIGNER' | 'ORTHO' | null>(
    treatmentType ?? null
  )

  useEffect(() => {
    // Keep local state in sync if parent passes/updates treatmentType (e.g., resume flow)
    if (treatmentType && treatmentType !== selectedType) {
      setSelectedType(treatmentType)
    }
  }, [treatmentType])

  const handleTypeSelect = (type: 'ALIGNER' | 'ORTHO') => {
    setSelectedType(type)
    onTreatmentTypeChange?.(type)
  }

  // Braces confirmation modal state
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  const hasAlignerPlan = hasValue(treatmentPlan?.treatment_plan_id)
  const hasBracesPlan =
    hasValue(treatmentPlanBraces?.braces_journey_id) ||
    hasValue(treatmentPlanBraces?.braces_plan_id)

  useEffect(() => {
    if (selectedType) return
    if (hasBracesPlan) {
      handleTypeSelect('ORTHO')
    } else if (hasAlignerPlan) {
      handleTypeSelect('ALIGNER')
    }
  }, [hasAlignerPlan, hasBracesPlan, selectedType])

  const shouldShowAligner = !hasBracesPlan
  const shouldShowBraces = isBracesAddOnActive && !hasAlignerPlan

  // Triggered from braces form "Save & Continue"
  const handleBracesSave = () => {
    setIsConfirmModalOpen(true)
  }

  const handleConfirm = async () => {
    if (!treatmentPlanBraces) {
      console.error('No pending braces treatment plan data found!')
      return
    }

    const payload = {
      ...treatmentPlanBraces,
      patient_id: patientId,
    }

    setIsCreating(true)

    try {
      await dispatchAction(postCreateTreatmentPlanBraces(payload as any)).unwrap()
      setIsConfirmModalOpen(false)

      // Update patient step to 6 and go to profile
      dispatchAction(getPatientDetails({patientId: safeParseInt(patientId)}))
        .unwrap()
        .then((res: any) => {
          const postData = {
            data: {
              first_name: res.first_name,
              last_name: res.last_name,
              email: res.email !== '' ? res.email?.toLocaleLowerCase() : null,
              mobile: res.mobile !== '' ? res.mobile : null,
              country_code: res.country_code,
              practice_location_name: res.practice_location !== '' ? res.practice_location : null,
              inviter_id: userId,
              inviter_user_type: userTypes.DOCTOR,
              customer_mapped_id: res.customer_mapped_id.trim(),
              age: res.age,
              gender: res.gender,
              practice_location_id: null,
              country: res.country,
              state: res.state,
              city: res.city,
              practice_profile_id: profileId,
              practice_invite_code: null,
              current_step: 6,
              patient_id: patientId,
            },
          }
          dispatchAction(postApiLeadsProfileDetailsUpdate(postData as any))
            .unwrap()
            .then(() => {
              dispatchAction(setCurrentStep(5))
            })
        })

      if (patientId) {
        navigate(`${profileBasePath}/${patientId}`)
      }
    } catch (error) {
      console.error('Failed to create braces treatment:', error)
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <>
      <div className='h-full flex flex-col gap-6 md:mt-0 mt-4'>
        {/* Treatment type CTAs */}
        <div className='grid md:grid-cols-2 gap-4'>
          {/* Aligner treatment card */}
          {shouldShowAligner && (
            <button
              type='button'
              onClick={() => handleTypeSelect('ALIGNER')}
              className={clsx(
                'w-full text-left rounded-xl border px-4 py-3 md:px-6 md:py-4 transition',
                'flex flex-col gap-1',
                selectedType === 'ALIGNER'
                  ? 'border-primaryColor bg-primarySupport/40'
                  : 'border-gray-200 hover:border-primaryColor/60 hover:bg-gray-50'
              )}
            >
              <div className='flex items-center gap-2'>
                <div
                  className={clsx(
                    'w-4 h-4 rounded-full border flex items-center justify-center',
                    selectedType === 'ALIGNER' ? 'border-primaryColor' : 'border-gray-400'
                  )}
                >
                  {selectedType === 'ALIGNER' && (
                    <div className='w-2.5 h-2.5 rounded-full bg-primaryColor' />
                  )}
                </div>
                <span className='font-semibold text-sm md:text-base'>Aligner treatment</span>
              </div>
              <p className='text-xs md:text-sm text-gray-600 mt-1'>
                Track patient progress manually or with our app.
              </p>
            </button>
          )}

          {/* Braces treatment card */}

          <When isTrue={shouldShowBraces}>
            <button
              type='button'
              onClick={() => handleTypeSelect('ORTHO')}
              className={clsx(
                'w-full text-left rounded-xl border px-4 py-3 md:px-6 md:py-4 transition',
                'flex flex-col gap-1',
                selectedType === 'ORTHO'
                  ? 'border-primaryColor bg-primarySupport/40'
                  : 'border-gray-200 hover:border-primaryColor/60 hover:bg-gray-50'
              )}
            >
              <div className='flex items-center gap-2'>
                <div
                  className={clsx(
                    'w-4 h-4 rounded-full border flex items-center justify-center',
                    selectedType === 'ORTHO' ? 'border-primaryColor' : 'border-gray-400'
                  )}
                >
                  {selectedType === 'ORTHO' && (
                    <div className='w-2.5 h-2.5 rounded-full bg-primaryColor' />
                  )}
                </div>
                <span className='font-semibold text-sm md:text-base'>Braces treatment</span>
              </div>
              <p className='text-xs md:text-sm text-gray-600 mt-1'>
                Seamlessly track appointments, payments and more.
              </p>
            </button>
          </When>
        </div>

        {/* When nothing is selected, show nothing else (only CTAs) */}
        {selectedType === 'ORTHO' && (
          <div className='flex-1'>
            <SetupTreatmentPlanBraces
              isInline={true}
              onSuccess={handleBracesSave}
              propBracesJourneyId={undefined}
              isStepperMode={true}
            />
          </div>
        )}

        {selectedType === 'ALIGNER' && (
          <div className='flex-1'>
            <SetupTreatmentPlan
              existingCase={false}
              hideAlignerDetails={false}
              backNavigationRoute={`/add-patient-starter`}
              isStepperMode={true}
              patientIdProp={patientId}
            />
          </div>
        )}
      </div>

      {/* Braces confirmation modal */}
      <Modal
        open={isConfirmModalOpen}
        onCancel={() => setIsConfirmModalOpen(false)}
        footer={null}
        centered
        closable={false}
        width={500}
      >
        <div className='p-4'>
          <h2 className='text-xl font-semibold text-center mb-3'>Confirm and add patient?</h2>
          <p className='text-center text-textColor text-sm mb-6'>
            You're about to add this patient with all the details entered so far. Once added, the
            details will no longer be editable. Confirm and add patient?
          </p>
          <div className='flex gap-3'>
            <button
              onClick={() => setIsConfirmModalOpen(false)}
              className='flex-1 py-3 px-6 rounded-lg border border-primaryColor text-primaryColor bg-white font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
              disabled={isCreating}
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className='flex-1 py-3 px-6 rounded-lg bg-primaryColor text-white font-semibold  disabled:cursor-not-allowed flex justify-center items-center gap-2'
              disabled={isCreating}
            >
              {isCreating && (
                <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
              )}
              {isCreating ? 'Creating...' : 'Confirm'}
            </button>
          </div>
        </div>
      </Modal>
    </>
  )
}

export default TreatmentPlanStep
