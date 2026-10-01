import React from 'react'
import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MetricCard, {MetricCardProps} from './MetricCard'

const setup = (props?: Partial<MetricCardProps>) => {
  const onClick = jest.fn()
  render(
    <MetricCard
      label='Active'
      value='10'
      description='subtitle'
      icon={<span data-testid='icon-star' />}
      onClick={onClick}
      {...props}
    />
  )
  return {onClick}
}

describe('MetricCard', () => {
  it('renders label, value, and subtext', () => {
    setup()
    expect(screen.getByText('Active')).toBeInTheDocument()
    expect(screen.getByText('10')).toBeInTheDocument()
    expect(screen.getByText('subtitle')).toBeInTheDocument()
    expect(screen.getByTestId('icon-star')).toBeInTheDocument()
  })

  it('renders a button when onClick is provided', async () => {
    const {onClick} = setup()
    await userEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalled()
  })
})
