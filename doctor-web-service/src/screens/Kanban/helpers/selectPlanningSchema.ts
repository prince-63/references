import * as Yup from 'yup'

export const selectPlanningSchema = () =>
  Yup.object().shape({
    caseType: Yup.string().required('case type is required'),
    assignee_id: Yup.string().nullable().notRequired(),
    category_id: Yup.string().nullable().notRequired(),
    product_service_id: Yup.string().nullable().notRequired(),
  })
