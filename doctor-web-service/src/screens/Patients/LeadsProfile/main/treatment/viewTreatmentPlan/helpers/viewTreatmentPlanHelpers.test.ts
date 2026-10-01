import formatAligners from './formatAligners'
import formatAlignersForModal from './formatAlignersForModal'
import getCurrentStlFileStep from './getCurrentStlFileStep'
import {shouldShowButton} from './shouldShowButton'
import patientAssignedTypeConstants from '@constants/patientAssignedType.constants'
import treatmentPlanStatusConstants from '@constants/treatmentPlanStatus.constants'

describe('view treatment plan helpers', () => {
  describe('formatAligners', () => {
    it('returns empty array for no aligners', () => {
      expect(formatAligners([])).toEqual([])
    })

    it('groups consecutive aligners into ranges', () => {
      const result = formatAligners([5, 2, 3, 8])

      expect(result).toEqual(['Aligner 02 - 03', 'Aligner 05', 'Aligner 08'])
    })
  })

  describe('formatAlignersForModal', () => {
    it('returns empty string for no aligners', () => {
      expect(formatAlignersForModal([])).toBe('')
    })

    it('returns comma separated ranges for aligners', () => {
      const result = formatAlignersForModal([3, 1, 2, 5, 7, 8])

      expect(result).toBe('01 to 03, 05, 07 to 08')
    })
  })

  describe('getCurrentStlFileStep', () => {
    it('maps statuses to step index', () => {
      expect(
        getCurrentStlFileStep({
          stlFileMetaData: {status: 'STL_FILES_REQUESTED', requested_at: '2024-01-01'} as any,
        })
      ).toBe(0)
      expect(getCurrentStlFileStep({stlFileMetaData: {status: 'STL_FILES_UPLOADED'} as any})).toBe(
        1
      )
      expect(getCurrentStlFileStep({stlFileMetaData: {status: 'APPROVED'} as any})).toBe(2)
    })

    it('returns -1 for missing metadata or missing requested_at', () => {
      expect(getCurrentStlFileStep({})).toBe(-1)
      expect(getCurrentStlFileStep({stlFileMetaData: {status: 'UNKNOWN'} as any})).toBe(-1)
      expect(getCurrentStlFileStep({stlFileMetaData: {status: 'DRAFT'} as any})).toBe(-1)
    })
  })

  describe('shouldShowButton', () => {
    const {ASSIGNED_TO_ME, ASSIGNED_TO_PRACTICE} = patientAssignedTypeConstants
    const {DRAFT, SENT_TO_PATIENT, PENDING_APPROVAL} = treatmentPlanStatusConstants

    it('allows finalize actions for org users when assigned to self in draft', () => {
      const canFinalize = shouldShowButton({
        status: DRAFT,
        userType: 'ORG',
        patientAssigned: ASSIGNED_TO_ME,
        buttonType: 'FINALIZE',
      })

      expect(canFinalize).toBe(true)
    })

    it('blocks finalize for org users when sent to patient but assigned to practice', () => {
      const canFinalize = shouldShowButton({
        status: SENT_TO_PATIENT,
        userType: 'ORG',
        patientAssigned: ASSIGNED_TO_PRACTICE,
        buttonType: 'FINALIZE',
      })

      expect(canFinalize).toBe(false)
    })

    it('allows approval actions for customers in pending approval', () => {
      const canApprove = shouldShowButton({
        status: PENDING_APPROVAL,
        userType: 'CUSTOMER',
        patientAssigned: ASSIGNED_TO_ME,
        buttonType: 'APPROVE',
      })
      const canRequestReplan = shouldShowButton({
        status: PENDING_APPROVAL,
        userType: 'CUSTOMER',
        patientAssigned: ASSIGNED_TO_ME,
        buttonType: 'REQUEST_REPLAN',
      })

      expect(canApprove).toBe(true)
      expect(canRequestReplan).toBe(true)
    })

    it('handles patient approved status rules', () => {
      const canOrgFinalize = shouldShowButton({
        status: 'PATIENT_APPROVED' as any,
        userType: 'ORG',
        patientAssigned: ASSIGNED_TO_PRACTICE,
        buttonType: 'FINALIZE',
      })
      const canCustomerFinalize = shouldShowButton({
        status: 'PATIENT_APPROVED' as any,
        userType: 'CUSTOMER',
        patientAssigned: ASSIGNED_TO_ME,
        buttonType: 'FINALIZE',
      })

      expect(canOrgFinalize).toBe(false)
      expect(canCustomerFinalize).toBe(true)
    })

    it('returns false when status is missing', () => {
      const result = shouldShowButton({
        status: undefined,
        userType: 'ORG',
        patientAssigned: ASSIGNED_TO_ME,
        buttonType: 'FINALIZE',
      })

      expect(result).toBe(false)
    })
  })
})
