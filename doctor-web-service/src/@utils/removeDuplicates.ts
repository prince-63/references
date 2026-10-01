import hasValue from '../utils/hasValue'

export const removeDuplicates = (array: Array<any>) => {
  const uniqueIds = new Set()
  return hasValue(array)
    ? array.filter((obj) => {
        if (
          !uniqueIds.has(obj.patient_id) &&
          obj.patient_connected &&
          obj.tracking_type === 'PATIENTAPP'
        ) {
          uniqueIds.add(obj.patient_id)
          return true
        }
        return false
      })
    : []
}
