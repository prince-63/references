import {useEffect, useRef, useState} from 'react'
import ModalLayout from 'components/modal/ModalLayout'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import Spinner from 'components/spinner/Spinner'
import {CloseIcon} from 'yet-another-react-lightbox'
import useDispatchAction from '@hooks/useDispatchAction'
import {
  setIsStlFilePreviewVisible,
  setStlPreviewUrl,
} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileFiles.slice'
import ExoViewer from 'components/three/ExoViewer'

// Singleton guard to avoid multiple modals rendering at once
let __customStlViewerMounted = false

const CustomStlViewer = () => {
  // Claim singleton; ref indicates ownership, state triggers one re-render
  const ownsRef = useRef(false)
  const [isLoading, setIsLoading] = useState(true)
  const {stlPreviewUrl} = useSelector((state: RootState) => state.leadsProfileFiles)
  const {dispatchAction} = useDispatchAction()

  useEffect(() => {
    if (!__customStlViewerMounted) {
      __customStlViewerMounted = true
      ownsRef.current = true
    }
    if (stlPreviewUrl) setIsLoading(false)
    return () => {
      if (ownsRef.current) {
        __customStlViewerMounted = false
      }
    }
  }, [stlPreviewUrl])
  // If not primary, render nothing but keep hook order stable
  if (!ownsRef.current) return null
  return (
    <ModalLayout className='md:w-[45%] w-full  !bg-[#444240] '>
      <div className='flex justify-end '>
        <button
          className='bg-[#FFFFFF26] p-1 rounded-full cursor-pointer'
          type='button'
          onClick={() => {
            dispatchAction(setStlPreviewUrl(''))
            dispatchAction(setIsStlFilePreviewVisible(false))
            setIsLoading(false)
          }}
        >
          <CloseIcon color='white' />
        </button>
      </div>

      <div className='flex flex-col justify-center items-center'>
        {isLoading && (
          <div className='flex flex-col justify-center items-center gap-5 w-full absolute'>
            <Spinner loading color='white' />
          </div>
        )}
        <div className='w-full' style={{height: '60vh'}}>
          {stlPreviewUrl && (
            <ExoViewer
              height={'100%'}
              backgroundColor={'#453B6A'}
              initialMeshes={[
                {
                  id: 'preview',
                  name: 'mesh',
                  visible: true,
                  color: '#F1E5AC',
                  url: stlPreviewUrl,
                  type: 'stl',
                },
              ]}
              onClose={() => {
                dispatchAction(setStlPreviewUrl(''))
                dispatchAction(setIsStlFilePreviewVisible(false))
              }}
            />
          )}
        </div>
      </div>
    </ModalLayout>
  )
}

export default CustomStlViewer
