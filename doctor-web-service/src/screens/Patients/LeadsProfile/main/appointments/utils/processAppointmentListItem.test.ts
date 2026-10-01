import processAppointmentListItem from './processAppointmentListItem'

describe('processAppointmentListItem', () => {
  const baseJaw = {jaw_type: 'UPPER', notes: 'note', attachments: ['a']}

  it('returns same jaw for both when only one jaw or BOTH jaw type', () => {
    const item = {jaws: [{...baseJaw, jaw_type: 'BOTH'}]} as any

    const result = processAppointmentListItem(item)

    expect(result.upperJaw).toEqual({jaw_type: 'BOTH', notes: 'note', attachments: ['a']})
    expect(result.lowerJaw).toEqual(result.upperJaw)
    expect(result.jawType).toBe('BOTH')
  })

  it('processes upper and lower separately when both provided', () => {
    const item = {
      jaws: [baseJaw, {...baseJaw, jaw_type: 'LOWER', notes: undefined, attachments: undefined}],
    } as any

    const result = processAppointmentListItem(item)

    expect(result.upperJaw).toEqual({jaw_type: 'UPPER', notes: 'note', attachments: ['a']})
    expect(result.lowerJaw).toBeNull()
    expect(result.jawType).toBe('UPPER')
  })
})
