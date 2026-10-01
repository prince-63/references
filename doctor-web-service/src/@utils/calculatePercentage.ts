import hasValue from 'utils/hasValue'

export default (used: number, total: number): number => {
  if (total === 0 || !hasValue(total)) {
    return 0
  }
  return (used / total) * 100
}
