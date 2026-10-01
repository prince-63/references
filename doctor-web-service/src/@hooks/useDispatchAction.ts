import {useCallback} from 'react'
import {useDispatch} from 'react-redux'
import {ThunkDispatch} from 'redux-thunk'
import {AnyAction} from 'redux'
import {RootState} from 'redux/store'

export default () => {
  const dispatch: ThunkDispatch<RootState, void, AnyAction> = useDispatch()

  const dispatchAction = useCallback((action: any) => dispatch(action), [dispatch])

  return {
    dispatchAction,
  }
}
