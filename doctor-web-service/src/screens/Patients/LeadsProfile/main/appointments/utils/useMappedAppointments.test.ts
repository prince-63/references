jest.mock('react', () => ({useMemo: (fn: any) => fn()}))
jest.mock('utils/hasValue', () => ({
  __esModule: true,
  default: jest.fn((val) => !!val && (val as any).length > 0),
}))
import useMappedAppointmentsList from './useMappedAppointments'
import hasValue from 'utils/hasValue'

describe('useMappedAppointmentsList', () => {
  const hasValueMock = hasValue as unknown as jest.Mock

  it('returns empty array when appointments falsy', () => {
    hasValueMock.mockReturnValue(false)
    const result = useMappedAppointmentsList({appointments: [] as any})

    expect(result).toEqual([])
  })

  it('returns mapped appointments when present', () => {
    const appointments = [{id: 1}, {id: 2}] as any
    hasValueMock.mockReturnValue(true)

    const result = useMappedAppointmentsList({appointments})

    expect(result).toEqual(appointments)
  })
})
