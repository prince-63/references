import {Checkbox, ConfigProvider} from 'antd'
import filterByTreatmentList from '@staticData/filterByTreatmentList'
import {useFormikContext} from 'formik'
import {FilterDrawerFormikContextType} from 'screens/billingsAndPayments/billingsAndPayments.types'
import filterByTreatmentConstants from '@constants/filterByTreatment.constants'
import getColorPalette from 'utils/getColorPalette'

const FilterByTreatment = () => {
  const formik = useFormikContext<FilterDrawerFormikContextType>()
  const {checked_treatment_list} = formik.values
  const checkAll = filterByTreatmentList.length === checked_treatment_list.length
  const indeterminate =
    checked_treatment_list.length > 0 &&
    checked_treatment_list.length < filterByTreatmentList.length

  const onChange = (value: string, checked: boolean) => {
    const newCheckedTreatmentList = checked
      ? [...checked_treatment_list, value]
      : checked_treatment_list.filter((item) => item !== value)
    formik.setFieldValue('checked_treatment_list', newCheckedTreatmentList)
  }

  const onCheckAllChange = (e: any) => {
    if (e.target.checked) {
      formik.setFieldValue(
        'checked_treatment_list',
        e.target.checked ? filterByTreatmentList.map((item) => item.value) : []
      )
    } else {
      formik.setFieldValue('checked_treatment_list', [])
    }
  }

  return (
    <ConfigProvider
      theme={{
        token: {
          fontFamily: 'Figtree',
          colorPrimary: getColorPalette().primaryColor,
          fontSize: 14,
        },
      }}
    >
      <div>
        <div className='flex flex-col gap-3 '>
          <Checkbox indeterminate={indeterminate} onChange={onCheckAllChange} checked={checkAll}>
            Show all treatments
          </Checkbox>
          <Checkbox
            checked={checked_treatment_list.includes(filterByTreatmentConstants.UNASSIGNED)}
            onChange={(e) => onChange(filterByTreatmentConstants.UNASSIGNED, e.target.checked)}
          >
            Show unassigned
          </Checkbox>
          <Checkbox
            checked={checked_treatment_list.includes(
              filterByTreatmentConstants.SHOW_BRACES_TREATMENTS
            )}
            onChange={(e) =>
              onChange(filterByTreatmentConstants.SHOW_BRACES_TREATMENTS, e.target.checked)
            }
          >
            Show braces treatments
          </Checkbox>
        </div>
      </div>
    </ConfigProvider>
  )
}

export default FilterByTreatment
