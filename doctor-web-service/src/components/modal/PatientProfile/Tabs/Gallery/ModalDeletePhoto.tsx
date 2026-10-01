import ButtonOutlinedRed from '../../../../atom/Buttons/ButtonOutlinedRed'
import ButtonRed from '../../../../atom/Buttons/ButtonRed'
import CommonSVG from '../../../../atom/SVG/CommonSVG'
import {SVG_DELETE} from '../../../../../utils/SvgConstants'

interface Props {
  setIsDeletePhoto: any
  selectedItems?: any
}

const ModalDeletePhoto: React.FC<Props> = (props) => {
  const {setIsDeletePhoto, selectedItems} = props

  return (
    <div className='fixed left-0 top-0 z-[1055] h-full w-full flex justify-center items-center bg-black bg-opacity-40'>
      <div className='w-[30%] h-auto bg-white rounded-lg p-6 shadow-lg'>
        <div className='flex w-16 h-16 mt-3 bg-lightGray rounded-full justify-center items-center'>
          <CommonSVG svg={SVG_DELETE} width='32' height='32' />
        </div>
        <div className='text-black text-2xl font-bold mt-4'>
          {`Delete ${selectedItems.length > 1 ? 'Images' : 'Image'}`}
        </div>
        <div className='w-auto h-auto mt-3 text-textColor text-base font-normal leading-snug'>{`Do you want to delete this aligner ${
          selectedItems.length > 1 ? 'images' : 'image'
        }`}</div>
        <div className='flex flex-row h-auto justify-between gap-6 mt-4'>
          <ButtonOutlinedRed
            text='No'
            onClick={() =>
              setIsDeletePhoto({
                response: 'No',
                status: false,
              })
            }
            className={'h-11 mt-2'}
          />
          <ButtonRed
            text='Yes, Delete it'
            onClick={() =>
              setIsDeletePhoto({
                response: 'Yes',
                status: false,
              })
            }
            className={'h-11 mt-2'}
          />
        </div>
      </div>
    </div>
  )
}

export default ModalDeletePhoto
