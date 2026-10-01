import When from 'components/when/When'
import AlignerPhotoSection from './AlignerPhotoSection'
import {IAlignerUpdateDetails} from 'screens/Patients/LeadsProfile/leadsProfile.types'
import {groupBy} from 'ramda'
import hasValue from 'utils/hasValue'
import PhotosIcon from 'assets/icons/PhotosIcon'

const Photos = ({alignerUpdateDetails}: {alignerUpdateDetails: IAlignerUpdateDetails}) => {
  const groupedByAlignersPhotos = groupBy(
    (photo) => String(photo.aligner_no),
    alignerUpdateDetails.photos ?? []
  )
  return (
    <div className='flex flex-col gap-4 '>
      <When isTrue={hasValue(Object.keys(groupedByAlignersPhotos))}>
        {Object.keys(groupedByAlignersPhotos).map((item, index) => (
          <AlignerPhotoSection key={index} alignerPhotos={groupedByAlignersPhotos[item]!} />
        ))}
      </When>
      <When isTrue={!hasValue(Object.keys(groupedByAlignersPhotos))}>
        <div className='flex flex-col text-textColor font-medium  justify-center items-center gap-1 mt-2'>
          <PhotosIcon />
          No photos added
        </div>
      </When>
    </div>
  )
}

export default Photos
