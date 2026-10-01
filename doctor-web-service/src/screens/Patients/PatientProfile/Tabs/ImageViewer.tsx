import {useEffect, useState} from 'react'

import Lightbox from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'

// import optional lightbox plugins
import Fullscreen from 'yet-another-react-lightbox/plugins/fullscreen'
import Slideshow from 'yet-another-react-lightbox/plugins/slideshow'
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails'
import Zoom from 'yet-another-react-lightbox/plugins/zoom'
import 'yet-another-react-lightbox/plugins/thumbnails.css'

export default function ImageViewer(props: any) {
  const {setIsShowPhotos, selectedImagesList, selectedIndex, hidePrevAndNextButtons = false} = props
  const [index, setIndex] = useState(selectedIndex)

  useEffect(() => {}, [selectedImagesList])

  return (
    <>
      <Lightbox
        slides={selectedImagesList}
        open={1 >= 0}
        index={index}
        close={() => {
          setIndex(-1)
          setIsShowPhotos(false)
        }}
        plugins={[Fullscreen, Thumbnails, Slideshow, Zoom]}
        {...(hidePrevAndNextButtons && {
          render: {
            buttonPrev: () => null,
            buttonNext: () => null,
          },
        })}
      />
    </>
  )
}
