import {
  SVG_PRODUCTION_SECONDARY,
  SVG_RIGHT_ARROW_ICON,
  SVG_SETTING_PRODUCTION,
  SVG_UNPROCESSED,
  SVG_USER_CHECK_SECONDARY,
} from 'utils/SvgConstants'
import productionStatusTypesConstants from '../@constants/productionStatusTypes.constants'

export default [
  {
    label: 'All Orders',
    value: productionStatusTypesConstants.ALL_ORDERS,
    title: 'All orders',
    subTitle: 'All the details of aligner production for a patient are listed here',
    icon: SVG_RIGHT_ARROW_ICON,
  },
  {
    label: 'Unprocessed',
    value: productionStatusTypesConstants.UNPROCESSED,
    title: 'Unprocessed Order List',
    subTitle:
      'Overview of patient aligners awaiting processing or pending updates from your aligner manufacturer',
    icon: SVG_UNPROCESSED,
    cardTitle: 'Unprocessed',
  },
  {
    label: 'In Manufacturing',
    value: productionStatusTypesConstants.IN_MANUFACTURING,
    title: 'Manufacturing list',
    subTitle: 'Overview of aligners currently in printing, production or in transit',
    icon: SVG_SETTING_PRODUCTION,
    cardTitle: 'In Manufacturing',
  },
  {
    label: 'In Inventory',
    value: productionStatusTypesConstants.IN_INVENTORY,
    title: 'Inventory List',
    subTitle: 'Overview of manufactured aligners not yet issued to patients',
    icon: SVG_PRODUCTION_SECONDARY,
    cardTitle: 'In Inventory',
  },
  {
    label: 'Last issued to patient',
    value: productionStatusTypesConstants.ISSUED_TO_PATIENT,
    title: 'Issued to patient list',
    subTitle: 'Overview of the aligners delivered to the patient',
    icon: SVG_USER_CHECK_SECONDARY,
    cardTitle: 'Last issued to patient',
  },
]
