import treatmentSelectTypes from '@constants/treatmentSelectTypes'
import treatmentTypeMain from '@constants/treatmentTypeMain'

export interface ITreatment {
  id: number
  treatment_plan_created: boolean
  tracking_enabled: boolean
  patient_invited: boolean
  treatment_type: typeof treatmentSelectTypes.ORTHO_TRACKER | typeof treatmentSelectTypes.IMPLANTS
  treatment_sub_type: typeof treatmentTypeMain.ALIGNERS | typeof treatmentTypeMain.BRACES
}
