import React from 'react'
import {render, screen} from '@testing-library/react'
import TotalPatientCounts, {BodyCounts, CountsCard, HeaderCounts} from './TotalPatientCounts'
import type {ITreatmentCounts} from 'redux/Slices/AppSlice/DoctorDashboard/DoctorDashboardSlice'

jest.mock('@hooks/useAllUserPlan', () => jest.fn())
// eslint-disable-next-line react/display-name
jest.mock('components/atom/SVG/CommonSVG', () => () => <span data-testid='common-svg' />)
const mockUseAllUserPlan = jest.requireMock('@hooks/useAllUserPlan') as jest.Mock

const makeCounts = (): ITreatmentCounts =>
  ({
    patient_count: {total: 12, lead: 4, active: 8} as any,
    lead_count: {
      total: 6,
      in_assessment: 2,
      in_planning: 3,
      tracking_pending: 1,
    } as any,
    all_treatments: {starting_soon: 1, ongoing: 2, paused: 0, refinement: 1} as any,
    aligner_treatments: {starting_soon: 1, ongoing: 1, paused: 1, refinement: 0} as any,
    braces_treatments: {ongoing: 1} as any,
    upcoming_appointments: [] as any,
    upcoming_aligner_changes: [] as any,
    things_to_do: {count: 0} as any,
  }) as unknown as ITreatmentCounts

describe('TotalPatientCounts', () => {
  it('renders summary cards with patient and lead counts', () => {
    const counts = makeCounts()
    render(<TotalPatientCounts {...counts} />)

    expect(screen.getByText('Total patients')).toBeInTheDocument()
    expect(screen.getAllByText('12')[0]).toBeInTheDocument()
    expect(screen.getAllByText('Leads')).toHaveLength(2)
    expect(screen.getByText('Active')).toBeInTheDocument()
    expect(screen.getByText('Tracking Pending')).toBeInTheDocument()
  })

  it('shows braces count for starter plan users only', () => {
    mockUseAllUserPlan.mockReturnValue({isStarterPlanUser: true})
    const {rerender} = render(
      <BodyCounts allPatientCount={{lead: 2, clear_aligner: 3, braces: 1} as any} />
    )
    expect(screen.getByText('Braces')).toBeInTheDocument()

    mockUseAllUserPlan.mockReturnValue({isStarterPlanUser: false})
    rerender(<BodyCounts allPatientCount={{lead: 2, clear_aligner: 3, braces: 1} as any} />)
    expect(screen.queryByText('Braces')).not.toBeInTheDocument()
  })

  it('adds and omits border on CountsCard based on flag', () => {
    const {rerender, getByText} = render(<CountsCard title='Bordered' count={5} />)
    expect(getByText('Bordered').parentElement).toHaveClass('border-r')

    rerender(<CountsCard title='No border' count={3} showBorder={false} />)
    expect(getByText('No border').parentElement).not.toHaveClass('border-r')
  })

  it('renders header counts with icon and total', () => {
    render(<HeaderCounts totalPatients={25} />)
    expect(screen.getByText('Total patients')).toBeInTheDocument()
    expect(screen.getByText('25')).toBeInTheDocument()
    expect(screen.getByTestId('common-svg')).toBeInTheDocument()
  })
})
