import {FC} from 'react'
import hasValue from '../../../../../utils/hasValue'
import {getProperStatusChange} from '../../../../../utils/ConstFunctions'
import {SVG_ARROW_RIGHT_GRAY} from '../../../../../utils/SvgConstants'
import CommonSVG from '../../../../atom/SVG/CommonSVG'

interface props {
  alignerNoArray: number[]
  createdTime: string
  changedFrom: string
  changedTo: string
  oldBrand: string
  newBrand: string
}

export const StatusChanges: FC<props> = (props) => {
  const {alignerNoArray, createdTime, changedFrom, changedTo, oldBrand, newBrand} = props
  return (
    <div className=''>
      <div className='flex-start flex items-center '>
        <div className='relative bottom-2 right-[10px] w-5 h-5 bg-primaryColor rounded-full border-2 border-white'></div>
        <div className='flex justify-between items-start w-full'>
          <div className='relative bottom-2 text-black text-base font-medium '>
            Aligner <span>{alignerNoArray?.join(',')}</span>
          </div>
          <div className='w-auto text-textColor text-xs font-semibold me-2'>{createdTime}</div>
        </div>
      </div>
      {hasValue(changedFrom) && (
        <div className='flex gap-1 items-center pl-4 w-full py-2 relative bottom-2'>
          <span className='w-auto text-textColor text-sm font-normal '>Status changed:</span>
          <span className='flex  gap-2 justify-center items-center'>
            <div className='w-auto h-6 px-2 py-1.5 bg-zinc-100 rounded justify-center items-center gap-2.5 inline-flex'>
              <div className="text-stone-500 text-xs font-semibold font-['Figtree']">
                {getProperStatusChange(changedFrom)}
              </div>
            </div>

            <div>
              <CommonSVG svg={SVG_ARROW_RIGHT_GRAY} width='20' />
            </div>
            <div className='w-auto h-6 px-2 py-1.5 bg-zinc-100 rounded justify-center items-center gap-2.5 inline-flex '>
              <div className="text-stone-500 text-xs font-semibold font-['Figtree']">
                {getProperStatusChange(changedTo)}
              </div>
            </div>
          </span>
        </div>
      )}
      {hasValue(oldBrand) && (
        <div className=' flex gap-1 items-center pl-4 w-full py-2 relative bottom-2'>
          <span className='w-auto text-textColor  text-sm font-normal '>
            Production lab changed:
          </span>
          <span className='flex  gap-2 justify-center items-center'>
            <div className='w-auto h-6 px-2 py-1.5 bg-zinc-100 rounded justify-center items-center gap-2.5 inline-flex'>
              <div className="text-stone-500 text-xs font-semibold font-['Figtree']">
                {oldBrand}
              </div>
            </div>

            <div>
              <CommonSVG svg={SVG_ARROW_RIGHT_GRAY} width='20' />
            </div>
            <div className='w-auto h-6 px-2 py-1.5 bg-zinc-100 rounded justify-center items-center gap-2.5 inline-flex'>
              <div className="text-stone-500 text-xs font-semibold font-['Figtree']">
                {newBrand}
              </div>
            </div>
          </span>{' '}
        </div>
      )}
    </div>
  )
}
