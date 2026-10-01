import alignerStatusType from '../@constants/alignerStatusType'
export default [
  {label: 'Unprocessed', value: alignerStatusType.UNPROCESSED},
  {label: 'In Printing', value: alignerStatusType.IN_PRINTING, iconColor: '#F45045'},
  {label: 'In Production', value: alignerStatusType.IN_PRODUCTION, iconColor: '#735BF2'},
  {label: 'In Transit', value: alignerStatusType.IN_TRANSIT, iconColor: '#00B383'},
  {label: 'In Inventory', value: alignerStatusType.IN_INVENTORY},
  {label: 'Issued to Patient', value: alignerStatusType.ISSUED_TO_PATIENT},
]
