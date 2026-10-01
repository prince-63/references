import CommonSVG from '../../../../components/atom/SVG/CommonSVG'
import {SVG_PLUS_GRAY} from '../../../../utils/SvgConstants'

const SeeCompletedAligners = ({setShowAll}: {setShowAll: (x: boolean) => void}) => {
  return (
    <div className='flex flex-row items-center gap-2 mt-4 mb-2 w-full'>
      <div className='w-full h-px rounded-sm border-b border-mediumGray' />
      <div
        className='flex flex-row min-w-fit justify-center items-center text-center text-textColor text-sm font-semibold gap-2 cursor-pointer mx-2'
        onClick={() => setShowAll(true)}
      >
        <CommonSVG svg={SVG_PLUS_GRAY} width='16' height='16' />
        <p className='w-fit'>See previous aligners</p>
      </div>
      <div className='w-full h-px rounded-sm border-b border-mediumGray' />
    </div>
  )
}

export default SeeCompletedAligners
