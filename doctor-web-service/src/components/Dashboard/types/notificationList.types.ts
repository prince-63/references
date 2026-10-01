import notificationTypes from './notification.types'
import notificationFilterListOption from '../../../@staticData/notificationFilterListOption'

export type NotificationStatus = (typeof notificationFilterListOption)[number]['value']
export type NotificationFilterOptionsRecord = Record<keyof typeof notificationTypes, any[]>
export interface Update {
  event_type: string
  [key: string]: any
}
