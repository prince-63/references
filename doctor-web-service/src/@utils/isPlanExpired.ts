import {ISubscriptionDetails} from 'components/subscription/subscription.types'
import moment from 'moment'

export default (subscriptionData: ISubscriptionDetails) => {
  if (!subscriptionData) return false
  const today = moment()
  const expiryDate = moment(subscriptionData?.plan_metadata?.current_term_end)
  return today.isAfter(expiryDate)
}
