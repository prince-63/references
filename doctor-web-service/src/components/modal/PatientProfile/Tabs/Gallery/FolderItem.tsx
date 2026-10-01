import {IMAGE_FOLDER} from '../../../../../utils/ImageConst'
import {SVG_INFO_DOT} from '../../../../../utils/SvgConstants'
import CommonSVG from '../../../../atom/SVG/CommonSVG'

const FolderItem = ({title, handleFolderClick, numberOfPhotos}: any) => {
  return (
    <div
      className='min-w-64 h-20 p-5 bg-white rounded-lg border border-mediumGray justify-start items-center gap-4 inline-flex cursor-pointer'
      onClick={handleFolderClick}
    >
      <img className='w-12 h-12 relative' src={IMAGE_FOLDER} alt='' />
      <div className='grow shrink basis-0 flex-col justify-start items-center gap-4 inline-flex'>
        <div className='self-stretch h-auto flex-col justify-start items-center gap-1 flex'>
          <div className='self-stretch h-auto text-black text-base font-semibold'>{title}</div>
          <div className='self-stretch text-textColor text-sm font-normal'>
            {numberOfPhotos} Photos
          </div>
        </div>
      </div>
      <div className='w-4 h-4 justify-center items-center flex'>
        <CommonSVG svg={SVG_INFO_DOT} width='40' height='40' />
      </div>
    </div>
  )
}

export default FolderItem
