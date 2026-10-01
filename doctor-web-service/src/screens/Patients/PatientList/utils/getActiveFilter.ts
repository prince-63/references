import practiceFilterConstants from '@constants/practiceFilter.constants'

type FilterOption =
  | {
      value: string
      label: string
    }
  | {
      value: keyof typeof practiceFilterConstants
      label: string
    }

export default <T extends FilterOption>({
  filter,
}: {
  filter: Record<T['value'], boolean>
}): keyof typeof filter =>
  (Object.keys(filter) as Array<keyof typeof filter>).find((key) => filter[key])!
