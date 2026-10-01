import * as Yup from 'yup'

export const schemaCreateNote = Yup.object().shape({
  noteTitle: Yup.string()
    .min(1, 'Note Title must be at least 1 character')
    .max(50, 'Note Title must be at most 50 characters')
    .matches(
      /^[a-zA-Z0-9@.!#$%&'*+/=?^_`{|}~\s]+$/,
      "Note Title can only contain alphanumeric characters, spaces, and the following special characters: @.!#$%&'*+/=?^_`{|}~"
    )
    .optional(),
  noteText: Yup.string()
    .min(1, 'Note Text must be at least 1 character')
    .max(500, 'Note Text must be at most 500 characters')
    .required('This field is mandatory'),
})
