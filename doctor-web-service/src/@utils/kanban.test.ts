import {formatManufacturingLabel, parsePlanSummary, truncateText} from './kanban'

describe('kanban utils', () => {
  it('formats manufacturing label with defaults when data is sparse', () => {
    const label = formatManufacturingLabel({})
    expect(label).toBe('Unknown-BX-V?-UNK-?X')
  })

  it('formats manufacturing label with provided values', () => {
    const label = formatManufacturingLabel({
      patient_name: 'alice wonder',
      manufacturing_sub_task_response: {
        treatment_version: 'v2',
        batch_number: 5,
        category: 'retainer',
        jaw_type: 'Lower',
        aligner_number: 12,
      },
    })
    expect(label).toBe('Alice-B5-V2-RET-L12')
  })

  it('truncates text above max length', () => {
    expect(truncateText('  some really long string here  ', 10)).toBe('some really...')
    expect(truncateText(null)).toBe('')
  })

  it('parses plan summary counts from message', () => {
    const result = parsePlanSummary('3 Draft, 2 Sent for Approval, 1 Re-Plan, 5 Approved')
    expect(result.draft).toBe(3)
    expect(result.pendingReview).toBe(2)
    expect(result.inRevision).toBe(1)
    expect(result.approved).toBe(5)
    expect(result.raw).toMatchObject({Draft: 3, 'Sent for Approval': 2, 'Re-Plan': 1, Approved: 5})
  })
})
