import treatmentPlanStatusConstants from '@constants/treatmentPlanStatus.constants'

interface GettingStartedDetails {
  case_info_details_filled?: boolean
  pre_treatment_photos_filled?: boolean
  scan_files_filled?: boolean
  mark_all_as_read?: boolean
  treatment_status?: string | null
  tracking_status?: string | null
  order_status?: string | null
  product_type?: string
  braces_notes_attached?: boolean
  finalise_tracking_enable?: boolean
}

interface NextStepInfo {
  step: number // 0-5 for stepper steps
  title: string
  description: string
  ctaLabel: string
}

/**
 * Determines the next step in the patient onboarding flow based on their current progress
 * Steps:
 * 0 - Patient Details (always completed if we're viewing this)
 * 1 - Case Files
 * 2 - Prescription
 * 3 - Treatment Plan
 * 4 - Production Details (only for aligners)
 * 5 - Start Treatment
 */
export const getNextStepInfo = (
  gettingStartedDetails: GettingStartedDetails,
  isPractice: boolean
): NextStepInfo | null => {
  const {
    pre_treatment_photos_filled,
    scan_files_filled,
    mark_all_as_read,
    treatment_status,
    tracking_status,
    order_status,
    product_type,
    braces_notes_attached,
    finalise_tracking_enable,
  } = gettingStartedDetails

  const isAssessmentCompleted =
    mark_all_as_read || (pre_treatment_photos_filled && scan_files_filled)

  // Step 1: Check if assessment is incomplete
  if (!isAssessmentCompleted) {
    return {
      step: 1,
      title: 'Complete Assessment',
      description:
        'Upload case files, pre-treatment photos, and scan files to complete the patient assessment.',
      ctaLabel: 'Complete Assessment',
    }
  }

  // Step 2: Check if prescription is needed (step 2 in stepper)
  // If treatment_status is null, prescription hasn't been created yet
  if (!treatment_status && !order_status) {
    return {
      step: 2,
      title: 'Add Prescription',
      description: 'Create a prescription for the patient to proceed with treatment planning.',
      ctaLabel: 'Add Prescription',
    }
  }

  // Step 3: Check if treatment plan needs to be set up
  if (treatment_status === null || treatment_status === treatmentPlanStatusConstants.DRAFT) {
    return {
      step: 3,
      title: 'Setup Treatment Plan',
      description: 'Create and finalize a personalized treatment plan for your patient.',
      ctaLabel: 'Setup Treatment Plan',
    }
  }

  // Step 4: Production details (only for aligners, not for braces or practices)
  // If finalise_tracking_enable is true, it means production is done (or skipped)
  if (
    treatment_status === treatmentPlanStatusConstants.ACTIVE &&
    product_type === 'ALIGNERS' &&
    !isPractice &&
    !tracking_status &&
    !finalise_tracking_enable
  ) {
    return {
      step: 4,
      title: 'Setup Production',
      description: 'Configure production details and manufacturing preferences for the aligners.',
      ctaLabel: 'Setup Production',
    }
  }

  // Step 5: Start treatment / tracking
  if (
    treatment_status === treatmentPlanStatusConstants.ACTIVE &&
    (!tracking_status || tracking_status === 'DRAFT')
  ) {
    if (product_type === 'BRACES' && !braces_notes_attached) {
      return {
        step: 5,
        title: 'Start Treatment',
        description:
          'Create appointments and attach braces notes to begin tracking your patient treatment journey.',
        ctaLabel: 'Start Treatment',
      }
    } else if (product_type === 'ALIGNERS') {
      return {
        step: 5,
        title: 'Start Tracking',
        description: 'Select tracking method details to track your patient progress.',
        ctaLabel: 'Start Tracking',
      }
    }
  }

  // If all steps are completed, return null
  return null
}
