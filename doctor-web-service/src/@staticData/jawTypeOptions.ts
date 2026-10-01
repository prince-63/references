import getColorPalette from 'utils/getColorPalette'
import jawType from '../@constants/jawType'

export default [
  {label: 'Upper', value: jawType.UPPER, color: getColorPalette().secondaryColor},
  {label: 'Lower', value: jawType.LOWER, color: getColorPalette().primaryColor},
  {label: 'Both', value: jawType.BOTH, color: getColorPalette().orange},
]
