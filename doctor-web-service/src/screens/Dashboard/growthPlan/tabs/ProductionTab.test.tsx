import React from 'react'
import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ProductionTab from './ProductionTab'
import {KanbanDetailItem} from '../types'

const mockNavigate = jest.fn()

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}))

const buildMap = (items: KanbanDetailItem[]) => new Map(items.map((i) => [i.kanban_name, i]))

describe('ProductionTab', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders only outsourced group for practice view and hides zero counts', () => {
    expect.assertions(4)
    const map = buildMap([
      {
        kanban_name: 'PRODUCTION OUTSOURCED',
        total_count: 1,
        status_labels: [
          {label_name: 'Queued', count: 0},
          {label_name: 'Ready', count: 1},
        ],
      },
    ])

    render(
      <ProductionTab
        productionTotal={1}
        isPracticeView={true}
        kanbanByName={map}
        hideZero={true}
        growth={{}}
      />
    )

    expect(screen.getByText('PRODUCTION')).toBeInTheDocument()
    expect(screen.queryByText('QUEUED')).toBeNull()
    expect(screen.getByText('READY')).toBeInTheDocument()
    expect(screen.queryByText('Assignee Distribution')).toBeNull()
  })

  it('navigates to different workflows and ongoing production board', async () => {
    expect.assertions(3)
    const map = buildMap([
      {
        kanban_name: 'PRODUCTION',
        total_count: 1,
        status_labels: [{label_name: 'Printing', count: 1}],
      },
      {
        kanban_name: 'PRODUCTION OUTSOURCED',
        total_count: 1,
        status_labels: [{label_name: 'Shipment', count: 1}],
      },
      {
        kanban_name: 'ONGOING PRODUCTION',
        total_count: 1,
        status_labels: [{label_name: 'Finishing', count: 1}],
      },
    ])

    render(
      <ProductionTab
        productionTotal={3}
        isPracticeView={false}
        kanbanByName={map}
        hideZero={false}
        growth={{production_operation_assignee_distribution: []}}
      />
    )

    await userEvent.click(screen.getByText('PRINTING'))
    expect(mockNavigate).toHaveBeenCalledWith(
      '/aligner-orders?workFlow=production-in-house&status=Printing'
    )

    await userEvent.click(screen.getByText('SHIPMENT'))
    expect(mockNavigate).toHaveBeenCalledWith(
      '/aligner-orders?workFlow=production-outsource&status=Shipment'
    )

    await userEvent.click(screen.getByText('FINISHING'))
    expect(mockNavigate).toHaveBeenCalledWith('/aligner-production?status=Finishing')
  })
})
