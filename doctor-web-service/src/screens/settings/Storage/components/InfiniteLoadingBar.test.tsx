import React from 'react'
import {render, screen} from '@testing-library/react'
import InfiniteLoadingBar from './InfiniteLoadingBar'

describe('InfiniteLoadingBar', () => {
  it('renders title and loading bar', () => {
    expect.assertions(2)
    const {container} = render(<InfiniteLoadingBar title='Loading files' />)

    expect(screen.getByText('Loading files')).toBeInTheDocument()
    expect(container.querySelector('.animate-loading-bar')).toBeInTheDocument()
  })
})
