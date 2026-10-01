import React from 'react'
import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import NewTab from './NewTab'
import {KanbanDetailItem} from '../types'

const mockNavigate = jest.fn()

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}))

jest.mock('utils/getColorPalette', () => () => ({
  neutralBlack: '#111',
  textColor: '#222',
  lighterGray: '#e5e7eb',
  primaryColor: '#123456',
}))

const buildMap = (items: KanbanDetailItem[]) => new Map(items.map((i) => [i.kanban_name, i]))

describe('NewTab', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders empty state and navigates to add case', async () => {
    expect.assertions(2)
    render(
      <NewTab
        newCaseTotal={0}
        kanbanByName={buildMap([])}
        hideZero={false}
        isPracticeView={false}
        growth={{}}
      />
    )

    expect(screen.getByText('No cases at the moment')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', {name: /add a case/i}))
    expect(mockNavigate).toHaveBeenCalledWith('/aligner-orders?workFlow=new-case')
  })

  it('filters zero counts when hideZero is true and hides assignee panel for practice view', () => {
    expect.assertions(3)
    const kanban: KanbanDetailItem = {
      kanban_name: 'NEW CASE',
      total_count: 3,
      status_labels: [
        {label_name: 'Pending', count: 0},
        {label_name: 'Waiting', count: 2},
      ],
    }

    render(
      <NewTab
        newCaseTotal={3}
        kanbanByName={buildMap([kanban])}
        hideZero={true}
        isPracticeView={true}
        growth={{}}
      />
    )

    expect(screen.queryByText('PENDING')).toBeNull()
    expect(screen.getByText('WAITING')).toBeInTheDocument()
    expect(screen.queryByText('Assignee Distribution')).toBeNull()
  })

  it('shows assignee distribution for org view', () => {
    expect.assertions(2)
    const kanban: KanbanDetailItem = {
      kanban_name: 'NEW CASE',
      total_count: 1,
      status_labels: [{label_name: 'Draft', count: 1}],
    }

    render(
      <NewTab
        newCaseTotal={1}
        kanbanByName={buildMap([kanban])}
        hideZero={false}
        isPracticeView={false}
        growth={{
          new_case_assignee_distribution: [
            {user_name: 'Alex', role: 'Ops', percentage: 50, case_count: 5},
          ],
        }}
      />
    )

    expect(screen.getByText('Assignee Distribution')).toBeInTheDocument()
    expect(screen.getByText('Alex')).toBeInTheDocument()
  })
})
