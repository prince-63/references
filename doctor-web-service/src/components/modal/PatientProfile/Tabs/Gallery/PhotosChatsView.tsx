import {FC, useState} from 'react'
import ImageViewer from '../../../../../screens/Patients/PatientProfile/Tabs/ImageViewer'
import {validateList} from '../../../../../utils/ConstFunctions'
import {IMAGE_PDF} from '../../../../../utils/ImageConst'
import {Image} from '../../../../../assets/images/Images/Image'
import {useSelector} from 'react-redux'
import {RootState} from '../../../../../redux/store'
import galleryDisplayViewConstants from '../../../../../@constants/galleryDisplayView.constants'
interface props {
  setSelectedDisplayView: any
  photosChats: any
}

export const PhotosChatsView: FC<props> = (props) => {
  const {setSelectedDisplayView, photosChats} = props

  const [isShowPhotos, setIsShowPhotos] = useState(false)
  const [selectedImagesList, setSelectedImagesList]: any = useState([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const {treatmentNo} = useSelector((state: RootState) => state.apiTreatmentPlan)

  const onClickImage = (index: any) => {
    setIsShowPhotos(true)
    setSelectedIndex(index)

    const tempImageArrayList: {id: number; src: string; width: string; height: string}[] = []
    photosChats.forEach((element: any, index: number) => {
      const payload = {
        id: index,
        src: element.image_url[0],
        width: '100%',
        height: '100%',
      }
      tempImageArrayList.push(payload)
    })
    setSelectedImagesList(tempImageArrayList)
  }

  return (
    <>
      {isShowPhotos && (
        <ImageViewer
          setIsShowPhotos={setIsShowPhotos}
          selectedImagesList={selectedImagesList}
          selectedIndex={selectedIndex}
        />
      )}
      <div className='min-w-full'>
        <div className='flex gap-2'>
          <div className='text-textColor text-lg font-semibold' onClick={() => null}>
            Treatment {'>'}
          </div>
          <div
            className='text-textColor text-lg font-semibold cursor-pointer'
            onClick={() => setSelectedDisplayView(galleryDisplayViewConstants.ALBUM_PHOTOS)}
          >
            Treatment {treatmentNo} {'>'}
          </div>
          <div className='text-black text-lg font-semibold'>Chats photos</div>
        </div>
        <div className='mt-3'>
          <div className='mt-3'>
            <div className='flex flex-wrap -mx-2'>
              {validateList(photosChats) &&
                photosChats.map((element: any, index: number) => (
                  <div className='w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5 px-2 mb-4' key={index}>
                    {element.image_url[0].slice(-3) === 'pdf' ? (
                      <img
                        className={'h-44 rounded-lg'}
                        src={IMAGE_PDF}
                        alt='Doc'
                        key={index}
                        onClick={() => onClickImage(index)}
                      />
                    ) : (
                      <Image
                        className={'w-44 h-44 rounded-lg border border-black border-opacity-50'}
                        src={element.image_url[0]}
                        alt='photo'
                        onClick={() => onClickImage(index)}
                      />
                    )}
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
