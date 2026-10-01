import React from 'react'
import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TabMetricItem from './TabMetricItem'

jest.mock('utils/getColorPalette', () => () => ({
  tertiarySupport: '#d1e7dd',
  tertiaryColor: '#0f5132',
  orangeSupport: '#ffeed3',
  orange: '#b45f06',
  redSupport: '#fde2e1',
  red: '#b91c1c',
  neutralBlack: '#111',
  lighterGray: '#e5e7eb',
  textColor: '#222',
  primarySupport: '#eef2ff',
  primaryColor: '#4338ca',
}))

describe('TabMetricItem', () => {
  it('disables interaction when onClick is missing', () => {
    expect.assertions(2)
    render(<TabMetricItem label='Draft' count={0} showLabel={false} />)

    const btn = screen.getByRole('button')
    expect(btn).toBeDisabled()
    expect(btn).not.toHaveTextContent('DRAFT')
  })

  it('fires onClick and applies tone specific styling', async () => {
    expect.assertions(2)
    const onClick = jest.fn()
    render(<TabMetricItem label='Needs Attention' count={2} tone='warning' onClick={onClick} />)

    const btn = screen.getByRole('button')
    expect(btn).toHaveStyle({backgroundColor: '#ffeed3'})
    await userEvent.click(btn)
    expect(onClick).toHaveBeenCalled()
  })
})
