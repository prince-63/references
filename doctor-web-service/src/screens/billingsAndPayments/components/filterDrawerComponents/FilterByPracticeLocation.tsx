import CheckboxListWithSearchForValue from 'components/checkboxListWithSearch/CheckboxListWithSearchForValue'
import {useFormikContext} from 'formik'
import {useState} from 'react'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import {FilterDrawerFormikContextType} from 'screens/billingsAndPayments/billingsAndPayments.types'

const FilterByPracticeLocation = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const {practiceLocationsList} = useSelector((state: RootState) => state.calendar)
  const formik = useFormikContext<FilterDrawerFormikContextType>()
  const {checked_practice_location_list} = formik.values

  return (
    <div>
      <div className='flex flex-col gap-3 '>
        <CheckboxListWithSearchForValue
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          searchInputPlaceHolder='Search'
          items={practiceLocationsList ?? []}
          showSelectAll
          className='text-black'
          selectedItems={checked_practice_location_list}
          setSelectedItems={(items) => {
            formik.setFieldValue('checked_practice_location_list', items)
          }}
        />
      </div>
    </div>
  )
}

export default FilterByPracticeLocation
