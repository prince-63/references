import {RowData} from '../../types/Aligners.types'
import BoxBadge from 'components/atom/Box/BoxBadge'
import When from 'components/when/When'

const AlignerItemContent = ({
  aligner,
  isManualTracking,
}: {
  aligner: RowData
  isManualTracking?: boolean
}) => {
  return (
    <div>
      <When isTrue={!isManualTracking}>
        <hr className='py-2' />
        <div className='flex flex-col justify-start gap-1'>
          <div>
            {aligner?.compliance != null ? (
              <BoxBadge title={aligner?.compliance} />
            ) : (
              <div className='text-grayDisabled'>{'--'}</div>
            )}
          </div>
          <p className='text-textColor text-sm font-medium'>Compliance</p>
        </div>
      </When>
    </div>
  )
}

export default AlignerItemContent
