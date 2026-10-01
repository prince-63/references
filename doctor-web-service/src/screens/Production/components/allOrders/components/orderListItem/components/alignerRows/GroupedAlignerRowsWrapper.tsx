import {IConsecutiveAlignerRow} from 'screens/Production/types/productionModule.types'
import GroupedAlignerRows from './GroupedAlignerRows'
import hasValue from 'utils/hasValue'
import When from 'components/when/When'

const GroupedAlignerRowsWrapper = ({
  groupedAligners,
}: {
  groupedAligners: IConsecutiveAlignerRow[] | undefined
}) => {
  return (
    <When isTrue={hasValue(groupedAligners)}>
      <div className='flex gap-7 text-textColor justify-start overflow-auto max-h-[139px] '>
        {hasValue(groupedAligners) && <GroupedAlignerRows {...{orderItem: groupedAligners}} />}
      </div>
    </When>
  )
}

export default GroupedAlignerRowsWrapper
