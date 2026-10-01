import {IPrescriptionDetails} from 'screens/Orders/orders.types'

export default (
  prescriptionDetails?: IPrescriptionDetails,
  chief_complaint_from_case_record?: string
) => {
  if (prescriptionDetails) {
    return {
      chief_complaint: prescriptionDetails.chief_complaint,
      treatment_needed: prescriptionDetails.treatment_needed,
      do_not_move_the_following_tooth: prescriptionDetails.do_not_move_the_following_tooth,
      midline: prescriptionDetails.midline,
      attachments: prescriptionDetails.attachments,
      inter_proximal_reduction: prescriptionDetails.inter_proximal_reduction,
      extraction: prescriptionDetails.extraction,
      notes: prescriptionDetails.notes,
      do_not_move_the_following_selected_tooth:
        prescriptionDetails.do_not_move_the_following_selected_tooth,
      midline_instructions: prescriptionDetails.midline_instructions,
      attachments_tooth_selected: prescriptionDetails.attachments_tooth_selected,
      extraction_tooth_selected: prescriptionDetails.extraction_tooth_selected,
      treatment_needed_for_tooth: prescriptionDetails.treatment_needed_for_tooth,
    }
  } else {
    return {
      chief_complaint: chief_complaint_from_case_record ?? '',
      treatment_needed: 'Both Arch 7X7',
      do_not_move_the_following_tooth: 'No such requirement',
      midline: 'Improve Midline (As per us)',
      attachments: 'Place as needed',
      inter_proximal_reduction: 'Rely on our decision',
      extraction: 'Rely on our decision',
      notes: '',
      do_not_move_the_following_selected_tooth: [],
      midline_instructions: '',
      attachments_tooth_selected: [],
      extraction_tooth_selected: [],
      treatment_needed_for_tooth: [],
    }
  }
}
