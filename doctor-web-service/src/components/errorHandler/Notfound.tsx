import {useEffect} from 'react'
import {useNavigate} from 'react-router-dom'

const Notfound = () => {
  const navigate = useNavigate()

  useEffect(() => {
    navigate('/', {replace: true})
  }, [navigate])

  return null
}

export default Notfound
