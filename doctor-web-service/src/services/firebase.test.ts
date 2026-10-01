const mockInit = jest.fn(() => ({name: 'app'}))
const mockCompatSignInWithPopup = jest.fn(async () => ({user: 'google'}))
class MockGoogleProvider {
  providerId = 'google'
}
const mockGoogleProvider = jest.fn(() => new MockGoogleProvider())
const mockAuthInstance = {signInWithPopup: mockCompatSignInWithPopup}
const mockFirebaseCompatDefault = {
  auth: Object.assign(() => mockAuthInstance, {GoogleAuthProvider: mockGoogleProvider}),
  apps: [] as Array<Record<string, any>>,
  initializeApp: mockInit,
  firestore: jest.fn(() => ({db: true})),
}

const mockAddScope = jest.fn()
class MockOauthProvider {
  constructor() {
    this.addScope = mockAddScope
  }
  addScope: typeof mockAddScope
}
const mockOauthProvider = jest.fn(() => new MockOauthProvider())
const mockModularSignInWithPopup = jest.fn(async () => ({user: 'apple'}))
const mockGetAuth = jest.fn(() => ({name: 'auth'}))

jest.mock('firebase/compat/app', () => ({__esModule: true, default: mockFirebaseCompatDefault}))
jest.mock('firebase/compat/auth', () => ({}))
jest.mock('firebase/compat/firestore', () => ({}))
jest.mock('firebase/auth', () => ({
  getAuth: mockGetAuth,
  OAuthProvider: mockOauthProvider,
  signInWithPopup: mockModularSignInWithPopup,
}))

describe('firebase service', () => {
  beforeEach(() => {
    jest.resetModules()
    mockInit.mockClear()
    mockCompatSignInWithPopup.mockClear()
    mockGoogleProvider.mockClear()
    mockAddScope.mockClear()
    mockOauthProvider.mockClear()
    mockModularSignInWithPopup.mockClear()
    mockGetAuth.mockClear()
    mockFirebaseCompatDefault.apps.splice(0)
  })

  it('initializes firebase app when no apps exist', () => {
    jest.isolateModules(() => {
      require('./firebase')
    })
    expect(mockInit).toHaveBeenCalledTimes(1)
  })

  it('skips initialization when an app already exists', () => {
    mockFirebaseCompatDefault.apps.push({name: 'existing'})
    jest.isolateModules(() => {
      require('./firebase')
    })
    expect(mockInit).not.toHaveBeenCalled()
  })

  it('signs in with google using compat auth', async () => {
    mockCompatSignInWithPopup.mockResolvedValueOnce({user: 'google'})
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const {signInWithGoogle} = require('./firebase')
    const result = await signInWithGoogle()
    expect(mockGoogleProvider).toHaveBeenCalled()
    expect(mockCompatSignInWithPopup).toHaveBeenCalledWith(expect.any(Object))
    expect(result).toEqual({user: 'google'})
  })

  it('signs in with apple using modular auth', async () => {
    mockModularSignInWithPopup.mockResolvedValueOnce({user: 'apple'})
    mockOauthProvider.mockImplementation(() => ({addScope: mockAddScope}))
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const {signInWithApple, auth} = require('./firebase')
    const result = await signInWithApple()
    expect(mockGetAuth).toHaveBeenCalled()
    expect(mockOauthProvider).toHaveBeenCalledWith('apple.com')
    expect(mockAddScope).toHaveBeenCalledTimes(2)
    expect(mockModularSignInWithPopup).toHaveBeenCalledWith(auth, expect.any(Object))
    expect(result).toEqual({user: 'apple'})
  })
})
