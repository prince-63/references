import React from 'react'
import {render, screen} from '@testing-library/react'
import StorageLoaderSection from './StorageLoaderSection'
import useSubscriptionDetails from '@hooks/useSubscriptionDetails'
import {useSelector} from 'react-redux'

jest.mock('@hooks/useSubscriptionDetails', () => ({
  __esModule: true,
  default: jest.fn(),
}))

jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
}))

jest.mock('antd', () => ({
  Progress: ({percent, status}: {percent?: number; status?: string}) => (
    <div data-testid='progress' data-percent={percent} data-status={status} />
  ),
}))

const mockUseSubscriptionDetails = useSubscriptionDetails as jest.Mock
const mockUseSelector = useSelector as jest.Mock

const baseMigrationData = {
  total_files: 10,
  migrated_files: 4,
  failed_files: 1,
  remaining_files: 5,
  progress_percentage: 40,
  current_file_name: 'file.pdf',
}

describe('StorageLoaderSection', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseSelector.mockImplementation((selector: any) =>
      selector({settings: {dataMigrationCountsData: baseMigrationData}})
    )
  })

  it('returns null when migration status is missing', () => {
    expect.assertions(1)
    mockUseSubscriptionDetails.mockReturnValue({subscriptionData: {}})

    const {container} = render(<StorageLoaderSection />)
    expect(container.firstChild).toBeNull()
  })

  it('shows in-progress state with counts and current file', () => {
    expect.assertions(5)
    mockUseSubscriptionDetails.mockReturnValue({
      subscriptionData: {gdrive_migration_status: 'IN_PROGRESS'},
    })

    render(<StorageLoaderSection />)

    expect(screen.getByText('Migration in Progress')).toBeInTheDocument()
    expect(screen.getByText('Total files:')).toBeInTheDocument()
    expect(screen.getByText('Migrated:')).toBeInTheDocument()
    expect(screen.getByText('Current file:')).toBeInTheDocument()
    expect(screen.getByTestId('progress')).toHaveAttribute('data-percent', '40')
  })

  it('shows completed state and renders final progress', () => {
    expect.assertions(2)
    mockUseSubscriptionDetails.mockReturnValue({
      subscriptionData: {gdrive_migration_status: 'COMPLETED'},
    })

    render(<StorageLoaderSection />)

    expect(screen.getByText('Migration Successfully Completed')).toBeInTheDocument()
    expect(screen.getByTestId('progress')).toHaveAttribute('data-percent', '100')
  })

  it('shows failed state with exception progress', () => {
    expect.assertions(2)
    mockUseSubscriptionDetails.mockReturnValue({
      subscriptionData: {gdrive_migration_status: 'FAILED'},
    })

    render(<StorageLoaderSection />)

    expect(screen.getByText('Migration Failed')).toBeInTheDocument()
    expect(screen.getByTestId('progress')).toHaveAttribute('data-status', 'exception')
  })
})
