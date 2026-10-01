import leadsPatientStatusType from '@constants/leadsPatientStatusType'
import {useFeatureAccess} from '@hooks/useFeatureAccess'
import clsx from 'clsx'
import BackGroundSVG from 'components/atom/SVG/BackGroundSVG'
import CommonSVG from 'components/atom/SVG/CommonSVG'
import ModalLayout from 'components/modal/ModalLayout'
import When from 'components/when/When'
import {Dispatch, SetStateAction} from 'react'
import {useSelector} from 'react-redux'
import {useNavigate} from 'react-router-dom'
import {RootState} from 'redux/store'
import {IMAGE_INVITE_PATIENT} from 'utils/ImageConst'
import {
  SVG_CROSS,
  SVG_EXPAND_RIGHT,
  SVG_EXPAND_RIGHT_GREEN,
  SVG_PENCIL_DARK_GRAY,
} from 'utils/SvgConstants'
import hasValue from 'utils/hasValue'

const PatientDetailItem = ({label, value}: {label: string; value: string}) => {
  const emptyValues = label === 'Chief complaint' ? 'No complaint added' : '--'
  return (
    <div className='w-full flex flex-col gap-1 px-4 py-2 text-[16px]'>
      <span className='font-medium text-textColor'>{label}</span>
      <span
        className={clsx(
          'break-words ',
          hasValue(value) ? ' text-black font-semibold' : 'text-grayDisabled font-normal'
        )}
      >
        {hasValue(value) ? value : emptyValues}
      </span>
    </div>
  )
}

const ActionItem = ({
  title,
  text,
  type,
  onClick,
}: {
  title: string
  text: string
  type: 'default' | 'warning' | 'success'
  onClick: () => void
}) => {
  const {dataLeadsOverview: dataLeadsData} = useSelector((state: RootState) => state.leadsProfile)
  const tracking_enabled = hasValue(dataLeadsData?.tracking?.tracking_id)

  return (
    <div
      onClick={tracking_enabled ? () => {} : onClick}
      className={clsx(
        'w-full border border-mediumGray rounded-lg p-4 flex gap-4 justify-between cursor-pointer',
        type === 'success' && 'bg-tertiarySupport !border-tertiaryColor',
        tracking_enabled && 'border-grayDisabled'
      )}
    >
      <div className='flex flex-col'>
        <p
          className={clsx(
            'font-semibold',
            tracking_enabled ? '!text-grayDisabled' : type === 'warning' && '!text-red',
            tracking_enabled ? '!text-grayDisabled' : type === 'success' && '!text-tertiaryColor'
          )}
        >
          {title}
        </p>
        <p
          className={clsx(
            'text-textColor font-normal text-[16px]',
            tracking_enabled && '!text-grayDisabled'
          )}
        >
          {text}
        </p>
      </div>
      <div
        className={clsx(
          'flex items-center justify-center justify-self-end',
          tracking_enabled && 'opacity-50'
        )}
      >
        <CommonSVG
          svg={type === 'success' ? SVG_EXPAND_RIGHT_GREEN : SVG_EXPAND_RIGHT}
          height='16'
          width='9'
          className='cursor-pointer'
        />
      </div>
    </div>
  )
}

interface PatientSettingsProps {
  setIsModalPatientSettingsOpen: Dispatch<SetStateAction<boolean>>
  setIsModalPatientSettingsActionOpen: Dispatch<SetStateAction<boolean>>
  setPatientActionType: Dispatch<SetStateAction<'ACTIVATE' | 'ARCHIVE' | 'DELETE' | null>>
}

