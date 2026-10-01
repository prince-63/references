import React from 'react'
import {render, screen} from '@testing-library/react'
import AssigneeItem from './AssigneeItem'

const baseAssignee = {
  user_name: 'Dr. Who',
  role: 'Admin',
  percentage: 40,
  case_count: 4,
  assignee_type: 'internal' as const,
}

describe('AssigneeItem', () => {
  it('renders name and roles', () => {
    render(<AssigneeItem m={baseAssignee} />)
    expect(screen.getByText('Dr. Who')).toBeInTheDocument()
    expect(screen.getByText('Admin')).toBeInTheDocument()
  })

  it('shows initials and percentage bar', () => {
    render(<AssigneeItem m={baseAssignee} />)
    expect(screen.getByText('DW')).toBeInTheDocument()
    expect(screen.getByText('40% (4 cases)')).toBeInTheDocument()
  })
})
