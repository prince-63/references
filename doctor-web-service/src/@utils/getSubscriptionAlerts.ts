import {ISubscriptionDetails} from 'components/subscription/subscription.types'
import calculatePercentage from './calculatePercentage'
import subscriptionModulesConstants from '@constants/subscriptionModules.constants'

interface IAlert {
  show: boolean
  warning: boolean
  error: boolean
  percentage: number
}

interface IAlerts {
  [subscriptionModulesConstants.storage]: IAlert
  [subscriptionModulesConstants.patients]: IAlert
  [subscriptionModulesConstants.order]: IAlert
  aggregated: IAlert
}

export default ({subscriptionData}: {subscriptionData: ISubscriptionDetails}): IAlerts => {
  const usedStorageGB = subscriptionData?.used_storage_gb / 1024

  const usedStoragePercentage = calculatePercentage(
    usedStorageGB,
    subscriptionData?.total_storage_gb
  )
  const usedPatientsPercentage = calculatePercentage(
    subscriptionData?.total_used_patients,
    subscriptionData?.total_patients
  )
  const usedOrdersPercentage = calculatePercentage(
    subscriptionData?.used_orders,
    subscriptionData?.total_orders
  )

  const alerts: IAlerts = {
    storage: {show: false, warning: false, error: false, percentage: 0},
    patients: {show: false, warning: false, error: false, percentage: 0},
    order: {show: false, warning: false, error: false, percentage: 0},
    aggregated: {show: false, warning: false, error: false, percentage: 0},
  }

  const setAlerts = (percentage: number, alertType: keyof IAlerts) => {
    if (percentage < 80) {
      alerts[alertType].show = false
      alerts[alertType].percentage = percentage
    } else if (percentage >= 80 && percentage < 100) {
      alerts[alertType].show = true
      alerts[alertType].warning = true
      alerts[alertType].percentage = percentage
    } else if (percentage >= 100) {
      alerts[alertType].warning = false
      alerts[alertType].show = true
      alerts[alertType].error = true
      alerts[alertType].percentage = percentage
    }
  }
  setAlerts(usedStoragePercentage, subscriptionModulesConstants.storage)
  setAlerts(usedPatientsPercentage, subscriptionModulesConstants.patients)
  setAlerts(usedOrdersPercentage, subscriptionModulesConstants.order)

  if (alerts.storage.show || alerts.patients.show || alerts.order.show) {
    alerts.aggregated.show = true
    alerts.aggregated.warning =
      !(alerts.storage.error || alerts.patients.error) &&
      (alerts.storage.warning || alerts.patients.warning)
    alerts.aggregated.error = alerts.storage.error || alerts.patients.error
  }

  return alerts
}
