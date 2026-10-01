import React from 'react'
import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PlanningTab from './PlanningTab'
import {KanbanDetailItem} from '../types'

const mockNavigate = jest.fn()

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}))

const buildMap = (items: KanbanDetailItem[]) => new Map(items.map((i) => [i.kanban_name, i]))

const tone = () => 'info' as const

describe('PlanningTab', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('shows only outsourced bucket for practice view and filters zero items', () => {
    expect.assertions(4)
    const map = buildMap([
      {
        kanban_name: 'PLANS OUTSOURCED',
        total_count: 2,
        status_labels: [
          {label_name: 'Pending', count: 0},
          {label_name: 'Ready', count: 2},
        ],
      },
    ])

    render(
      <PlanningTab
        planningTotal={2}
        isPracticeView={true}
        kanbanByName={map}
        hideZero={true}
        growth={{}}
        criticalTone={tone}
      />
    )

    // Heading should collapse to PLANNING label in practice view
    expect(screen.getByText('PLANNING')).toBeInTheDocument()
    expect(screen.queryByText('PENDING')).toBeNull()
    expect(screen.getByText('READY')).toBeInTheDocument()
    expect(screen.queryByText('Assignee Distribution')).toBeNull()
  })

  it('navigates to correct workflow per group', async () => {
    expect.assertions(2)
    const map = buildMap([
      {kanban_name: 'PLANNING', total_count: 1, status_labels: [{label_name: 'Draft', count: 1}]},
      {
        kanban_name: 'PLANS OUTSOURCED',
        total_count: 1,
        status_labels: [{label_name: 'Review', count: 1}],
      },
    ])

    render(
      <PlanningTab
        planningTotal={2}
        isPracticeView={false}
        kanbanByName={map}
        hideZero={false}
        growth={{planning_operation_assignee_distribution: []}}
        criticalTone={(label) => (label === 'Draft' ? 'warning' : 'info')}
      />
    )

    await userEvent.click(screen.getByText('DRAFT'))
    expect(mockNavigate).toHaveBeenCalledWith(
      '/aligner-orders?workFlow=planning-in-house&status=Draft'
    )

    await userEvent.click(screen.getByText('REVIEW'))
    expect(mockNavigate).toHaveBeenCalledWith(
      '/aligner-orders?workFlow=planning-outsource&status=Review'
    )
  })
})
