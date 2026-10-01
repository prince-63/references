import React from 'react'
import {render, screen} from '@testing-library/react'
import StatusPill from './StatusPill'

jest.mock('utils/getColorPalette', () => () => ({
  tertiarySupport: '#d1e7dd',
  tertiaryColor: '#0f5132',
  orangeSupport: '#ffeed3',
  orange: '#b45f06',
  redSupport: '#fde2e1',
  red: '#b91c1c',
  secondarySupport: '#eef2ff',
  secondaryColor: '#4338ca',
}))

describe('StatusPill', () => {
  it('renders with tone colors', () => {
    expect.assertions(1)
    render(<StatusPill count={7} tone='error' />)
    const pill = screen.getByText('7')
    expect(pill).toHaveStyle({backgroundColor: '#fde2e1', color: '#b91c1c'})
  })
})
