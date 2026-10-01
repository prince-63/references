import {useMemo} from 'react'
import {IPhoto} from 'screens/Patients/LeadsProfile/leadsProfile.types'
import PhotosRow from './PhotosRow'
import When from 'components/when/When'
import hasValue from 'utils/hasValue'
import {getImageUrl} from 'utils/ConstFunctions'

const AlignerPhotoSection = ({alignerPhotos}: {alignerPhotos: IPhoto[]}) => {
  const extractDriveId = (url?: string) => {
    if (!url) return undefined
    const match = url.match(/patient\/drive\/image\/([^/?#]+)/)
    return match?.[1]
  }

  const mapPhoto = (photo: IPhoto) => {
    const driveId = (photo as any)?.drive_file_id ?? extractDriveId(photo.image_url)
    const url =
      getImageUrl({
        url: photo.image_url,
        is_gdrive_platform: (photo as any)?.is_gdrive_platform || Boolean(driveId),
        drive_file_id: driveId,
      }) || photo.image_url
    const type = (photo as any)?.type ?? (photo as any)?.file_type ?? 'image/jpeg'
    if (!url) return null
    return {
      name: photo.image_name,
      url,
      type,
    }
  }

  const withAlignerPhotos = useMemo(
    () =>
      alignerPhotos
        .filter((photo) => photo.with_aligner)
        .map(mapPhoto)
        .filter(Boolean) as {name: string; url: string; type: string}[],
    [alignerPhotos]
  )

  const withoutAlignerPhotos = useMemo(
    () =>
      alignerPhotos
        .filter((photo) => !photo.with_aligner)
        .map(mapPhoto)
        .filter(Boolean) as {name: string; url: string; type: string}[],
    [alignerPhotos]
  )
  return (
    <div className='flex flex-col gap-2'>
      <div className='flex flex-col gap-4'>
        <When isTrue={hasValue(withAlignerPhotos)}>
          <PhotosRow fileUrls={withAlignerPhotos} photoType='With aligners' />
        </When>
        <When isTrue={hasValue(withoutAlignerPhotos)}>
          <PhotosRow fileUrls={withoutAlignerPhotos} photoType='Without aligners' />
        </When>
      </div>
    </div>
  )
}

export default AlignerPhotoSection
