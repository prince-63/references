import React from 'react'
import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import StorageSelection from './StorageSelection'
import {Storage} from '../Storage'
import useSubscriptionDetails from '@hooks/useSubscriptionDetails'

jest.mock('@hooks/useSubscriptionDetails', () => ({
  __esModule: true,
  default: jest.fn(),
}))

const mockUseSubscriptionDetails = useSubscriptionDetails as jest.Mock

const baseStorageList: Storage[] = [
  {
    name: 'Google Drive',
    description: 'GD',
    image_url: 'gd.png',
    type: 'GDRIVE',
    showComingSoon: false,
  },
  {
    name: 'S3',
    description: 'S3 storage',
    image_url: 's3.png',
    type: 'S3',
    showComingSoon: true,
  },
]

describe('StorageSelection', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseSubscriptionDetails.mockReturnValue({
      subscriptionData: {gdrive_migration_status: 'PENDING'},
    })
  })

  it('renders options, shows coming soon, and calls onSelect on click', async () => {
    expect.assertions(3)
    const onSelect = jest.fn()

    render(
      <StorageSelection storageList={baseStorageList} selected={'GDRIVE'} onSelect={onSelect} />
    )

    expect(screen.getByText('Coming soon')).toBeInTheDocument()

    await userEvent.click(screen.getByText('Google Drive'))
    expect(onSelect).toHaveBeenCalledTimes(1)
    expect(onSelect).toHaveBeenCalledWith(baseStorageList[0])
  })

  it('adds disabled styling for S3 when migration is not pending', () => {
    expect.assertions(1)
    mockUseSubscriptionDetails.mockReturnValue({
      subscriptionData: {gdrive_migration_status: 'COMPLETED'},
    })

    render(<StorageSelection storageList={baseStorageList} selected={'S3'} onSelect={jest.fn()} />)

    const card = screen.getByText('S3').closest('div[role="button"]')
    expect(card).toHaveClass('opacity-50')
  })
})
