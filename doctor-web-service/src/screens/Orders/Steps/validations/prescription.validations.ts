import * as yup from 'yup'
import {
  SELECT_SPECIFIC_TOOTH,
  SPECIFY_MIDLINE_INSTRUCTIONS,
} from '../helpers/prescriptionFormOptions'

export const prescriptionValidationSchema = yup.object().shape({
  chief_complaint: yup.string().trim(),
  treatment_needed_for_tooth: yup
    .array()
    .of(yup.string())
    .when('treatment_needed', {
      is: SELECT_SPECIFIC_TOOTH,
      then: (schema) =>
        schema.required('This field is required.').min(1, 'This field is required.'),
      otherwise: (schema) => schema.notRequired(),
    }),
  do_not_move_the_following_tooth: yup.string().required('This field is required'),
  do_not_move_the_following_selected_tooth: yup
    .array()
    .of(yup.string())
    .when('do_not_move_the_following_tooth', {
      is: SELECT_SPECIFIC_TOOTH,
      then: (schema) =>
        schema.required('This field is required.').min(1, 'This field is required.'),
      otherwise: (schema) => schema.notRequired(),
    }),
  midline: yup.string().required('This field is required'),
  midline_instructions: yup
    .string()
    .trim()
    .when('midline', {
      is: SPECIFY_MIDLINE_INSTRUCTIONS,
      then: (schema) => schema.required('This field is required.'),
      otherwise: (schema) => schema.notRequired(),
    }),
  attachments: yup.string().required('This field is required'),
  attachments_tooth_selected: yup
    .array()
    .of(yup.string())
    .when('attachments', {
      is: SELECT_SPECIFIC_TOOTH,
      then: (schema) =>
        schema.required('This field is required.').min(1, 'This field is required.'),
      otherwise: (schema) => schema.notRequired(),
    }),
  inter_proximal_reduction: yup.string().required('This field is required'),
  extraction: yup.string().required('This field is required'),
  extraction_tooth_selected: yup
    .array()
    .of(yup.string())
    .when('extraction', {
      is: SELECT_SPECIFIC_TOOTH,
      then: (schema) =>
        schema.required('This field is required.').min(1, 'This field is required.'),
      otherwise: (schema) => schema.notRequired(),
    }),
  notes: yup.string().nullable(),
})
