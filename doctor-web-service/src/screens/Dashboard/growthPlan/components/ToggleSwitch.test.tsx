import React from 'react'
import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ToggleSwitch from './ToggleSwitch'

jest.mock('utils/getColorPalette', () => () => ({
  textColor: '#222',
  primaryColor: '#123456',
  secondarySupport: '#eeeeee',
  lighterGray: '#cccccc',
}))

describe('ToggleSwitch', () => {
  it('toggles state and calls onChange with next value', async () => {
    expect.assertions(3)
    const onChange = jest.fn()
    const {rerender} = render(
      <ToggleSwitch checked={false} onChange={onChange} label='Hide zero' />
    )

    const toggle = screen.getByRole('switch')
    expect(toggle).toHaveAttribute('aria-checked', 'false')

    await userEvent.click(toggle)
    expect(onChange).toHaveBeenCalledWith(true)

    rerender(<ToggleSwitch checked={true} onChange={onChange} label='Hide zero' />)
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true')
  })
})
