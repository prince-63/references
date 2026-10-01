import treatmentTypeSelectionList from '@constants/treatmentTypeSelectionList'
import AntdButton from 'components/atom/Buttons/AntdButton'
import {RoleCard} from 'components/auth/components/RoleCard'

const SelectTreatmentType = ({
  callSelectedTreatmentType,
}: {
  callSelectedTreatmentType: () => void
}) => {
  return (
    <div>
      <div className='mt-4'>
        <RoleCard onOptionChange={() => {}} options={treatmentTypeSelectionList} className='' />
      </div>
      <div className='mt-7 flex gap-8'>
        <AntdButton
          text={'Continue'}
          className='h-12 !bg-primaryColor w-full hover:!bg-primaryColor text-[16px]  font-semibold'
          onClick={() => callSelectedTreatmentType()}
        />
      </div>
    </div>
  )
}

export default SelectTreatmentType
