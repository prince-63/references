import {auth} from 'services/firebase'
import {appleLoginCall} from './login.service'
import hasValue from 'utils/hasValue'
import {getStorageType} from 'utils/storage'

export const redirectLoginAppleData = (dispatch: any) => {
  auth.onAuthStateChanged(function (res: any) {
    if (hasValue(res) && getStorageType().getItem('appleLoginDataLoader') === 'true') {
      appleLoginCall(dispatch, res)
    } else {
      getStorageType().setItem('appleLoginDataLoader', 'false')
    }
  })
}
