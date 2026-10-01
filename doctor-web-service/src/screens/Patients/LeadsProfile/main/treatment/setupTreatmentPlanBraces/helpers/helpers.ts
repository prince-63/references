import jawType from '@constants/jawType'
import {AnchorFilterOption} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileTreatmentPlan.slice'
import {FilterOption} from 'screens/Patients/Chat/components/broadCast/broadCastTypes'

export const getValueByLabel = (arrayList: FilterOption[], value: string): string =>
  arrayList.find((item: FilterOption) => item.value === value)?.label ?? ''

export const getLabelByValue = (arrayList: FilterOption[], label: string): string =>
  arrayList.find((item: FilterOption) => item.label === label)?.value ?? ''

export const splitByJawType = (data: AnchorFilterOption[]) => {
  const upperJaw = data.filter((item) => item.jaw_type === jawType.UPPER)
  const lowerJaw = data.filter((item) => item.jaw_type === jawType.LOWER)
  return {upperJaw, lowerJaw}
}
