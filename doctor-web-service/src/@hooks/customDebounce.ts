import debounce from 'lodash/debounce'

export const customDebounce = <T extends (...args: any[]) => void>(
  fn: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  return debounce(fn, delay)
}
