import {SVG_ANALYTICS, SVG_TEETH_CAP_GRAY} from '../utils/SvgConstants'
import treatmentSelectTypes from './treatmentSelectTypes'

export interface Feature {
  id: number
  title: string
  icon: any
  iconDisabled: any
  iconWidth: string
  iconHeight: string
  subTitle: string
  active: boolean
  iconStyle: string
  showComingSoon: boolean
  className: string
  value: string
  disabled: boolean
}

const treatmentTypeSelectionList: Feature[] = [
  {
    id: 1,
    title: 'Orthotracker',
    icon: SVG_ANALYTICS,
    iconDisabled: SVG_ANALYTICS,
    iconWidth: '30',
    iconHeight: '30',
    subTitle: 'Track your aligner or braces patients here',
    active: true,
    iconStyle: 'w-[57px] h-[57px] rounded full',
    showComingSoon: false,
    className: '',
    value: treatmentSelectTypes.ORTHO_TRACKER,
    disabled: false,
  },
  {
    id: 2,
    title: 'Implants',
    icon: SVG_TEETH_CAP_GRAY,
    iconDisabled: SVG_TEETH_CAP_GRAY,
    iconWidth: '29',
    iconHeight: '29',
    subTitle: 'Will be available soon!',
    active: false,
    iconStyle: '',
    showComingSoon: true,
    className: '',
    value: treatmentSelectTypes.IMPLANTS,

    disabled: false,
  },
]
export default treatmentTypeSelectionList
