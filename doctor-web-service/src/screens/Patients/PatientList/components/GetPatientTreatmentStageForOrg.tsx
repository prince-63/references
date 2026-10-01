import DropDownOutline from 'assets/icons/DropDownOutline'
import {useNavigate} from 'react-router-dom'
import getColorPalette from 'utils/getColorPalette'
import {PatientRowDetails} from '../types/patientsList.types'
import PATIENT_TYPE from '@constants/patientType.constants'
import useProfileBasePath from '@hooks/useProfileBasePath'

const GetPatientTreatmentStageForOrg = (patientData: PatientRowDetails, isArchived: boolean) => {
  const navigation = useNavigate()
  const profileBasePath = useProfileBasePath()
  if (isArchived) {
    return <div className='text-sm font-medium text-black'>Archived</div>
  }

  const navigateToLeadProfile = () => navigation(`${profileBasePath}/${patientData?.patient_id}`)

  let status = ''
  let buttonText: string | null = null
  let onClick: (() => void) | undefined = undefined

  const stage = patientData?.treatment_stage ?? ''

  switch (stage) {
    case 'STARTING_SOON':
      status = 'Starting soon'
      if (
        patientData.manufacturing_status === 'DELIVERED' &&
        patientData?.patient_type !== PATIENT_TYPE?.EXISTING_PATIENT
      ) {
        buttonText = patientData?.is_tracking_added ? 'Update start date' : 'Start treatment'
        onClick = () => {
          if (patientData?.is_tracking_added) {
            navigation(`${profileBasePath}/${patientData?.patient_id}/aligner-tracking`)
          } else {
            navigateToLeadProfile()
          }
        }
      }
      break

    case 'PAUSED':
      status = 'Paused'
      break

    case 'COMPLETE':
      status = 'Completed'
      break

    case 'DEACTIVATED':
      status = 'Deactivated'
      break

    case 'ONGOING':
      status = 'Ongoing'
      break
    default:
  }

  return <StatusTag status={status} buttonText={buttonText} onclick={onClick} />
}

export default GetPatientTreatmentStageForOrg

const StatusTag = ({
  status,
  buttonText,
  onclick,
}: {
  status: string
  buttonText?: string | null
  onclick?: () => void
}) => {
  return (
    <div className='flex md:flex-col flex-row md:justify-center md:items-start md:gap-0 gap-2'>
      <div className='text-sm font-medium text-black'>{status}</div>
      {buttonText && (
        <button
          className='flex gap-1 items-center text-primaryColor font-semibold text-sm'
          onClick={(e) => {
            e.stopPropagation()
            onclick && onclick()
          }}
        >
          <div>{buttonText}</div>
          <div className='-rotate-90'>
            <DropDownOutline color={getColorPalette().primaryColor} />
          </div>
        </button>
      )}
    </div>
  )
}
