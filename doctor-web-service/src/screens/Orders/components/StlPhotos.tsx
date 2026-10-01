import {Image} from 'assets/images/Images/Image'
import {
  STL_LOWER,
  STL_UPPER,
  STL_FRONT_ONE,
  STL_FRONT_TWO,
  XRAY_OPG,
  XRAY_CEPHALOMETRIC,
} from 'utils/ImageConst'

const StlPhotos = ({isExtraOral}: {isExtraOral: boolean}) => {
  const extraOralImages = [
    {src: XRAY_OPG, label: 'OPG'},
    {src: XRAY_CEPHALOMETRIC, label: 'Cephalometric'},
  ]

  const intraOralImages = [
    {src: STL_UPPER, label: 'STL upper'},
    {src: STL_LOWER, label: 'STL lower'},
    {src: STL_FRONT_ONE, label: 'Bite 1'},
    {src: STL_FRONT_TWO, label: 'Bite 2'},
  ]

  const images = isExtraOral ? extraOralImages : intraOralImages

  return (
    <div className='flex flex-col text-textColor text-xs font-semibold flex-1'>
      <div
        className='grid gap-2 py-3
                   grid-cols-2
                   sm:grid-cols-3
                   md:grid-cols-4'
      >
        {images.map((image) => (
          <div
            key={image.src}
            className='border rounded-lg border-mediumGray
                       flex flex-col items-center justify-center
                       p-2 aspect-square'
          >
            <Image
              className='w-full max-w-[60px] aspect-square object-contain'
              src={image.src}
              alt={image.label}
            />
            <div className='text-center mt-2'>{image.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default StlPhotos
