import {isAppView} from './isAppView'
import * as colorModule from './getColorPalette'

const originalEnv = process.env

describe('isAppView', () => {
  const setUserAgent = (ua: string) => {
    Object.defineProperty(window.navigator, 'userAgent', {
      value: ua,
      configurable: true,
    })
  }

  beforeEach(() => {
    ;(window as any).isAppWebView = undefined
    setUserAgent('')
  })

  it('returns true when native flag is injected', () => {
    ;(window as any).isAppWebView = true
    setUserAgent('desktop-browser')
    expect(isAppView()).toBe(true)
  })

  it('falls back to user agent for mobile detection', () => {
    setUserAgent('Mozilla/5.0 (Linux; Android 10)')
    expect(isAppView()).toBe(true)
  })

  it('returns false for desktop user agent', () => {
    setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X)')
    expect(isAppView()).toBe(false)
  })
})

describe('getBrandConfig', () => {
  beforeEach(() => {
    jest.resetModules()
    process.env = {...originalEnv}
  })

  afterAll(() => {
    process.env = originalEnv
  })

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const loadBrandConfig = () => require('./getBrandConfig').default as () => any

  it('returns default Dental Stack config with stage invite link', () => {
    process.env.REACT_APP_BRAND_NAME = ''
    process.env.REACT_APP_BASE_ENVIRONMENT = 'stage.'

    const config = loadBrandConfig()()

    expect(config.name).toBe('Dental Stack')
    expect(config.brand).toBe('DENTALSTACK')
    expect(config.inviteLink).toBe('https://web.stage.dental-stack.com/')
    expect(config.termsAndConditions).toContain('dental-stack.com')
    expect(config.privacyPolicy).toContain('dental-stack.com')
  })

  it('builds Smilezy config with production invite link', () => {
    process.env.REACT_APP_BRAND_NAME = 'SMILEZY'
    process.env.REACT_APP_BASE_ENVIRONMENT = ''

    const config = loadBrandConfig()()

    expect(config.name).toBe('Smilezy')
    expect(config.brand).toBe('SMILEZY')
    expect(config.inviteLink).toBe('https://web.smilezy.com/')
    expect(config.termsAndConditions).toContain('Smilezy-196cf')
    expect(config.privacyPolicy).toContain('Smilezy-d59ec')
  })

  it('builds Clear Castle config with staged invite link', () => {
    process.env.REACT_APP_BRAND_NAME = 'CLEARCASTLE'
    process.env.REACT_APP_BASE_ENVIRONMENT = 'stage.'

    const config = loadBrandConfig()()

    expect(config.name).toBe('Clear Castle')
    expect(config.brand).toBe('CLEARCASTLE')
    expect(config.inviteLink).toBe('https://clearcastle.stage.dental-stack.com/')
  })
})

describe('getColorPalette and getCssVariables', () => {
  beforeEach(() => {
    process.env = {...originalEnv}
  })

  afterAll(() => {
    process.env = originalEnv
  })

  it('returns default palette for Dental Stack', () => {
    process.env.REACT_APP_BRAND_NAME = 'DENTALSTACK'
    const getColorPalette = colorModule.default
    const palette = getColorPalette()

    expect(palette.primaryColor).toBe('#735BF2')
    expect(palette.secondarySupport).toBe('#E9F3FA')
    expect(palette.neutralBlack).toBe('#1D1F2C')
  })

  it('overrides palette for Synapse brand', () => {
    process.env.REACT_APP_BRAND_NAME = 'SYNAPSE'
    const getColorPalette = colorModule.default
    const palette = getColorPalette()

    expect(palette.primaryColor).toBe('#068370')
    expect(palette.secondarySupport).toBe('#80DAC6')
    expect(palette.neutralBlack).toBe('#131314')
  })

  it('generates CSS variables in kebab case', () => {
    process.env.REACT_APP_BRAND_NAME = 'ROUTETOSMILE'
    const variables = colorModule.getCssVariables()

    expect(variables['--primary-color']).toBe('#3A60CF')
    expect(variables['--neutral-black']).toBe('#131314')
    expect(variables['--red-support']).toBe('#FEF4F4')
  })
})

describe('generateCssVariables', () => {
  afterEach(() => {
    jest.resetModules()
  })

  it('writes palette values to document root', () => {
    const mockPalette = {
      primaryColor: '#111111',
      primarySupport: '#222222',
      secondaryColor: '#333333',
      secondarySupport: '#444444',
      tertiaryColor: '#555555',
      tertiarySupport: '#666666',
      red: '#777777',
      redSupport: '#888888',
      textColor: '#999999',
      grayDisabled: '#aaaaaa',
      lightGray: '#bbbbbb',
      mediumGray: '#cccccc',
      lighterGray: '#dddddd',
      black: '#eeeeee',
      white: '#ffffff',
      lightOrange: '#123456',
      orangeSupport: '#234567',
      orange: '#345678',
      neutralBlack: '#456789',
    }

    jest.doMock('./getColorPalette', () => ({
      __esModule: true,
      default: jest.fn(() => mockPalette),
    }))

    const setProperty = jest.fn()
    const originalDocumentElement = document.documentElement

    Object.defineProperty(document, 'documentElement', {
      value: {style: {setProperty}},
      configurable: true,
    })

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const generateCssVariables = require('./generateCssVariables').default as () => void
    generateCssVariables()

    expect(setProperty).toHaveBeenCalledWith('--primary-color', '#111111')
    expect(setProperty).toHaveBeenCalledWith('--secondary-support', '#444444')
    expect(setProperty).toHaveBeenCalledWith('--neutral-black', '#456789')

    Object.defineProperty(document, 'documentElement', {
      value: originalDocumentElement,
      configurable: true,
    })
  })
})
