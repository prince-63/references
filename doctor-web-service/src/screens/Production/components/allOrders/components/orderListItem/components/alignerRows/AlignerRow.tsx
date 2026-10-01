import {IConsecutiveAlignerRow} from 'screens/Production/types/productionModule.types'
import AlignerItem from './AlignerItem'
import When from 'components/when/When'
import hasValue from 'utils/hasValue'

const AlignerRow = ({alignerRow}: {alignerRow: IConsecutiveAlignerRow}) => {
  return (
    <div className='flex justify-start mb-2 gap-2'>
      <AlignerItem
        alignerNo={alignerRow.startAlignerNumber}
        startDate={alignerRow.startAlignerStartDate}
        endDate={alignerRow.startAlignerEndDate}
        jawType={alignerRow.startJawType}
      />
      <When isTrue={hasValue(alignerRow.endAlignerNumber)}>
        <p className='font-semibold text-base'>to</p>
      </When>
      {alignerRow.endAlignerNumber && (
        <AlignerItem
          alignerNo={alignerRow.endAlignerNumber}
          startDate={alignerRow.endAlignerStartDate}
          endDate={alignerRow.endAlignerEndDate}
          jawType={alignerRow.endJawType}
        />
      )}
    </div>
  )
}

export default AlignerRow
