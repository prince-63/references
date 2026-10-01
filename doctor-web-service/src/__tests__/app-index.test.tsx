import React from 'react'
import type {Mock} from 'jest-mock'

// ---- Shared mocks ----
jest.mock('react-dom/client', () => {
  const renderMock = jest.fn()
  const mockCreateRoot = jest.fn(() => ({render: renderMock, unmount: jest.fn()}))
  return {createRoot: mockCreateRoot, __renderMock: renderMock}
})

jest.mock('../reportWebVitals', () => jest.fn())
jest.mock('../utils/generateCssVariables', () => jest.fn())
jest.mock('utils/getBrandConfig', () => jest.fn(() => ({name: 'BrandX', favIcon: 'icon.png'})))
jest.mock('../services/firebase', () => ({}))

jest.mock('react-redux', () => {
  const actual = jest.requireActual('react-redux')
  return {
    ...actual,
    Provider: ({children}: {children: React.ReactNode}) => <>{children}</>,
    useSelector: jest.fn(),
  }
})

jest.mock('redux-persist/integration/react', () => ({
  PersistGate: ({children}: {children: React.ReactNode}) => <>{children}</>,
}))

jest.mock('antd', () => ({
  ConfigProvider: ({children}: any) => <>{children}</>,
  Modal: ({children}: any) => <div data-testid='modal'>{children}</div>,
}))
// eslint-disable-next-line @typescript-eslint/no-var-requires, react/display-name
jest.mock('../routes/Routes', () => () => <div data-testid='routes' />)
// eslint-disable-next-line @typescript-eslint/no-var-requires, react/display-name
jest.mock('CustomStlViewer', () => () => <div data-testid='mock-stl-viewer' />)
jest.mock('@utils/eventEmitter', () => ({eventEmitter: {on: jest.fn(), off: jest.fn()}}))
jest.mock('utils/getColorPalette', () => ({
  __esModule: true,
  default: () => ({primaryColor: '#000', mediumGray: '#111'}),
  getCssVariables: () => ({'--primary': '#000'}),
}))
jest.mock('@hooks/useNetworkStatus', () => () => ({isOnline: true}))
jest.mock(
  'components/when/When',
  () =>
    ({isTrue, children}: any) =>
      isTrue ? children : null
)

describe('index bootstrap', () => {
  beforeEach(() => {
    jest.resetModules()
    document.head.innerHTML = ''
    document.body.innerHTML = ''
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const client = require('react-dom/client')
    client.createRoot.mockClear()
  })

  it('creates root, sets brand metadata, and renders App', async () => {
    const rootEl = document.createElement('div')
    rootEl.id = 'root'
    document.body.appendChild(rootEl)

    jest.isolateModules(() => {
      require('../index')
    })
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const client = require('react-dom/client')
    expect(client.createRoot).toHaveBeenCalledWith(rootEl)
    const renderFn = client.createRoot.mock.results[0].value.render
    expect(renderFn).toHaveBeenCalled()
    expect(document.title).toBe('BrandX')
    const favicon = document.head.querySelector("link[rel='icon']") as HTMLLinkElement
    expect(favicon?.href).toContain('icon.png')
  })
})

describe('App component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const {useSelector} = require('react-redux') as {useSelector: Mock}
    useSelector.mockReturnValue({isStlPreviewVisible: true})
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const client = require('react-dom/client') as {createRoot: Mock}
    client.createRoot.mockImplementation(() => ({render: jest.fn(), unmount: jest.fn()}))
  })

  it('renders inner app with STL viewer when online', () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const App = require('../App').default
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const ReactDOMServer = require('react-dom/server') as typeof import('react-dom/server')
    const markup = ReactDOMServer.renderToString(<App />)
    expect(markup).toContain('app')
    expect(markup).toContain('mock-stl-viewer')
  })
})
