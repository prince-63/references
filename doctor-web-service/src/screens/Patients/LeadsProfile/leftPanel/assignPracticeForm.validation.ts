import * as Yup from 'yup'
export default Yup.object().shape({
  practice_profile_id: Yup.string().required(''),
})
