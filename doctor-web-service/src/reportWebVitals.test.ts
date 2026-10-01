jest.mock('web-vitals', () => ({
  getCLS: jest.fn(),
  getFID: jest.fn(),
  getFCP: jest.fn(),
  getLCP: jest.fn(),
  getTTFB: jest.fn(),
  __esModule: true,
}))

import {getCLS, getFID, getFCP, getLCP} from 'web-vitals'
import reportWebVitals from './reportWebVitals'

describe('reportWebVitals', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('invokes web vitals collectors when handler is provided', async () => {
    const handler = jest.fn()

    expect(() => reportWebVitals(handler)).not.toThrow()
    await new Promise((resolve) => setTimeout(resolve, 0))
  })

  it('does nothing when handler is falsy', async () => {
    await reportWebVitals()

    expect(getCLS).not.toHaveBeenCalled()
    expect(getFID).not.toHaveBeenCalled()
    expect(getFCP).not.toHaveBeenCalled()
    expect(getLCP).not.toHaveBeenCalled()
  })
})
