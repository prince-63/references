// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Mock axios (ES module) to avoid Jest ESM parsing issues and provide predictable defaults
jest.mock('axios', () => {
  const mockAxiosInstance = {
    interceptors: {
      request: {use: jest.fn(), eject: jest.fn()},
      response: {use: jest.fn(), eject: jest.fn()},
    },
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  }

  const mockAxios = {
    create: jest.fn(() => mockAxiosInstance),
    ...mockAxiosInstance,
  }

  return {
    __esModule: true,
    default: mockAxios,
    ...mockAxios,
  }
})

// Mock Supabase client to avoid environment variable requirements in tests
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: {
      onAuthStateChange: jest.fn(() => ({data: {subscription: {unsubscribe: jest.fn()}}})),
      getSession: jest.fn(() => Promise.resolve({data: {session: null}, error: null})),
    },
    from: jest.fn(() => ({select: jest.fn()})),
  })),
}))

// Mock heic2any which depends on browser canvas/Worker APIs not available in jsdom
jest.mock('heic2any', () => jest.fn(() => Promise.resolve(new Blob())))
jest.mock('heic-to', () => ({
  heicTo: jest.fn(() => Promise.resolve(new Blob())),
  isHeic: jest.fn(() => Promise.resolve(true)),
}))

jest.mock('yet-another-react-lightbox', () => ({
  __esModule: true,
  default: () => null,
}))

jest.mock('yet-another-react-lightbox/plugins/fullscreen', () => () => null)
jest.mock('yet-another-react-lightbox/plugins/slideshow', () => () => null)
jest.mock('yet-another-react-lightbox/plugins/thumbnails', () => () => null)
jest.mock('yet-another-react-lightbox/plugins/zoom', () => () => null)

// Provide a minimal Worker stub for libraries that expect it
// eslint-disable-next-line @typescript-eslint/no-empty-function
class WorkerStub {
  constructor() {}
  // eslint-disable-next-line class-methods-use-this
  postMessage() {}
  // eslint-disable-next-line class-methods-use-this
  terminate() {}
  addEventListener() {}
  removeEventListener() {}
}
// @ts-expect-error jsdom global augmentation for tests only
global.Worker = WorkerStub
