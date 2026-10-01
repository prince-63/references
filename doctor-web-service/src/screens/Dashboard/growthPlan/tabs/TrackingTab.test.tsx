import React from 'react'
import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TrackingTab from './TrackingTab'

jest.mock('utils/getColorPalette', () => () => ({
  red: '#b91c1c',
  redSupport: '#fde2e1',
  primarySupport: '#eef2ff',
  primaryColor: '#4338ca',
  lighterGray: '#e5e7eb',
  textColor: '#222',
}))

describe('TrackingTab', () => {
  const baseGrowth = {
    treatment_stage: {starting_soon: 1, ongoing: 0, paused: 0, in_refinement: 2, completed: 0},
    patient_compliance: {needs_attention: 3, at_risk: 0, on_track: 0},
    app_connection_status: {connected: 1, pending: 2, not_connected: 0},
    pending_updates: {unique_patients_with_pending_updates: 0},
  }

  it('filters zero-count blocks when hideZero is true and routes clicks', async () => {
    expect.assertions(6)
    const goToStage = jest.fn()
    const goToCompliance = jest.fn()
    const goToApp = jest.fn()
    const goToPendingUpdates = jest.fn()

    render(
      <TrackingTab
        trackingTotal={3}
        growth={baseGrowth}
        hideZero={true}
        goToAlignerTrackingByStage={goToStage}
        goToAnalyticsWithCompliance={goToCompliance}
        goToPatientsByAppConnection={goToApp}
        goToAnalyticsPendingUpdates={goToPendingUpdates}
      />
    )

    await userEvent.click(screen.getByText('STARTING SOON'))
    expect(goToStage).toHaveBeenCalledWith('Starting Soon')

    await userEvent.click(screen.getByText('NEEDS ATTENTION'))
    expect(goToCompliance).toHaveBeenCalledWith('NEEDS_ATTENTION')

    const pendingButtons = screen.getAllByRole('button', {name: /pending/i})
    await userEvent.click(pendingButtons[0])
    expect(goToApp).toHaveBeenCalledWith('PENDING')

    expect(screen.queryByText('PAUSED')).toBeNull()
    expect(screen.queryByText('AT RISK')).toBeNull()
    expect(screen.queryByText('ALIGNER CHANGES & CHECK INS')).toBeNull()
  })

  it('shows pending updates when non-zero and triggers analytics callback', async () => {
    expect.assertions(2)
    const goToPendingUpdates = jest.fn()

    render(
      <TrackingTab
        trackingTotal={1}
        growth={{
          ...baseGrowth,
          pending_updates: {unique_patients_with_pending_updates: 4},
          patient_compliance: {...baseGrowth.patient_compliance, at_risk: 2},
        }}
        hideZero={false}
        goToAlignerTrackingByStage={jest.fn()}
        goToAnalyticsWithCompliance={jest.fn()}
        goToPatientsByAppConnection={jest.fn()}
        goToAnalyticsPendingUpdates={goToPendingUpdates}
      />
    )

    await userEvent.click(screen.getByText('ALIGNER CHANGES & CHECK INS'))
    expect(goToPendingUpdates).toHaveBeenCalled()
    expect(screen.getByText('AT RISK')).toBeInTheDocument()
  })
})
