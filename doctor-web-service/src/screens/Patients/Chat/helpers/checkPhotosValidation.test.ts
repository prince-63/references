import validateAndProcessPhotos from './checkPhotosValidation'
import ErrorToast from '../../../../components/modal/Alert/ErrorToast'
import {isAllowedFileExtension, isFileSizeValid} from '../../../../utils/ConstFunctions'
import {eventEmitter} from '@utils/eventEmitter'

jest.mock('../../../../components/modal/Alert/ErrorToast', () => jest.fn())
jest.mock('../../../../utils/ConstFunctions', () => ({
  isAllowedFileExtension: jest.fn(() => true),
  isFileSizeValid: jest.fn(() => true),
}))
jest.mock('@utils/eventEmitter', () => ({
  eventEmitter: {emit: jest.fn()},
}))

describe('validateAndProcessPhotos', () => {
  const buildFile = (overrides: Partial<File> = {}): any => ({
    name: 'photo.jpg',
    size: 1,
    type: 'image/jpeg',
    ...overrides,
  })

  beforeEach(() => {
    jest.clearAllMocks()
    ;(isAllowedFileExtension as jest.Mock).mockReturnValue(true)
    ;(isFileSizeValid as jest.Mock).mockReturnValue(true)
  })

  it('returns files when all validations pass', () => {
    const files = [buildFile({size: 1000})]

    const result = validateAndProcessPhotos({files, filesAlreadySelected: [], fileCount: 5})

    expect(result).toEqual(files)
    expect(ErrorToast).not.toHaveBeenCalled()
    expect(isFileSizeValid).toHaveBeenCalledWith(files[0], 15, undefined, undefined)
  })

  it('emits greet event when available storage is exceeded during loop', () => {
    const oneGbInBytes = 1024 * 1024 * 1024
    const files = [buildFile({size: oneGbInBytes})]

    const result = validateAndProcessPhotos({
      files,
      fileCount: 5,
      availableStorage: 1,
      usedStorage: 1,
    })

    expect(eventEmitter.emit).toHaveBeenCalledWith('greet')
    expect(result).toEqual([])
  })

  it('shows STL validation error when scan files have invalid extension', () => {
    ;(isAllowedFileExtension as jest.Mock).mockReturnValueOnce(false)

    const result = validateAndProcessPhotos({
      files: [buildFile({name: 'scan.ply'})],
      isForScanFiles: true,
    })

    expect(ErrorToast).toHaveBeenCalledWith(
      'Invalid file format. Please upload a STL OBJ PLY file only'
    )
    expect(result).toEqual([])
  })

  it('shows video size error when mp4 exceeds size limit', () => {
    ;(isFileSizeValid as jest.Mock).mockReturnValue(false)

    const result = validateAndProcessPhotos({
      files: [buildFile({type: 'video/mp4', name: 'clip.mp4'})],
      maxFileSize: 2,
    })

    expect(ErrorToast).toHaveBeenCalledWith('Please upload video with a maximum size of 2 MB')
    expect(result).toEqual([])
  })

  it('shows toast when file count limit is hit', () => {
    const result = validateAndProcessPhotos({
      files: [buildFile(), buildFile({name: 'extra.jpg'})],
      fileCount: 1,
      toastMessage: 'limit hit',
    })

    expect(ErrorToast).toHaveBeenCalledWith('limit hit')
    expect(result).toEqual([])
  })

  it('shows storage toast when cumulative size exceeds available storage after loop', () => {
    const files = [buildFile({size: 600_000_000}), buildFile({size: 600_000_000})]

    const result = validateAndProcessPhotos({
      files,
      fileCount: 5,
      availableStorage: 1,
      usedStorage: 0.5,
    })

    expect(ErrorToast).toHaveBeenCalledWith('You can only upload files upto 1 GB')
    expect(result).toEqual([])
  })
})
