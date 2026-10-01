import React from 'react'
import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AllTab from './AllTab'

const mockActiveProfile = jest.fn()

jest.mock('utils/getColorPalette', () => () => ({
  textColor: '#333',
}))

jest.mock('@hooks/useActiveProfile', () => () => mockActiveProfile())

describe('AllTab', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockActiveProfile.mockReturnValue({customerTrackingEnabled: true})
  })

  const baseGrowth = {
    team_workload_overview: [
      {user_name: 'Jane Doe', role: 'Planner', percentage: 50, assignee_type: 'internal'},
    ],
  }

  it('renders summary cards and triggers tab switches on click', async () => {
    expect.assertions(4)
    const setActiveTab = jest.fn()
    render(
      <AllTab
        newCaseTotal={1}
        planningTotal={2}
        productionTotal={3}
        trackingTotal={4}
        setActiveTab={setActiveTab}
        growth={baseGrowth}
      />
    )

    await userEvent.click(screen.getByText('New Case Operations'))
    expect(setActiveTab).toHaveBeenCalledWith('NEW')

    await userEvent.click(screen.getByText('Treatment Tracking'))
    expect(setActiveTab).toHaveBeenCalledWith('TRACKING')

    expect(screen.getByText('Jane Doe')).toBeInTheDocument()
    expect(screen.getByText('JD')).toBeInTheDocument()
  })

  it('omits tracking and workload section when disabled or empty', () => {
    expect.assertions(2)
    mockActiveProfile.mockReturnValue({customerTrackingEnabled: false})

    render(
      <AllTab
        newCaseTotal={0}
        planningTotal={0}
        productionTotal={0}
        trackingTotal={0}
        setActiveTab={jest.fn()}
        growth={{team_workload_overview: []}}
      />
    )

    expect(screen.queryByText('Treatment Tracking')).toBeNull()
    expect(screen.queryByText('Team workload overview')).toBeNull()
  })
})
