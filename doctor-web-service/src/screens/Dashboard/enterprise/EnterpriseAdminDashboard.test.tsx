import React from 'react'
import {render, screen} from '@testing-library/react'
import EnterpriseAdminDashboard from './EnterpriseAdminDashboard'

const mockGrowthPlan = jest.fn()

// eslint-disable-next-line react/display-name
jest.mock('../growthPlan/GrowthPlanDashboard', () => (props: any) => {
  mockGrowthPlan(props)
  return <div data-testid='growth-plan-dash'>growth-plan</div>
})

describe('EnterpriseAdminDashboard', () => {
  it('renders GrowthPlanDashboard wrapper', () => {
    render(<EnterpriseAdminDashboard />)

    expect(screen.getByTestId('growth-plan-dash')).toBeInTheDocument()
    expect(mockGrowthPlan).toHaveBeenCalledWith({})
  })
})
