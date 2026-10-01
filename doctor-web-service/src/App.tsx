import React from 'react'
import './App.css'
import {Provider, useSelector} from 'react-redux'
import Routes from './routes/Routes'
import {persistor, store} from './redux/store'
import {PersistGate} from 'redux-persist/integration/react'
import 'react-toastify/dist/ReactToastify.css'
import {ToastContainer} from 'react-toastify'
// @ts-ignore
import {ErrorBoundary} from 'react-error-boundary'
import {useEffect, useState} from 'react'
import ErrorModal from 'components/errorHandler/ErrorModal'
import ServerBusy from 'components/errorHandler/ServerBusy'
import {eventEmitter} from '@utils/eventEmitter'
import {ConfigProvider} from 'antd'
import getColorPalette, {getCssVariables} from 'utils/getColorPalette'
import useNetworkStatus from '@hooks/useNetworkStatus'
import NoInternetScreen from 'components/errorHandler/NoInternetScreen'
import When from 'components/when/When'
import CustomStlViewer from 'CustomStlViewer'
import {RootState} from 'redux/store'
import GlobalPdfViewer from 'components/pdf/GlobalPdfViewer'

function InnerApp() {
  const [error, setError] = useState<any>(null)
  useEffect(() => {
    const handleError = (e: any) => setError(e)
    eventEmitter.on('apiError', handleError)
    return () => void eventEmitter.off('apiError', handleError)
  }, [])
  useEffect(() => {
    const vars = getCssVariables()
    const root = document.documentElement
    Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v as string))
  }, [])
  const {isOnline} = useNetworkStatus()
  if (!isOnline) return <NoInternetScreen />
  const {isStlPreviewVisible} = useSelector((state: RootState) => state.leadsProfileFiles)
  return (
    <div className='app'>
      <ErrorBoundary FallbackComponent={ServerBusy}>
        <ToastContainer />
        <Routes />
      </ErrorBoundary>
      <When isTrue={isStlPreviewVisible}>
        <CustomStlViewer />
      </When>
      <GlobalPdfViewer />
      <ErrorModal {...{error}} />
    </div>
  )
}

function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ConfigProvider
          theme={{
            token: {
              fontFamily: 'figtree',
              colorPrimary: getColorPalette().primaryColor,
              colorBorderSecondary: getColorPalette().mediumGray,
              zIndexPopupBase: 2000,
            },
          }}
        >
          <InnerApp />
        </ConfigProvider>
      </PersistGate>
    </Provider>
  )
}

export default App
