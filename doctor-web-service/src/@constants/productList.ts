import {SVG_TEETH_CONNECTED_PRIMARY, SVG_TEETH_PRIMARYT} from '../utils/SvgConstants'
import productTypes from './productTypes'
export default [
  {
    id: productTypes.ALIGNERS,
    title: 'Aligners',
    icon: SVG_TEETH_CONNECTED_PRIMARY,
    iconWidth: '38',
    iconHeight: '23',
    firstSubTitle: 'Track patient progress ',
    secondSubTitle: 'manually or with our app!',
    active: true,
    iconStyle: 'bg-white rounded-full w-[57px] h-[57px]',
    showComingSoon: false,
  },
  {
    id: productTypes.BRACES,
    title: 'Braces',
    icon: SVG_TEETH_PRIMARYT,
    iconWidth: '29',
    iconHeight: '29',
    firstSubTitle: 'Keep track of each step',
    secondSubTitle: 'with digital records!',
    active: false,
    iconStyle: 'bg-primarySupport rounded-full w-[57px] h-[57px]',
    showComingSoon: false,
  },
]
