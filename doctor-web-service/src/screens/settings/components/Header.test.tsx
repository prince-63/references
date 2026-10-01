import React from 'react'
import {render, screen} from '@testing-library/react'
import Header from './Header'

describe('Header', () => {
  it('renders title and subtitle', () => {
    expect.assertions(2)
    render(<Header title='Main Title' subTitle='Subtitle text' />)

    expect(screen.getByText('Main Title')).toBeInTheDocument()
    expect(screen.getByText('Subtitle text')).toBeInTheDocument()
  })
})
