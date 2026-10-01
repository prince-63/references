import {ISubscriptionDetails} from 'components/subscription/subscription.types'
import moment from 'moment'

export default (subscriptionData: ISubscriptionDetails) => {
  if (!subscriptionData) return false

  const today = moment()
  const expiryDate = moment(subscriptionData?.plan_metadata?.current_term_end)

  const daysDiff = expiryDate.diff(today, 'days')

  const isTrialPlanExpired =
    daysDiff <= 7 &&
    daysDiff >= 0 &&
    subscriptionData.has_plan_started_consent &&
    subscriptionData?.plan_metadata?.plan_type === 'TRIAL'

  return isTrialPlanExpired
}
