import {Option} from 'react-google-places-autocomplete/build/types'

export const generateOption = (value: string | number, list: Option[] | null) => {
  return list?.find((option) => option.value === value) ?? null
}
