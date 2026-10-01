import React from 'react'
import {render, screen, fireEvent} from '@testing-library/react'
import UserFilterBar from './UserFilterBar'
import userFilterRouteConstants from '@constants/userFilter.route.constants'

const mockNavigate = jest.fn()
const mockUseNavigate = jest.fn()

jest.mock('context/CustomNavigationContext', () => ({
  useNavigate: () => mockUseNavigate(),
}))

jest.mock('react-router-dom', () => ({
  useLocation: jest.fn(),
}))

const {useLocation} = jest.requireMock('react-router-dom')

type FilterRecord = Record<string, boolean>
const buildFilter = (active?: string) => {
  const base: FilterRecord = {
    [userFilterRouteConstants.USERS]: false,
    [userFilterRouteConstants.ROLES]: false,
  }
  if (active) base[active] = true
  return base as any
}

describe('UserFilterBar', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useLocation as jest.Mock).mockReturnValue({pathname: '/settings/user-management'})
    mockUseNavigate.mockReturnValue({navigate: mockNavigate, shouldBlock: false})
  })

  it('activates tab from URL on mount', () => {
    expect.assertions(3)
    const handleFilterChange = jest.fn()
    ;(useLocation as jest.Mock).mockReturnValue({pathname: '/settings/user-management/roles'})

    render(<UserFilterBar filter={buildFilter()} handleFilterChange={handleFilterChange} />)

    expect(handleFilterChange).toHaveBeenCalledWith(userFilterRouteConstants.ROLES)
    expect(screen.getByText('Users')).toBeInTheDocument()
    expect(screen.getByText('Roles')).toBeInTheDocument()
  })

  it('defaults to USERS when no matching path', () => {
    expect.assertions(1)
    const handleFilterChange = jest.fn()

    render(<UserFilterBar filter={buildFilter()} handleFilterChange={handleFilterChange} />)

    expect(handleFilterChange).toHaveBeenCalledWith(userFilterRouteConstants.USERS)
  })

  it('handles navigation when unblocked', () => {
    expect.assertions(2)
    const handleFilterChange = jest.fn()

    render(
      <UserFilterBar
        filter={buildFilter(userFilterRouteConstants.USERS)}
        handleFilterChange={handleFilterChange}
      />
    )

    fireEvent.click(screen.getByText('Roles'))

    expect(handleFilterChange).toHaveBeenCalledWith(userFilterRouteConstants.ROLES)
    expect(mockNavigate).toHaveBeenCalledWith('/settings/user-management/roles')
  })

  it('skips handleFilterChange on click when navigation is blocked', () => {
    expect.assertions(3)
    const handleFilterChange = jest.fn()
    mockUseNavigate.mockReturnValue({navigate: mockNavigate, shouldBlock: true})

    render(<UserFilterBar filter={buildFilter()} handleFilterChange={handleFilterChange} />)

    expect(handleFilterChange).toHaveBeenCalledWith(userFilterRouteConstants.USERS)

    fireEvent.click(screen.getByText('Users'))

    expect(handleFilterChange).toHaveBeenCalledTimes(1)
    expect(mockNavigate).toHaveBeenCalledWith('/settings/user-management/')
  })
})
