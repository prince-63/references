import getSubscriptionAlerts from '@utils/getSubscriptionAlerts'
import getTreatmentPlanStatusTagClassName from '@utils/getTreatmentPlanStatusTagClassName'
import {logKeyTypes} from '@utils/logKeyTypes'
import {logToConsole} from '@utils/logToConsole'
import {ISubscriptionDetails} from 'components/subscription/subscription.types'

jest.mock('@utils/logToConsole', () => ({logToConsole: jest.fn()}))
const mockedLog = logToConsole as jest.Mock

const baseSubscription: ISubscriptionDetails = {
  id: 1,
  total_patients: 100,
  total_storage_gb: 100,
  used_storage_gb: 0,
  total_used_patients: 0,
  total_orders: 100,
  used_orders: 0,
  total_users: 1,
  used_users: 0,
  brand: null,
  has_plan_started_consent: false,
  profile_id: 1,
  is_has_done_practice: false,
  plan_metadata: {
    next_billing_at: '2024-01-01',
    current_term_start: '2023-01-01',
    current_term_end: '2023-12-31',
    status: 'ACTIVE',
    plan_name: 'FREE_TRIAL' as any,
    plan_type: 'TRIAL',
    trial_plan: false,
    request_deletion: false,
  },
  admin: false,
  is_lab_staff_deactivated: false,
  is_plan_upgraded: false,
  is_gdrive_platform_enabled: false,
  is_gdrive_platform_authenticated: false,
  gdrive_migration_status: 'PENDING',
}

const makeSubscription = (override: Partial<ISubscriptionDetails>) => ({
  ...baseSubscription,
  ...override,
})

describe('getSubscriptionAlerts', () => {
  it('returns hidden alerts when usage is low', () => {
    const alerts = getSubscriptionAlerts({
      subscriptionData: makeSubscription({
        used_storage_gb: 1000,
        total_used_patients: 10,
        used_orders: 5,
      }),
    })

    expect(alerts.storage.show).toBe(false)
    expect(alerts.patients.show).toBe(false)
    expect(alerts.order.show).toBe(false)
    expect(alerts.aggregated.show).toBe(false)
  })

  it('sets warning/error states per module and aggregates only storage/patient errors', () => {
    const alerts = getSubscriptionAlerts({
      subscriptionData: makeSubscription({
        used_storage_gb: 81920, // 80 GB of 100 => warning
        total_used_patients: 110, // 110% => error
        used_orders: 40,
      }),
    })

    expect(alerts.storage).toMatchObject({show: true, warning: true, error: false})
    expect(alerts.patients).toMatchObject({show: true, warning: false, error: true})
    expect(alerts.order).toMatchObject({show: false, warning: false, error: false})
    expect(alerts.aggregated).toMatchObject({show: true, warning: false, error: true})
  })

  it('shows aggregated warning when only orders breach threshold', () => {
    const alerts = getSubscriptionAlerts({
      subscriptionData: makeSubscription({
        used_storage_gb: 1000,
        total_used_patients: 10,
        used_orders: 150,
      }),
    })

    expect(alerts.order.error).toBe(true)
    expect(alerts.aggregated.show).toBe(true)
    expect(alerts.aggregated.error).toBe(false)
    expect(alerts.aggregated.warning).toBe(false)
  })
})

describe('getTreatmentPlanStatusTagClassName', () => {
  it('returns mapped class names for known statuses', () => {
    expect(getTreatmentPlanStatusTagClassName('Draft')).toContain('bg-lightGray')
    expect(getTreatmentPlanStatusTagClassName('Sent to patient')).toBe(
      'bg-[#E3F2FD] text-[#135FA2]'
    )
    expect(getTreatmentPlanStatusTagClassName('ACTIVE')).toBe('bg-[#E8F5E9] text-[#096C0E]')
  })

  it('falls back to default for unknown status', () => {
    expect(getTreatmentPlanStatusTagClassName('UNRECOGNIZED')).toBe('bg-lightGray text-textColor')
  })
})

describe('logKeyTypes', () => {
  beforeEach(() => mockedLog.mockReset())

  it('logs key/type pairs for array of objects', () => {
    logKeyTypes([{name: 'Alpha', count: 2}])
    expect(mockedLog).toHaveBeenCalledWith('{ Key: name, Type: string }')
    expect(mockedLog).toHaveBeenCalledWith('{ Key: count, Type: number }')
  })

  it('logs key/type pairs for plain objects', () => {
    logKeyTypes({enabled: true, size: 4})
    expect(mockedLog).toHaveBeenCalledTimes(2)
    expect(mockedLog).toHaveBeenCalledWith('{ Key: enabled, Type: boolean }')
    expect(mockedLog).toHaveBeenCalledWith('{ Key: size, Type: number }')
  })

  it('does nothing for empty arrays or primitives', () => {
    logKeyTypes([])
    logKeyTypes(42)
    expect(mockedLog).not.toHaveBeenCalled()
  })
})
