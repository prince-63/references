import React from 'react'
import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PracticeHeaderMetrics from './PracticeHeaderMetrics'

const mockDashboard = jest.fn()
const mockActiveProfile = jest.fn()
const mockNavigate = jest.fn()

jest.mock('@hooks/useDashboard', () => () => mockDashboard())
jest.mock('@hooks/useActiveProfile', () => () => mockActiveProfile())
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}))

jest.mock('utils/getColorPalette', () => () => ({
  primaryColor: '#123',
  neutralBlack: '#111',
  textColor: '#222',
  lighterGray: '#eee',
}))

describe('PracticeHeaderMetrics', () => {
  const goToAlignerTrackingByStage = jest.fn()
  const goToAnalyticsWithCompliance = jest.fn()
  const goToAnalyticsPendingUpdates = jest.fn()
  const goToPatientsByAppConnection = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockActiveProfile.mockReturnValue({customerTrackingEnabled: true})
    mockDashboard.mockReturnValue({
      practice_connected_to_org: {
        my_tasks: {
          confirm_and_send_cases: 2,
          approve_treatment_plan: 5,
          finalize_treatment_plan: 1,
          aligner_updates: 3,
        },
        patients_summary: {starting_soon: 7},
        patient_compliance: {needs_attention: 4, at_risk: 2},
        pending_updates: {unique_patients_with_pending_updates: 3},
        app_connection_status: {pending: 6},
      },
    })
  })

  it('hides tracking metrics when customer tracking is disabled', () => {
    expect.assertions(2)
    mockActiveProfile.mockReturnValue({customerTrackingEnabled: false})

    render(
      <PracticeHeaderMetrics
        goToAlignerTrackingByStage={goToAlignerTrackingByStage}
        goToAnalyticsWithCompliance={goToAnalyticsWithCompliance}
        goToAnalyticsPendingUpdates={goToAnalyticsPendingUpdates}
        goToPatientsByAppConnection={goToPatientsByAppConnection}
      />
    )

    expect(screen.queryByText('STARTING SOON')).toBeNull()
    expect(screen.queryByText('NEEDS ATTENTION')).toBeNull()
  })

  it('invokes navigation and callbacks for each core task', async () => {
    expect.assertions(8)
    render(
      <PracticeHeaderMetrics
        goToAlignerTrackingByStage={goToAlignerTrackingByStage}
        goToAnalyticsWithCompliance={goToAnalyticsWithCompliance}
        goToAnalyticsPendingUpdates={goToAnalyticsPendingUpdates}
        goToPatientsByAppConnection={goToPatientsByAppConnection}
      />
    )

    await userEvent.click(screen.getByText('NEW CASE'))
    expect(mockNavigate).toHaveBeenCalledWith('/aligner-orders?workFlow=new-case')

    await userEvent.click(screen.getByText('APPROVE PLAN'))
    expect(mockNavigate).toHaveBeenCalledWith(
      `/aligner-orders?workFlow=planning-outsource&view=kanban&status=${encodeURIComponent('In Review')}`
    )

    await userEvent.click(screen.getByText('MOVE TO PRODUCTION'))
    expect(mockNavigate).toHaveBeenCalledWith(
      `/aligner-orders?workFlow=planning-outsource&view=kanban&status=${encodeURIComponent('Approved')}`
    )

    await userEvent.click(screen.getByText('STARTING SOON'))
    expect(goToAlignerTrackingByStage).toHaveBeenCalledWith('Starting Soon')

    await userEvent.click(screen.getByText('NEEDS ATTENTION'))
    expect(goToAnalyticsWithCompliance).toHaveBeenCalledWith('NEEDS_ATTENTION')

    await userEvent.click(screen.getByText('AT RISK'))
    expect(goToAnalyticsWithCompliance).toHaveBeenCalledWith('AT_RISK')

    await userEvent.click(screen.getByText('ALIGNER CHANGES & CHECK-INS'))
    expect(goToAnalyticsPendingUpdates).toHaveBeenCalled()

    await userEvent.click(screen.getByText('INVITATIONS PENDING'))
    expect(goToPatientsByAppConnection).toHaveBeenCalledWith('PENDING')
  })
})
