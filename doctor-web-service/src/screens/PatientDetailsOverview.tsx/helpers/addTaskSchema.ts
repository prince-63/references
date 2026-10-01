import * as Yup from 'yup'

export const addTaskSchema = () =>
  Yup.object().shape({
    title: Yup.string().required('title is required'),
    description: Yup.string().nullable().notRequired(),
    assign_id: Yup.string().nullable().notRequired(),
    due_date: Yup.string().required('due date is required'),
    status: Yup.string().required('status is required'),
  })
