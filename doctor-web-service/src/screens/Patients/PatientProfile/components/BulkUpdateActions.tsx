import {Dispatch, SetStateAction, useContext, useEffect} from 'react'
import DropdownRadio from '../../../../components/atom/Dropdown/DropdownRadio'
import statusOptions from '../../../../@staticData/alignerStatusOptions'
import {useDispatch, useSelector} from 'react-redux'
import {RootState} from '../../../../redux/store'
import {optionType} from '../../../../types/optionType'
import {ApiGetData, identifyUser, safeParseInt} from '../../../../utils/ConstFunctions'
import {AuthContext} from '../../../../context/AuthContext'
import {postApiDataDoctorAllBrandList} from '../../../../redux/Slices/AppSlice/DoctorProfile/DoctorAllBrandList'
import StatusIcon from '../../../../assets/icons/StatusIcon'
import VerifiedOutlineIcon from '../../../../assets/icons/VerifiedOutlineIcon'
import Button from '../../../../components/atom/Buttons/Button'
import clsx from 'clsx'
import {useFeatureAccess} from '@hooks/useFeatureAccess'
import When from 'components/when/When'
import hasValue from 'utils/hasValue'

interface BulkUpdateActionsInterface {
  setIsModalConfirmAndUpdateOpen: Dispatch<SetStateAction<boolean>>
  status: optionType | null
  setStatus: Dispatch<SetStateAction<optionType | null>>
  productionLab: optionType | null
  setProductionLab: Dispatch<SetStateAction<optionType | null>>
  wearDays: optionType | null
  setWearDays: Dispatch<SetStateAction<optionType | null>>
  trackingStatus: string | null
  handleOnCancel: () => void
}

const BulkUpdateActions = ({
  setIsModalConfirmAndUpdateOpen,
  status,
  setStatus,
  productionLab,
  setProductionLab,
  wearDays,
  handleOnCancel,
}: BulkUpdateActionsInterface) => {
  const {permissionChecks} = useFeatureAccess()
  const isAccessible = permissionChecks?.production?.addNotes?.isEditable
  const {data: dataProductionLabList}: any = useSelector(
    (state: RootState) => state.apiProductionList
  )
  const {userId} = useContext(AuthContext)

  const {isSomeAlignerSelected}: any = useSelector((state: RootState) => state.apiTreatmentPlan)
  const dispatch = useDispatch()
  // Brand list
  useEffect(() => {
    const postData: ApiGetData = {
      data: {
        doctor_id: safeParseInt(userId),
      },
    }
    dispatch(postApiDataDoctorAllBrandList(postData) as any)
  }, [])

  const handleCancel = () => {
    setStatus(null)
    setProductionLab(null)
    // setWearDays(null)
    handleOnCancel()
  }

  return (
    <div className='flex gap-4 items-center  mb-2'>
      <span className='text-textColor font-semibold w-30'>Bulk Actions</span>
      <div className='border-r border-textColor h-8' />
      <When isTrue={isAccessible}>
        <DropdownRadio
          options={statusOptions}
          title={'Status'}
          name={'status'}
          onChange={setStatus}
          selectedOption={status}
          icon={StatusIcon}
          direction='left'
          className='!w-40'
        />
      </When>
      <When isTrue={isAccessible}>
        {dataProductionLabList && (
          <DropdownRadio
            options={dataProductionLabList}
            title={'Production Lab'}
            name={'productionLab'}
            onChange={setProductionLab}
            selectedOption={productionLab}
            icon={VerifiedOutlineIcon}
            direction='right'
            className='!w-52'
          />
        )}
      </When>
      {/* <DropdownRadio
        options={wearDaysList}
        title={'Wear days'}
        name={'wearDays'}
        onChange={setWearDays}
        selectedOption={wearDays}
        icon={UpdateIcon}
        direction='right'
        className='!w-44'
        // disable={trackingStatus === treatmentPlanStatusConstants.PAUSED}
      /> */}
      <When isTrue={hasValue(status) || hasValue(productionLab)}>
        <Button
          text={'Update Changes'}
          onClick={() => {
            if (wearDays) {
              identifyUser()
            }

            setIsModalConfirmAndUpdateOpen(true)
          }}
          isDisabled={!isSomeAlignerSelected || (!status && !productionLab)}
          className={clsx(
            '!w-40',
            isSomeAlignerSelected && (status || productionLab)
              ? '!bg-primaryColor'
              : '!bg-grayDisabled'
          )}
        />

        <span className='text-gray-600 font-medium cursor-pointer' onClick={handleCancel}>
          Cancel
        </span>
      </When>
    </div>
  )
}

export default BulkUpdateActions
