import {AppointmentListData, jawTypeDetail} from '../types/appointments.types'
import hasValue from 'utils/hasValue'

const processJawItem = (jaw: jawTypeDetail): jawTypeDetail | null => {
  const processedJaw: Partial<Record<keyof jawTypeDetail, string | string[] | null>> = {}
  for (const key in jaw) {
    if (jaw.hasOwnProperty(key) && key !== 'jaw_type') {
      processedJaw[key as keyof jawTypeDetail] = hasValue(jaw[key as keyof jawTypeDetail])
        ? jaw[key as keyof jawTypeDetail]
        : null
    }
  }
  const allFieldsNull = Object.values(processedJaw).every((value) => value === null)
  processedJaw.jaw_type = jaw.jaw_type

  return allFieldsNull ? null : (processedJaw as jawTypeDetail)
}

const processAppointmentListItem = (item: AppointmentListData) => {
  const {jaws} = item
  const upperJaw = processJawItem(jaws[0])
  const lowerJaw = jaws.length > 1 ? processJawItem(jaws[1]) : null
  const jawType = jaws[0].jaw_type

  if (jaws.length === 1 || jaws[0].jaw_type === 'BOTH') {
    return {
      upperJaw,
      lowerJaw: upperJaw,
      jawType,
    }
  } else {
    return {
      upperJaw,
      lowerJaw,
      jawType,
    }
  }
}

export default processAppointmentListItem
