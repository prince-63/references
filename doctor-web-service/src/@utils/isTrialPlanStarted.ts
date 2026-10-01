import {ISubscriptionDetails} from 'components/subscription/subscription.types'

export default (subscriptionData: ISubscriptionDetails) => {
  if (!subscriptionData) return false
  const trialStarted =
    !subscriptionData?.has_plan_started_consent && subscriptionData?.plan_metadata?.trial_plan
  return trialStarted
}
