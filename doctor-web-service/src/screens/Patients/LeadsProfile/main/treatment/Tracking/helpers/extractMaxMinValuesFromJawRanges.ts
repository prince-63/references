import hasValue from 'utils/hasValue'
import {LowerJaw, UpperJaw} from '../../types/treatmentPlan.types'

const extractMaxMinValuesFromJawRanges = (data: {upper_jaw: UpperJaw; lower_jaw: LowerJaw}) => {
  if (hasValue(data)) {
    const values = []
    // Check upper_jaw values
    if (hasValue(data.upper_jaw.starts_with) && data?.upper_jaw?.starts_with !== 0) {
      values.push(data.upper_jaw.starts_with)
    }
    if (hasValue(data.upper_jaw.ends_with) && data?.upper_jaw?.ends_with !== 0) {
      values.push(data.upper_jaw.ends_with)
    }
    // Check lower_jaw values
    if (hasValue(data.lower_jaw.starts_with) && data?.lower_jaw?.starts_with !== 0) {
      values.push(data.lower_jaw.starts_with)
    }
    if (hasValue(data.lower_jaw.ends_with) && data?.lower_jaw?.ends_with !== 0) {
      values.push(data.lower_jaw.ends_with)
    }
    // Determine min and max values
    const minCurrentAligner = Math.min(...values)
    const maxCurrentAligner = Math.max(...values)

    return {minCurrentAligner, maxCurrentAligner}
  } else {
    return {minCurrentAligner: 0, maxCurrentAligner: 0}
  }
}

export default extractMaxMinValuesFromJawRanges
