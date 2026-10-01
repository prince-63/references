import {isNil, isEmpty} from 'ramda'

export const hasValue = (value: any) => {
  return !isNil(value) && !isEmpty(value)
}
export default hasValue
