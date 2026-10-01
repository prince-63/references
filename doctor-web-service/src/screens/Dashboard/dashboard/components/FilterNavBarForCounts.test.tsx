import React from 'react'
import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import FilterNavBarForCounts from './FilterNavBarForCounts'
import filterCountsConstants from '@constants/filterCounts.constants'
import useAllUserPlan from '@hooks/useAllUserPlan'

jest.mock('@hooks/useAllUserPlan', () => ({
  __esModule: true,
  default: jest.fn(() => ({isStarterPlanUser: false})),
}))

const mockUseAllUserPlan = useAllUserPlan as jest.Mock

describe('FilterNavBarForCounts', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseAllUserPlan.mockReturnValue({isStarterPlanUser: false})
  })

  it('hides braces option for non-starter plans', async () => {
    expect.assertions(2)
    const onChange = jest.fn()
    render(
      <FilterNavBarForCounts
        filterOptions={[
          {value: filterCountsConstants.ALIGNER, label: 'Aligner'},
          {value: filterCountsConstants.BRACES, label: 'Braces'},
        ]}
        filter={{[filterCountsConstants.ALIGNER]: true, [filterCountsConstants.BRACES]: false}}
        handleFilterChange={onChange}
      />
    )

    expect(screen.queryByText('Braces')).toBeNull()
    await userEvent.click(screen.getByText('Aligner'))
    expect(onChange).toHaveBeenCalledWith(filterCountsConstants.ALIGNER)
  })

  it('shows braces option for starter plan user', () => {
    expect.assertions(1)
    mockUseAllUserPlan.mockReturnValueOnce({isStarterPlanUser: true})
    render(
      <FilterNavBarForCounts
        filterOptions={[{value: filterCountsConstants.BRACES, label: 'Braces'}]}
        filter={{[filterCountsConstants.BRACES]: false}}
        handleFilterChange={jest.fn()}
      />
    )

    expect(screen.getByText('Braces')).toBeInTheDocument()
  })
})
