import requestTypePlansConstants from '@constants/requestTypePlans.constants'

const requestTypeList = [
  {label: 'Upgrade plan', value: requestTypePlansConstants.UPGRADE_PLAN},
  {label: 'Renew plan', value: requestTypePlansConstants.RENEWAL_PLAN},
  {label: 'Top up storage', value: requestTypePlansConstants.TOP_UP_STORAGE},
  {label: 'Top up patients', value: requestTypePlansConstants.TOP_UP_PATIENT},
  {label: 'Braces module', value: requestTypePlansConstants.BRACES_MODULE},
  {label: 'Google Drive Storage', value: requestTypePlansConstants.GOOGLE_DRIVE_STORAGE},
  {label: 'Whatsapp Notification', value: requestTypePlansConstants.WHATSAPP_NOTIFICATION},
]

export default requestTypeList
