import ErrorToast from 'components/modal/Alert/ErrorToast'

/**
 * Validates an object for premiumChiefComplaint fields.
 *
 * @param {Record<string, any>} values - The object to validate.
 * @returns {Record<string, string>} errors - An object with error messages for invalid fields.
 */
export function validate(
  values: Record<string, any>,
  options?: {showToast?: boolean}
): Record<string, string> {
  const errors: Record<string, string> = {}

  const isBlank = (input: unknown) => typeof input !== 'string' || input.trim() === ''
  const hasSelections = (input: unknown) => Array.isArray(input) && input.length > 0

  Object.entries(values).forEach(([key, value]) => {
    // Generic required and length validation for all string fields
    if (typeof value === 'string' && key.trim().startsWith('premiumChiefComplaint')) {
      if (value.trim() === '') {
        errors[key] = 'This field is required.'
      } else if (value.length < 2) {
        errors[key] = 'Minimum 2 characters required.'
      } else if (value.length > 2000) {
        errors[key] = 'Maximum 2000 characters allowed.'
      }
    }

    // Custom logic for special components
    if (key.startsWith('premiumTreatmentNeeded')) {
      if (
        typeof value === 'string' &&
        value.startsWith('certain:') &&
        !/^certain:[a-zA-Z0-9,]+$/.test(value)
      ) {
        errors[key] = 'Select 1 or more teeth.'
      }
    }
    if (key.startsWith('premiumToothRequirement')) {
      if (
        value &&
        typeof value === 'object' &&
        value.value === 'select' &&
        Array.isArray(value.selectedTeeth) &&
        value.selectedTeeth.length === 0
      ) {
        errors[key] = 'Select 1 or more teeth.'
      }
    }
    if (key.startsWith('premiumMidline')) {
      if (value && typeof value === 'object' && value.option === 'improve') {
        const notes = value.notes || ''
        if (typeof notes !== 'string' || notes.trim() === '') {
          errors[key] = 'Notes are required.'
        } else if (notes.length < 2) {
          errors[key] = 'Minimum 2 characters required for notes.'
        } else if (notes.length > 2000) {
          errors[key] = 'Maximum 2000 characters allowed for notes.'
        }
      }
    }
    if (key.startsWith('premiumCanineRelationship')) {
      if (value && typeof value === 'object') {
        const {mainOption, classIOption, instructions = '', notes = ''} = value

        const validateField = (fieldValue: string, fieldName: string) => {
          if (typeof fieldValue !== 'string' || fieldValue.trim() === '') {
            return `${fieldName} are required.`
          }
          if (fieldValue.length < 2) {
            return `Minimum 2 characters required for ${fieldName.toLowerCase()}.`
          }
          if (fieldValue.length > 2000) {
            return `Maximum 2000 characters allowed for ${fieldName.toLowerCase()}.`
          }
          return null
        }

        let error: string | null = null

        if (classIOption === 'specify') {
          error = validateField(instructions, 'Instructions')
        } else if (mainOption === 'improve') {
          error = validateField(notes, 'Notes')
        }

        if (error) {
          errors[key] = error
        }
      }
    }

    if (key.startsWith('premiumMolarRelationship')) {
      if (value && typeof value === 'object' && value.option === 'improve') {
        const notes = value.notes || ''
        if (typeof notes !== 'string' || notes.trim() === '') {
          errors[key] = 'Notes are required.'
        } else if (notes.length < 2) {
          errors[key] = 'Minimum 2 characters required for notes.'
        } else if (notes.length > 2000) {
          errors[key] = 'Maximum 2000 characters allowed for notes.'
        }
      }
    }
    if (key.startsWith('premiumExtraction')) {
      if (
        value &&
        typeof value === 'object' &&
        value.option === 'excludeTeeth' &&
        Array.isArray(value.excludedTeeth) &&
        value.excludedTeeth.length === 0
      ) {
        errors[key] = 'Select 1 or more teeth.'
      }
    }
    if (key.startsWith('premiumPlaceAttachments')) {
      if (
        value &&
        typeof value === 'object' &&
        value.option === 'excludeTeeth' &&
        Array.isArray(value.excludedTeeth) &&
        value.excludedTeeth.length === 0
      ) {
        errors[key] = 'Select 1 or more teeth.'
      }
    }

    if (key.startsWith('premiumChiefComplaintCaseIntent')) {
      const primaryComplaint = value?.primaryComplaint
      const primaryClinicalGoal = value?.primaryClinicalGoal

      if (!hasSelections(primaryComplaint) && !hasSelections(primaryClinicalGoal)) {
        errors[key] = 'Select at least one Chief Complaint and one Case Intent.'
      } else if (!hasSelections(primaryComplaint)) {
        errors[key] = 'Select at least one Chief Complaint.'
      } else if (!hasSelections(primaryClinicalGoal)) {
        errors[key] = 'Select at least one Case Intent.'
      }
    }

    if (key.startsWith('premiumTreatmentScopeCaseType')) {
      const treatmentScope = value?.treatmentScope

      if (isBlank(treatmentScope)) {
        errors[key] = 'Treatment Scope is required.'
      }
    }

    if (key.startsWith('premiumPatientPreferencesExpectations')) {
      const iprWillingness = value?.iprWillingness
      const extractionWillingness = value?.extractionWillingness

      if (isBlank(iprWillingness) && isBlank(extractionWillingness)) {
        errors[key] = 'IPR willingness and Extraction willingness are required.'
      } else if (isBlank(iprWillingness)) {
        errors[key] = 'IPR willingness is required.'
      } else if (isBlank(extractionWillingness)) {
        errors[key] = 'Extraction willingness is required.'
      }
    }

    if (key.startsWith('premiumTimelineUrgency')) {
      const urgency = value?.urgency
      const urgentReason = value?.urgentReason
      const normalizedUrgency = typeof urgency === 'string' ? urgency.toLowerCase() : ''
      const shouldRequireUrgentReason = ['urgent', 'asap', 'high', 'immediate'].some((token) =>
        normalizedUrgency.includes(token)
      )

      if (isBlank(urgency)) {
        errors[key] = 'Timeline and urgency are required.'
      } else if (shouldRequireUrgentReason && isBlank(urgentReason)) {
        errors[key] = 'Urgent reason is required for urgent timelines.'
      } else if (!isBlank(urgentReason) && String(urgentReason).trim().length > 2000) {
        errors[key] = 'Maximum 2000 characters allowed for urgent reason.'
      }
    }
  })
  if (options?.showToast && Object.keys(errors).length > 0) {
    const [firstError] = Object.values(errors)
    ErrorToast(firstError || 'Please complete the required fields.')
  }

  return errors
}
