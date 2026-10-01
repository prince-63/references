import uploadTreatmentPlanConstants from '@constants/uploadTreatmentPlan.constants'
import uploadVideoTypeConstants from '@constants/uploadVideoType.constants'
import * as Yup from 'yup'

const getValidationSchema = (isDesignLabUser: boolean, isVendor: boolean) => {
  return Yup.object({
    treatment_plan_tag_name: Yup.string()
      .min(1, 'Minimum 1 characters required')
      .max(100, 'Maximum character limit exceeded. Please limit your input to 100 characters.')
      .nullable()
      .optional(),
    upperJawStartsWith: Yup.number().when('upperJaw', ([upperJaw], schema) =>
      upperJaw
        ? schema
            .required('Please enter values in either of the jaw fields to proceed')
            .integer('Must be an integer')
            .max(98, 'Must be 98 or less')
        : Yup.number().notRequired()
    ),
    upperJawEndsWith: Yup.number().when('upperJaw', ([upperJaw], schema) =>
      upperJaw
        ? schema
            .required('Please enter values in either of the jaw fields to proceed')
            .integer('Must be an integer')
            .max(99, 'Must be 99 or less')
            .test(
              'is-greater',
              'Your last aligner cannot be equal to or less than the first aligner in the jaw',
              function (value) {
                const {upperJawStartsWith} = this.parent
                return value > upperJawStartsWith
              }
            )
        : Yup.number().notRequired()
    ),

    remarks: Yup.string().max(
      2000,
      'Maximum character limit exceeded. Please limit your input to 2000 characters.'
    ),
    isAnyJawSelected: Yup.boolean().test(
      'either-jaw-required',
      'Please select an aligner jaw type and enter the aligners',
      function () {
        const {lowerJaw, upperJaw} = this.parent
        return Boolean(upperJaw || lowerJaw)
      }
    ),
    brand_name: Yup.object()
      .nullable()
      .test(
        'brand_name',
        'Brand name is required',
        (value: {label?: string; value?: string} | null) =>
          isDesignLabUser || isVendor || (value !== null && !!value.label && !!value.value)
      ),
    link_display_patient: Yup.boolean().test(
      'is-valid-link',
      "Please add a link to show the patient. If you don't have one, uncheck the button.", // Error message
      function (value) {
        const {treatment_planning_link} = this.parent
        if (value && !treatment_planning_link) {
          return false
        }
        return true
      }
    ),
    pdf_file: Yup.mixed().when('treatment_plan_upload_type', {
      is: uploadTreatmentPlanConstants.UPLOAD_PDF,
      then: (schema) => schema.required('This field is required.'),
      otherwise: (schema) => schema.notRequired(),
    }),
    treatment_planning_link: Yup.string().when('treatment_plan_upload_type', {
      is: uploadTreatmentPlanConstants.TREATMENT_PLANNING_LINK,
      then: (schema) =>
        schema
          .required('This field is required.')
          .min(2, 'Minimum 2 characters required')
          .max(
            1000,
            'Maximum character limit exceeded. Please limit your input to 1000 characters.'
          )
          .url('Please enter valid planning link'),
      otherwise: (schema) => schema.notRequired(),
    }),
    video_files: Yup.object()
      .nullable()
      .when('treatment_plan_upload_type', {
        is: (value: keyof typeof uploadVideoTypeConstants) => {
          return (
            value === uploadTreatmentPlanConstants.UPLOAD_SINGLE_VIDEO ||
            value === uploadTreatmentPlanConstants.UPLOAD_MULTIPLE_VIDEOS
          )
        },
        then: (schema) =>
          schema.test('at-least-one-video', 'This field is required.', function (value) {
            if (!value) return false
            return Object.values(value).some((file) => file !== null && file !== undefined)
          }),
        otherwise: (schema) => schema.notRequired(),
      }),
  })
}
export default getValidationSchema
