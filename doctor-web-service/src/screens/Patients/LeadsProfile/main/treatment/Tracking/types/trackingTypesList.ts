import trackingTypes from '@constants/trackingTypes'
import {
  SVG_MOBILE_PRIMARY,
  SVG_MOBILE_GRAY,
  SVG_TARGET_PRIMARY,
  SVG_TARGET_GRAY,
} from 'utils/SvgConstants'

export const trackingTypeList = [
  {
    icon: SVG_MOBILE_PRIMARY,
    disabledIcon: SVG_MOBILE_GRAY,
    title: 'Patient mobile app ',
    SubTitle: 'Automate patient progress tracking and stay updated by connecting with them.',
    iconWidth: '30',
    iconHeight: '32',
    value: trackingTypes.PATIENTAPP,
  },
  {
    icon: SVG_TARGET_PRIMARY,
    disabledIcon: SVG_TARGET_GRAY,
    title: 'Manual tracking',
    SubTitle: 'Take full control by manually tracking every patient you add. ',
    iconWidth: '24',
    iconHeight: '24',
    value: trackingTypes.MANUAL,
  },
]
