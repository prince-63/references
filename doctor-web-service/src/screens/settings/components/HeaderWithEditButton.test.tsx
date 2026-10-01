import React from 'react'
import {render, screen} from '@testing-library/react'
import HeaderWithEditButton from './HeaderWithEditButton'

describe('HeaderWithEditButton', () => {
  it('renders title and subtitle', () => {
    expect.assertions(2)
    render(<HeaderWithEditButton title='Header' subTitle='With edit' />)

    expect(screen.getByText('Header')).toBeInTheDocument()
    expect(screen.getByText('With edit')).toBeInTheDocument()
  })
})
