import dashboardTypesList from '@staticData/dashboardTypesList'
import '../types/dashboard.types'

describe('dashboard types', () => {
  it('provides dashboard type entries for filters', () => {
    expect(Array.isArray(dashboardTypesList)).toBe(true)
    expect(dashboardTypesList.length).toBeGreaterThan(0)
  })
})
