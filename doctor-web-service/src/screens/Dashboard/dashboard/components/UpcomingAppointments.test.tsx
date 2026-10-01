import React from 'react'
import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import UpcomingAppointments from './UpcomingAppointments'

const mockNavigate = jest.fn()

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}))

// eslint-disable-next-line react/display-name
jest.mock('screens/Calendar/CalendarPage', () => () => <div data-testid='calendar-page' />)

// eslint-disable-next-line react/display-name
jest.mock('screens/Dashboard/components/BorderedCard', () => ({children}: any) => (
  <div data-testid='bordered-card'>{children}</div>
))

describe('UpcomingAppointments', () => {
  it('renders calendar widget and navigates to full calendar', async () => {
    const user = userEvent
    render(<UpcomingAppointments />)

    expect(screen.getByTestId('calendar-page')).toBeInTheDocument()
    await user.click(screen.getByText('View all'))
    expect(mockNavigate).toHaveBeenCalledWith('/calendar')
  })
})
