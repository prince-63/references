import useDispatchAction from '@hooks/useDispatchAction'
import {useFeatureAccess} from '@hooks/useFeatureAccess'
import CaretRightIcon from 'assets/icons/CaretRightIcon'
import When from 'components/when/When'
import React from 'react'
import {setIsAssignPracticeDrawerOpen} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfile.slice'
import {PatientBelongsTo} from 'screens/Patients/PatientList/types/patientsList.types'
import getColorPalette from 'utils/getColorPalette'

interface AssignPracticeButtonProps {
  patientBelongsTo: PatientBelongsTo
  practiceName: string | null | undefined
}

const AssignPracticeButton: React.FC<AssignPracticeButtonProps> = ({
  practiceName,
  patientBelongsTo,
}) => {
  const {permissionChecks} = useFeatureAccess()
  const {dispatchAction} = useDispatchAction()
  const assignPracticeNamePermissions = permissionChecks?.patientProfileActions?.displayPracticeName

  return (
    <span className='truncate text-textColor text-sm font-medium text-wrap'>
      <When
        isTrue={patientBelongsTo === 'NOT_ASSIGNED' && assignPracticeNamePermissions?.isAddable}
      >
        <button
          className='text-secondaryColor font-semibold text-sm flex gap-1 items-center'
          onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
            e.stopPropagation()
            dispatchAction(setIsAssignPracticeDrawerOpen(true))
          }}
        >
          <div>Assign practice</div>
          <CaretRightIcon color={getColorPalette().secondaryColor} height='12' width='12' />
        </button>
      </When>
      <When isTrue={patientBelongsTo !== 'NOT_ASSIGNED' && !practiceName}>-</When>

      {patientBelongsTo === 'OWN_PATIENT' && practiceName && (
        <When isTrue={assignPracticeNamePermissions?.isViewable}>{practiceName}</When>
      )}
    </span>
  )
}

export default AssignPracticeButton
