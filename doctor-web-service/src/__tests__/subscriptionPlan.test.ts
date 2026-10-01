import {getPlanDisplayName, isStarterOrLitePlan, normalizePlanName} from 'utils/subscriptionPlan'

describe('subscriptionPlan utils', () => {
  it('normalizes lite plan aliases for display and onboarding decisions', () => {
    expect(normalizePlanName('LITE_PLAN')).toBe('LITE')
    expect(getPlanDisplayName('LITE_PLAN')).toBe('Lite plan')
    expect(isStarterOrLitePlan('LITE_PLAN')).toBe(true)
    expect(isStarterOrLitePlan('LITE')).toBe(true)
  })
})
