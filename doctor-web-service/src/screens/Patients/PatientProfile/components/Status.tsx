import React, {useState} from 'react'
import DropdownRadio from '../../../../components/atom/Dropdown/DropdownRadio'
import {optionType} from '../../../../types/optionType'
import When from '../../../../components/when/When'
import alignerStatusOptions from '../../../../@staticData/alignerStatusOptions'
import ModalConfirmAndUpdate from '../../../../components/modal/PatientProfile/Tabs/TreatmentPlan/ModalConfirmAndUpdate'
import {useParams} from 'react-router-dom'
import {useDispatch} from 'react-redux'
import {postApiDataStatusProductionLabUpdate} from '../../../../redux/Slices/AppSlice/PatientProfile/TreatmentPlan/StatusProductionLabUpdateSlice'
import {ApiGetData} from '../../../../utils/ConstFunctions'
import {postApiDataTreatmentPlan} from '../../../../redux/Slices/AppSlice/PatientProfile/TreatmentPlan/TreatmentPlan'
import {eventEmitter} from '@utils/eventEmitter'
import alertType from '@constants/alertType'

interface StatusCellProps {
  defaultStatus: optionType
  rowIndex: number
  disable: boolean
  alignerNo: number
}
const Status: React.FC<StatusCellProps> = ({defaultStatus, rowIndex, disable, alignerNo}) => {
  const [status, setStatus] = useState<optionType>(defaultStatus)
  const {id: patientUserId, alignerJourneyId, patientId} = useParams()
  const dispatch = useDispatch()

  const [isModalConfirmAndUpdateOpen, setIsModalConfirmAndUpdateOpen] = useState(false)
  const handleChange = (newStatus: optionType) => {
    setStatus(newStatus)
    setIsModalConfirmAndUpdateOpen(true)
  }
  const callUpdateStatus = () => {
    if (alignerJourneyId) {
      const postData = {
        aligner_journey_id: parseInt(alignerJourneyId),
        aligner_nos: [alignerNo],
        sub_status: String(status?.value),
      }
      dispatch(postApiDataStatusProductionLabUpdate(postData) as any)
        .unwrap()
        .then(() => {
          const postData: ApiGetData = {
            data: {
              patient_id: patientUserId ?? patientId,
              alignerJourneyId: alignerJourneyId,
            },
          }
          dispatch(postApiDataTreatmentPlan(postData) as any)
          setIsModalConfirmAndUpdateOpen(false)
        })
        .catch((error: Error) => {
          eventEmitter.emit('apiError', {...error, alertType: alertType.MODAL})
        })
    }
  }
  const handleCancel = () => {
    setStatus(defaultStatus)
    setIsModalConfirmAndUpdateOpen(false)
  }
  return (
    <div className='h-11 flex justify-start items-center  text-textColor text-sm font-medium -mx-2'>
      <DropdownRadio
        options={alignerStatusOptions}
        name={'status'}
        onChange={handleChange}
        direction='left'
        className='!w-40'
        key={rowIndex}
        disable={disable}
        selectedOption={status}
        title='Status'
        dropDownBorderColor=''
        dropDownTextColor=''
        iconPrimaryColor=''
      />
      <When isTrue={isModalConfirmAndUpdateOpen}>
        <ModalConfirmAndUpdate
          status={status}
          changedAligners={[alignerNo]}
          onSubmit={callUpdateStatus}
          handleCancel={handleCancel}
          alignerRowStatusChange={true}
        />
      </When>
    </div>
  )
}

export default Status
