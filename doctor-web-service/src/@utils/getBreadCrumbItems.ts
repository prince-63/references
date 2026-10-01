import {useLocation} from 'react-router-dom'

const getBreadCrumbItems = ({baseUrl}: {baseUrl: string}) => {
  const location = useLocation()
  const pathSegments = location.pathname.split('/').slice(3)

  return pathSegments?.map((segment, index) => {
    const decodedSegment = decodeURIComponent(segment)
    const path = `${baseUrl}` + pathSegments.slice(0, index + 1).join('/')
    return {
      path,
      title: decodedSegment === 'files' ? 'Patient files' : decodedSegment,
    }
  })
}

export default getBreadCrumbItems
