import * as Yup from 'yup'

export const accessControlSchema = () =>
  Yup.object().shape({
    name: Yup.string().required('name is required'),
    description: Yup.string().nullable().notRequired(),
    sub_role_tag: Yup.string().required('select the field'),
    clone_from_sub_role_id: Yup.string()
      .nullable()
      .when('sub_role_tag', {
        is: 'DEFAULT',
        then: (schema) => schema.required('select the field'),
        otherwise: (schema) => schema.notRequired(),
      }),
  })
