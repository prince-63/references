import React from 'react'
import {render, screen} from '@testing-library/react'
import {TreatmentCounts} from './TreatmentCounts'
import type {ITreatmentCounts} from 'redux/Slices/AppSlice/DoctorDashboard/DoctorDashboardSlice'

jest.mock('chart.js', () => ({
  Chart: class {
    static register = jest.fn()
  },
  ArcElement: 'ArcElement',
  Tooltip: 'Tooltip',
  Legend: 'Legend',
  Animation: 'Animation',
}))

jest.mock('react-chartjs-2', () => ({
  Doughnut: ({data}: any) => (
    <div data-testid='chart'>{JSON.stringify(data.datasets?.[0]?.data ?? [])}</div>
  ),
}))

jest.mock('@hooks/useFilter', () => jest.fn())
const mockUseFilter = jest.requireMock('@hooks/useFilter') as jest.Mock

jest.mock('./FilterNavBarForCounts', () => ({
  __esModule: true,
  default: ({filterOptions}: any) => (
    <div data-testid='filter-nav'>{filterOptions.length} options</div>
  ),
}))

const baseCounts: ITreatmentCounts = {
  patient_count: {total: 0, lead: 0, active: 0} as any,
  lead_count: {total: 0, in_assessment: 0, in_planning: 0, tracking_pending: 0} as any,
  all_treatments: {starting_soon: 1, ongoing: 2, paused: 0, refinement: 1} as any,
  aligner_treatments: {starting_soon: 2, ongoing: 1, paused: 1, refinement: 0} as any,
  braces_treatments: {ongoing: 3} as any,
  upcoming_appointments: [] as any,
  upcoming_aligner_changes: [] as any,
  things_to_do: {count: 0} as any,
}

describe('TreatmentCounts', () => {
  beforeEach(() => {
    mockUseFilter.mockReset()
  })

  it('summarizes all treatments and renders legend labels', () => {
    mockUseFilter.mockReturnValue({
      filter: {ALL: true, ALIGNERS: false, BRACES: false},
      handleFilterChange: jest.fn(),
    })

    render(<TreatmentCounts {...baseCounts} />)

    expect(screen.getByText('Active treatments')).toBeInTheDocument()
    expect(screen.getByTestId('chart')).toHaveTextContent('[1,2,0,1]')
    expect(screen.getByText('Starting soon')).toBeInTheDocument()
    expect(screen.getByText('Ongoing')).toBeInTheDocument()
    expect(screen.getByText('Paused')).toBeInTheDocument()
    expect(screen.getByText('In Refinement')).toBeInTheDocument()
    expect(screen.getByText('4')).toBeInTheDocument()
  })

  it('shows braces-only data when braces filter is active', () => {
    mockUseFilter.mockReturnValue({
      filter: {ALL: false, ALIGNERS: false, BRACES: true},
      handleFilterChange: jest.fn(),
    })

    render(<TreatmentCounts {...baseCounts} />)

    expect(screen.getByTestId('chart')).toHaveTextContent('[3]')
    expect(screen.getByText('Ongoing')).toBeInTheDocument()
    expect(screen.getAllByText('3')).toHaveLength(2)
  })

  it('shows placeholder ring when total steps is zero', () => {
    mockUseFilter.mockReturnValue({
      filter: {ALL: true, ALIGNERS: false, BRACES: false},
      handleFilterChange: jest.fn(),
    })

    const zeroCounts = {
      ...baseCounts,
      all_treatments: {starting_soon: 0, ongoing: 0, paused: 0, refinement: 0} as any,
    }

    render(<TreatmentCounts {...zeroCounts} />)

    expect(screen.getByTestId('chart')).toHaveTextContent('[0,0,0,0,1]')
  })
})