const ModalPatientSettings = ({
  setIsModalPatientSettingsOpen,
  setIsModalPatientSettingsActionOpen,
  setPatientActionType,
}: PatientSettingsProps) => {
  const {data} = useSelector((state: RootState) => state.apiGetLeadsProfileDetails)
  const patientData = data.patient_details
  const navigate = useNavigate()
  const {permissionChecks} = useFeatureAccess()
  const patientManagementAccess = permissionChecks?.patientManagement?.patientManagement?.isEditable
  const handleEditClick = () => {
    setIsModalPatientSettingsOpen(false)
    const queryParams = new URLSearchParams({
      isEdit: 'true',
      patientId: String(patientData.id),
    }).toString()
    navigate(`/add-patient?${queryParams}`)
  }

  return (
    <When isTrue={hasValue(patientData)}>
      <ModalLayout
        className='max-h-[88vh] md:w-[628px] min-w-[33vw] overflow-y-auto'
        isResponsive={true}
      >
        <div className='flex justify-between item-center w-full'>
          <img className='w-12 mb-4' src={IMAGE_INVITE_PATIENT} alt='' />
          <div onClick={() => setIsModalPatientSettingsOpen(false)}>
            <BackGroundSVG
              className='h-[47px] w-[47px] bg-lightGray rounded-full cursor-pointer'
              svg={SVG_CROSS}
              width='48'
              height='48'
            />
          </div>
        </div>
        <div className='flex flex-shrink-0 items-center justify-between rounded-t-md mb-4'>
          <div>
            <h1 className='font-semibold text-[24px]'>Patient settings</h1>
            <p className='text-[16px]  text-textColor'>Edit your patient’s details here</p>
          </div>
        </div>
        <div className='w-full flex items-center justify-between'>
          <span className='font-semibold text-[20px]'>Details</span>
          <When isTrue={patientManagementAccess}>
            <span
              className='flex items-center justify-center border-b border-b-textColor cursor-pointer'
              onClick={() => {
                handleEditClick()
              }}
            >
              <CommonSVG svg={SVG_PENCIL_DARK_GRAY} width='16' />
              <span className='text-sm text-textColor font-semibold'>Edit details</span>
            </span>
          </When>
        </div>
        <div className='w-full border border-mediumGray rounded-lg md:grid md:grid-cols-2 py-2 mt-2'>
          <PatientDetailItem
            label='Full Name'
            value={
              patientData?.first_name +
              ' ' +
              (hasValue(patientData?.last_name) ? patientData?.last_name : '')
            }
          />
          <PatientDetailItem label='Email' value={patientData?.email?.toLocaleLowerCase()} />
          <PatientDetailItem label='Mobile number' value={patientData?.mobile ?? ''} />
          <PatientDetailItem label='Practice location' value={patientData?.practice_location} />
          <PatientDetailItem label='Patient ID' value={patientData?.customer_mapped_id} />
          <div className='md:grid md:grid-cols-2 md:gap-4 col-span-2'>
            <PatientDetailItem label='Age' value={patientData?.age ?? ''} />
            <PatientDetailItem label='Gender' value={patientData?.gender} />
          </div>
        </div>
        <div className='font-semibold text-[20px] mb-2 mt-6'>Actions</div>
        <div className='flex flex-col gap-2'>
          <When
            isTrue={
              patientData.status === leadsPatientStatusType.ACTIVE ||
              patientData.status === leadsPatientStatusType.INACTIVE
            }
          >
            <ActionItem
              title='Archive patient'
              text='You can archive this patient if you want to continue with them later'
              type='default'
              onClick={() => {
                setIsModalPatientSettingsOpen(false)
                setPatientActionType('ARCHIVE')
                setIsModalPatientSettingsActionOpen(true)
              }}
            />
          </When>
          <When isTrue={patientData.status === leadsPatientStatusType.ARCHIVE}>
            <ActionItem
              title='Activate patient'
              text='Activate the patient to enable available actions and options'
              type='success'
              onClick={() => {
                setIsModalPatientSettingsOpen(false)
                setPatientActionType('ACTIVATE')
                setIsModalPatientSettingsActionOpen(true)
              }}
            />
          </When>
          <ActionItem
            title='Delete patient'
            text='Deleting a patient permanently removes patient data. This action cannot be undone.'
            type='warning'
            onClick={() => {
              setIsModalPatientSettingsOpen(false)
              setPatientActionType('DELETE')
              setIsModalPatientSettingsActionOpen(true)
            }}
          />
        </div>
      </ModalLayout>
    </When>
  )
}

export default ModalPatientSettings
