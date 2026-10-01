import {CustomNavigateProvider} from 'context/CustomNavigationContext'
import {AuthProvider} from '../context/AuthContext'
import AppNav from './AppNav'
import {BrowserRouter} from 'react-router-dom'
import StorageError from 'components/subscription/modals/StorageError'

export default function Routes() {
  return (
    <BrowserRouter>
      <StorageError />
      <CustomNavigateProvider>
        <AuthProvider>
          <AppNav />
        </AuthProvider>
      </CustomNavigateProvider>
    </BrowserRouter>
  )
}
