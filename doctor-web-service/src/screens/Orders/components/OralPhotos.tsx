import {Image} from 'assets/images/Images/Image'
import {
  FRONT_VIEW,
  FRONT_VIEW_WITH_SMILE,
  RIGHT_SIDE_VIEW,
  INTRA_ORAL_UPPER,
  INTRA_ORAL_LOWER,
  INTRA_ORAL_RIGHT,
  INTRA_ORAL_LEFT,
  INTRA_ORAL_BITE,
} from 'utils/ImageConst'

const OralPhotos = ({isExtraOral}: {isExtraOral: boolean}) => {
  const extraOralImages = [
    {src: FRONT_VIEW, label: 'Front without smile'},
    {src: FRONT_VIEW_WITH_SMILE, label: 'Front with smile'},
    {src: RIGHT_SIDE_VIEW, label: 'Right side'},
  ]

  const intraOralImages = [
    {src: INTRA_ORAL_UPPER, label: 'Upper'},
    {src: INTRA_ORAL_LEFT, label: 'Left side'},
    {src: INTRA_ORAL_BITE, label: 'Bite'},
    {src: INTRA_ORAL_RIGHT, label: 'Right side'},
    {src: INTRA_ORAL_LOWER, label: 'Lower'},
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

export default OralPhotos
