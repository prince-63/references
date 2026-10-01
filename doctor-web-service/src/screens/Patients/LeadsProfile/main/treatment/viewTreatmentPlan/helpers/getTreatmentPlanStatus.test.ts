import {getTreatmentPlanStatus} from './getTreatmentPlanStatus'
import treatmentPlanStatusConstants from '@constants/treatmentPlanStatus.constants'

jest.mock('@hooks/useAllUserPlan', () => jest.fn())
// eslint-disable-next-line @typescript-eslint/no-var-requires
const mockUseAllUserPlan = require('@hooks/useAllUserPlan') as jest.Mock

const basePlan = {
  status: treatmentPlanStatusConstants.DRAFT,
  approver_status: treatmentPlanStatusConstants.APPROVED,
  initiator_status: treatmentPlanStatusConstants.SENT_FOR_APPROVAL,
  approved_by_patient_at: null,
  is_approved_by_patient: false,
} as any

describe('getTreatmentPlanStatus', () => {
  beforeEach(() => {
    mockUseAllUserPlan.mockReturnValue({
      isOrganization: false,
      isPractice: false,
      isDesignLabUser: false,
      isCustomer: false,
      isVendor: false,
      isGrowthPlanUser: false,
    })
  })

  it('returns DRAFT for new or draft flags', () => {
    const statusNew = getTreatmentPlanStatus({treatmentPlan: basePlan, isNew: true})
    const statusDraft = getTreatmentPlanStatus({treatmentPlan: basePlan, isDraft: true})
    expect(statusNew).toBe('DRAFT')
    expect(statusDraft).toBe('DRAFT')
  })

  it('returns patient approval states when draft has patient approval flags', () => {
    const statusSent = getTreatmentPlanStatus({
      treatmentPlan: {
        ...basePlan,
        approved_by_patient_at: '2023-01-01',
        is_approved_by_patient: false,
      },
    })
    const statusApproved = getTreatmentPlanStatus({
      treatmentPlan: {
        ...basePlan,
        approved_by_patient_at: '2023-01-01',
        is_approved_by_patient: true,
      },
    })
    expect(statusSent).toBe('SENT_TO_PATIENT')
    expect(statusApproved).toBe('PATIENT_APPROVED')
  })

  it('uses approver status for organization on received plan', () => {
    mockUseAllUserPlan.mockReturnValue({
      isOrganization: true,
      isPractice: false,
      isDesignLabUser: false,
      isCustomer: false,
      isVendor: false,
      isGrowthPlanUser: false,
    })
    const status = getTreatmentPlanStatus({
      treatmentPlan: basePlan,
      isReceivedPlan: true,
    })
    expect(status).toBe(treatmentPlanStatusConstants.APPROVED)
  })

  it('uses initiator status for design lab/vendor/growth users', () => {
    mockUseAllUserPlan.mockReturnValue({
      isOrganization: false,
      isPractice: false,
      isDesignLabUser: true,
      isCustomer: false,
      isVendor: false,
      isGrowthPlanUser: false,
    })
    const status = getTreatmentPlanStatus({treatmentPlan: basePlan})
    expect(status).toBe(treatmentPlanStatusConstants.SENT_FOR_APPROVAL)
  })

  it('uses approver status for practice/customer users', () => {
    mockUseAllUserPlan.mockReturnValue({
      isOrganization: false,
      isPractice: true,
      isDesignLabUser: false,
      isCustomer: false,
      isVendor: false,
      isGrowthPlanUser: false,
    })
    const status = getTreatmentPlanStatus({treatmentPlan: basePlan})
    expect(status).toBe(treatmentPlanStatusConstants.APPROVED)
  })

  it('returns treatment plan status when not draft', () => {
    const status = getTreatmentPlanStatus({
      treatmentPlan: {...basePlan, status: treatmentPlanStatusConstants.PUBLISHED},
    })
    expect(status).toBe(treatmentPlanStatusConstants.PUBLISHED)
  })
})
