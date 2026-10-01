import {ISubscriptionDetails} from 'components/subscription/subscription.types'
import hasValue from 'utils/hasValue'

export default (subscriptionData: ISubscriptionDetails) => {
  if (!hasValue(subscriptionData)) return false
  const upgradedPlan =
    !subscriptionData?.has_plan_started_consent && !subscriptionData?.plan_metadata?.trial_plan
  return upgradedPlan
}
