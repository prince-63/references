import React from 'react'
import {render, waitFor} from '@testing-library/react'
import {act} from 'react'
import {AuthContext, AuthProvider} from './AuthContext'

const mockNavigate = jest.fn()
const mockDispatch = jest.fn()
const mockStorageState = new Map<string, string>()
const mockStorage = {
  getItem: jest.fn((key: string) => mockStorageState.get(key) ?? null),
  setItem: jest.fn((key: string, value: string) => {
    mockStorageState.set(key, value)
  }),
  clear: jest.fn(() => mockStorageState.clear()),
}

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}))

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
}))

jest.mock('@hooks/useCurrentCountryCode', () => ({
  useCurrentCountryCode: () => 'US',
}))

jest.mock('services/supabase', () => {
  const signOut = jest.fn().mockResolvedValue(undefined)
  return {
    supabase: {
      auth: {
        signOut,
      },
    },
  }
})

jest.mock('redux/Slices/AppSlices/appStackStateSlice', () => {
  const setIsSocialLoggedInLoader = jest.fn((payload) => ({type: 'SET_LOADER', payload}))
  return {setIsSocialLoggedInLoader}
})

jest.mock('../redux/store', () => ({
  store: {
    getState: jest.fn(),
  },
}))

jest.mock('utils/storage', () => ({
  getStorageType: () => mockStorage,
}))

const {store} = jest.requireMock('../redux/store') as {store: {getState: jest.Mock}}
const {supabase} = jest.requireMock('services/supabase') as {supabase: {auth: {signOut: jest.Mock}}}
const {setIsSocialLoggedInLoader} = jest.requireMock(
  'redux/Slices/AppSlices/appStackStateSlice'
) as {setIsSocialLoggedInLoader: jest.Mock}

const TestConsumer: React.FC<{capture: React.MutableRefObject<any>}> = ({capture}) => {
  const ctx = React.useContext(AuthContext)
  React.useEffect(() => {
    capture.current = ctx
  }, [capture, ctx])
  return null
}

const setStorageDefaults = () => {
  mockStorageState.set('userToken', 'token')
  mockStorageState.set('userId', 'user')
  mockStorageState.set('profileId', 'profile')
  mockStorageState.set('organizationId', 'org')
  mockStorageState.set('subRoleId', 'subRole')
  mockStorageState.set('userDetail', JSON.stringify({name: 'Doc'}))
}

describe('AuthContext', () => {
  beforeEach(() => {
    mockNavigate.mockClear()
    mockDispatch.mockClear()
    supabase.auth.signOut.mockClear()
    setIsSocialLoggedInLoader.mockClear()
    setIsSocialLoggedInLoader.mockImplementation((payload) => ({type: 'SET_LOADER', payload}))
    mockStorageState.clear()
    mockStorage.getItem.mockClear()
    mockStorage.setItem.mockClear()
    mockStorage.clear.mockClear()
    ;(window as any).fcWidget = {show: jest.fn(), hide: jest.fn()}
    ;(window as any).ReactNativeWebView = {postMessage: jest.fn()}
    store.getState.mockReturnValue({})
  })

  it('hydrates user from storage during initial isLoggedIn check', async () => {
    setStorageDefaults()
    const capture = {current: null as any}
    await act(async () => {
      render(
        <AuthProvider>
          <TestConsumer capture={capture} />
        </AuthProvider>
      )
    })

    await waitFor(() => expect(capture.current).not.toBeNull())
    await act(async () => {
      await capture.current.isLoggedIn()
    })

    await waitFor(() => expect(mockStorage.getItem).toHaveBeenCalledWith('userDetail'))
    expect(mockStorage.getItem).toHaveBeenCalledWith('userToken')
    expect(mockStorage.getItem).toHaveBeenCalledWith('userId')
    expect(mockStorage.getItem).toHaveBeenCalledWith('profileId')
    expect(mockStorage.getItem).toHaveBeenCalledWith('organizationId')
    expect(mockStorage.getItem).toHaveBeenCalledWith('subRoleId')
  })

  it('login stores user detail and navigates home', async () => {
    setStorageDefaults()
    store.getState.mockReturnValue({apiDoctorProfileGet: {doctorData: {name: 'Doc'}}})
    const capture = {current: null as any}

    await act(async () => {
      render(
        <AuthProvider>
          <TestConsumer capture={capture} />
        </AuthProvider>
      )
    })

    await act(async () => {
      await capture.current.login()
    })

    expect(mockStorage.setItem).toHaveBeenCalledWith('userDetail', JSON.stringify({name: 'Doc'}))
    expect(mockNavigate).toHaveBeenCalledWith('/', {replace: true, relative: 'path'})
    expect((window as any).fcWidget.show).toHaveBeenCalled()
  })

  it('logout clears storage, signs out, and hides widget', async () => {
    setStorageDefaults()
    const capture = {current: null as any}

    await act(async () => {
      render(
        <AuthProvider>
          <TestConsumer capture={capture} />
        </AuthProvider>
      )
    })

    await act(async () => {
      await capture.current.logout()
    })

    expect(mockStorage.clear).toHaveBeenCalledTimes(2)
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'SET_LOADER',
      payload: {isSocialLoggedInLoader: false},
    })
    expect(supabase.auth.signOut).toHaveBeenCalled()
    expect((window as any).fcWidget.hide).toHaveBeenCalled()
    expect((window as any).ReactNativeWebView.postMessage).toHaveBeenCalledWith(
      JSON.stringify({logout: true})
    )
    expect(mockNavigate).toHaveBeenCalledWith('/', {replace: true, relative: 'path'})
  })

  it('clearData mirrors logout without navigation', async () => {
    setStorageDefaults()
    const capture = {current: null as any}

    await act(async () => {
      render(
        <AuthProvider>
          <TestConsumer capture={capture} />
        </AuthProvider>
      )
    })

    await act(async () => {
      await capture.current.clearData()
    })

    expect(mockStorage.clear).toHaveBeenCalledTimes(2)
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'SET_LOADER',
      payload: {isSocialLoggedInLoader: false},
    })
    expect(supabase.auth.signOut).toHaveBeenCalled()
    expect((window as any).fcWidget.hide).toHaveBeenCalled()
    expect((window as any).ReactNativeWebView.postMessage).toHaveBeenCalledWith(
      JSON.stringify({logout: true})
    )
    expect(mockNavigate).not.toHaveBeenCalled()
  })
})
