import {
  SVG_ATTACH_TEETHS_GRAY,
  SVG_ATTACH_TEETHS_PRIMARY,
  SVG_TEETHS_GRAY,
  SVG_TEETH_PRIMARYT,
} from '../utils/SvgConstants'
import treatmentTypeMain from './treatmentTypeMain'

export interface Feature {
  id: number
  title: string
  icon: any
  iconDisabled: any
  iconWidth: string
  iconHeight: string
  subTitle: string
  iconStyle: string
  showComingSoon: boolean
  className: string
  value: string
  disabled: boolean
  active?: boolean
}

export interface ITreatement {
  id: number
  title: string
  icon: any
  iconDisabled: any
  iconWidth: string
  iconHeight: string
  subTitle: string
  iconStyle: string
  value: string
  disabled: boolean
}

const treatmentSelectionList: ITreatement[] = [
  {
    id: 1,
    title: 'Aligner treatment plan',
    icon: SVG_TEETH_PRIMARYT,
    iconDisabled: SVG_TEETHS_GRAY,
    iconWidth: '38',
    iconHeight: '23',
    subTitle: 'Track patient progress manually or with our app.',
    iconStyle: 'w-[57px] h-[57px] rounded full',
    value: treatmentTypeMain.ALIGNERS,
    disabled: false,
  },
  {
    id: 2,
    title: 'Braces treatment plan',
    icon: SVG_ATTACH_TEETHS_PRIMARY,
    iconDisabled: SVG_ATTACH_TEETHS_GRAY,
    iconWidth: '29',
    iconHeight: '29',
    subTitle: 'Seamlessly track appointments, payments and more',
    iconStyle: '',
    value: treatmentTypeMain.BRACES,
    disabled: false,
  },
]
export default treatmentSelectionList
