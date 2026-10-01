import React from 'react'
import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MetricCardForPractice from './MetricCardForPractice'

jest.mock('utils/getColorPalette', () => () => ({
  primaryColor: '#0055aa',
  neutralBlack: '#111',
  textColor: '#222',
}))

describe('MetricCardForPractice', () => {
  it('uses zero styling and renders as non-clickable container', () => {
    expect.assertions(2)
    const {container} = render(
      <MetricCardForPractice label='Unknown' value={'0'} description='desc' icon={<span />} />
    )

    // Wrapper should be a div when onClick is absent
    expect(container.querySelector('button')).toBeNull()
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper).toHaveStyle({backgroundColor: '#F3F4F6'})
  })

  it('uses preset styling and handles clicks when provided', async () => {
    expect.assertions(4)
    const onClick = jest.fn()
    const {container} = render(
      <MetricCardForPractice
        label='At Risk'
        value={3}
        onClick={onClick}
        icon={<span data-testid='icon-node' />}
      />
    )

    const btn = container.querySelector('button') as HTMLElement
    expect(btn).toBeInTheDocument()
    expect(btn).toHaveStyle({backgroundColor: '#F4EEE5'})

    await userEvent.click(btn)
    expect(onClick).toHaveBeenCalled()

    const iconTile = screen.getByTestId('icon-node').parentElement as HTMLElement
    expect(iconTile).toHaveStyle({color: '#9A5B11'})
  })
})
