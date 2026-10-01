import {FC} from 'react'
import {Routes, Route, Navigate} from 'react-router-dom'
import {AuthRoute} from './AuthRoute'

const AppRoute: FC = () => {
  return (
    <Routes>
      <Route path='*' element={<Navigate to='/' />} />
      <Route path='/' element={<AuthRoute />} />
    </Routes>
  )
}

export {AppRoute}
