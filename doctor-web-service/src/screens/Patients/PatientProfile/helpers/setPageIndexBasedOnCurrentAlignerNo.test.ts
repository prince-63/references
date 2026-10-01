import {setPageIndexBasedOnCurrentAlignerNo} from './setPageIndexBasedOnCurrentAlignerNo'

describe('setPageIndexBasedOnCurrentAlignerNo', () => {
  it('sets page index based on aligner number offset', () => {
    const setPageIndex = jest.fn()
    const table = {setPageIndex} as any
    const dataTreatmentPlan = {
      aligner_journeys: [{lower_range: [1], upper_range: [10]}],
    }

    setPageIndexBasedOnCurrentAlignerNo(15, table, dataTreatmentPlan)

    expect(setPageIndex).toHaveBeenCalledWith(1)
  })
})
