import pendingPatientsFilterOption from './pendingPatientsFilterOption'
import thingsToDOFilterOption from './thingsToDOFilterOption'

describe('dashboard constants', () => {
  it('lists pending patients filters', () => {
    const labels = pendingPatientsFilterOption.map((item) => item.label.trim())
    const values = pendingPatientsFilterOption.map((item) => item.value)

    expect(labels).toEqual(['Setup treatment plan', 'Add tracking', 'Connect with patient'])
    expect(values).toEqual(expect.arrayContaining(values))
    expect(values).toHaveLength(3)
  })

  it('lists things-to-do filter options in order', () => {
    const labels = thingsToDOFilterOption.map((item) => item.label)
    const values = thingsToDOFilterOption.map((item) => item.value)

    expect(labels).toEqual(['All', 'Aligner changes', 'Aligner check-ins', 'Issues reported'])
    expect(values).toHaveLength(4)
  })
})
