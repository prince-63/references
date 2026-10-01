import {auth} from 'services/firebase'
import {googleLoginCall} from './login.service'
import hasValue from 'utils/hasValue'
import {getStorageType} from 'utils/storage'

export const redirectLoginGoogleData = async (dispatch: any) => {
  try {
    auth.onAuthStateChanged(function (res: any) {
      if (hasValue(res) && getStorageType().getItem('googleLoginDataLoader') === 'true') {
        googleLoginCall(dispatch, res)
      } else {
        getStorageType().setItem('googleLoginDataLoader', 'false')
      }
    })
  } catch (error) {}
}
