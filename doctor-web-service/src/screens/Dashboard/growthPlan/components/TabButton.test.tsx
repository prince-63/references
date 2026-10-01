import React from 'react'
import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TabButton from './TabButton'

jest.mock('utils/getColorPalette', () => () => ({
  primarySupport: '#abc',
  primaryColor: '#001122',
  white: '#ffffff',
  lighterGray: '#dddddd',
}))

describe('TabButton', () => {
  it('applies active styling and fires click', async () => {
    expect.assertions(3)
    const onClick = jest.fn()
    render(<TabButton active label='Planning' count={5} onClick={onClick} />)

    const btn = screen.getByRole('button', {name: /planning/i})
    expect(btn).toHaveStyle({backgroundColor: '#abc', color: 'black'})
    expect(screen.getByText('5')).toBeInTheDocument()

    await userEvent.click(btn)
    expect(onClick).toHaveBeenCalled()
  })

  it('falls back to inactive styles when not active', () => {
    expect.assertions(1)
    render(<TabButton active={false} label='Tracking' count={0} onClick={() => {}} />)

    const btn = screen.getByRole('button', {name: /tracking/i})
    expect(btn).toHaveStyle({backgroundColor: '#fff', borderColor: '#dddddd'})
  })
})
