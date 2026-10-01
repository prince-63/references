import React from 'react'
import {render} from '@testing-library/react'
import DashIcon from './DashIcon'

describe('DashIcon', () => {
  it('renders svg for known names', () => {
    const {container: usersIcon} = render(<DashIcon name='users' />)
    expect(usersIcon.querySelector('svg')).toBeTruthy()

    const {container: messageIcon} = render(<DashIcon name='message' />)
    expect(messageIcon.querySelector('svg')).toBeTruthy()
  })
})
