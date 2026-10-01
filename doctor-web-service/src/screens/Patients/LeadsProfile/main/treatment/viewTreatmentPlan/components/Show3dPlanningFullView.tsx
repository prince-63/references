import React, {useEffect} from 'react'
import ReactDOM from 'react-dom'
import CrossIcon from 'assets/icons/CrossIcon'

const Show3dPlanningFullView = ({
  link,
  setShowFullView,
}: {
  link: string
  setShowFullView: (value: boolean) => void
}) => {
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [])

  const portalRoot = document.getElementById('fullscreen-root')
  if (!portalRoot) return null

  return ReactDOM.createPortal(
    <div className='fixed top-0 left-0 z-[9999] w-screen h-screen bg-white'>
      <div className='flex justify-end p-3'>
        <button
          onClick={() => setShowFullView(false)}
          className='p-2 bg-gray-100 rounded-full shadow-md'
        >
          <CrossIcon color='#000' />
        </button>
      </div>

      <div className='w-full h-[95%]'>
        <iframe src={link} className='w-full h-[95%]' allow='autoplay'></iframe>
      </div>
    </div>,
    portalRoot
  )
}

export default Show3dPlanningFullView
