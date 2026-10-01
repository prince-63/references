import {Form} from 'formik'
import FormikInput from 'components/atom/Inputs/FormikInput'
import When from 'components/when/When'
import useAllUserRoles from '@hooks/useAllUserPlan'

const EditLabelsForm = () => {
  const {isEnterprisePlanUser} = useAllUserRoles()
  return (
    <div>
      {' '}
      <Form className='flex flex-col gap-3 px-5'>
        <FormikInput
          name={'home'}
          label={'Home'}
          required
          readOnly
          className='py-3'
          maxLength={50}
          subLabel='A quick overview of key metrics, tasks, and updates.'
        />
        <FormikInput
          name={'workspace'}
          label={'Practice orders'}
          required
          className='py-3'
          maxLength={50}
          subLabel='For your tasks, patients, and order related details.'
        />
        <FormikInput
          name={'customer_view'}
          label={'Customer orders'}
          required
          className='py-3'
          maxLength={50}
          subLabel='Track and manage orders sent to labs.'
        />

        <When isTrue={isEnterprisePlanUser}>
          <FormikInput
            name={'lab_view'}
            label={'Lab orders'}
            required
            className='py-3'
            maxLength={50}
            subLabel='View and collaborate on orders received from customers.'
          />
        </When>
      </Form>
    </div>
  )
}

export default EditLabelsForm
