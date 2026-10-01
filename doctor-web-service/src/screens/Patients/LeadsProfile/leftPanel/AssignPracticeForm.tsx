import FormikSelectList from 'components/atom/Dropdown/FormikSelectList'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'

const AssignPracticeForm = () => {
  const {loadingActivePractices, activePractices} = useSelector(
    (state: RootState) => state.practices
  )

  return (
    <div className='flex flex-col gap-3'>
      <FormikSelectList
        {...{
          name: 'practice_profile_id',
          loading: loadingActivePractices,
          showSearch: true,
          notFoundContent: 'No results found',
          items: activePractices,
          required: true,
          label: 'Assign practice',
          onChangeMapperFunc: String,
        }}
      />
    </div>
  )
}

export default AssignPracticeForm
