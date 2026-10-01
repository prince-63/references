import React, {useState} from 'react'
import DashboardCard from './DashboardCard'
import SwitchArrowIcon from 'assets/icons/SwitchArrowIcon'
import CommonEmptyState from 'components/emptyState/CommonEmptyState'
import {IMAGE_DASHBOARD_EMPTY_STATE} from 'utils/ImageConst'
import When from 'components/when/When'
import hasValue from 'utils/hasValue'
import {DashboardInfoCard} from './ThingsToDo'
import CheckMarkIcon from 'assets/icons/CheckMarkIcon'
import clsx from 'clsx'
import {Image} from 'assets/images/Images/Image'
import {DefaultImage} from 'assets/images/Images/DefaultImage'
import RightArrowIcon from 'assets/icons/RightArrowIcon'
import DueMessage from 'screens/Production/components/DueMessage'
import {getFirstLetterCapitalOfWord, identifyUser, secToHour} from 'utils/ConstFunctions'
import {removeDuplicates} from '@utils/removeDuplicates'
import {ModalNudgePatients} from 'components/DoctorProfile/ModalNudgePatients'
import {useNavigate} from 'react-router-dom'
import {IListType, IPatientData} from 'redux/Slices/AppSlice/DoctorDashboard/DoctorDashboardSlice'
import ArrowRight from 'assets/icons/ArrowRight'
import useProfileBasePath from '@hooks/useProfileBasePath'
import {getStorageType} from 'utils/storage'

interface UpcomingAlignerPatientTableViewProps {
  showOnlyCritical: boolean
  patientData: IPatientData[]
  remindOnePatient: (patient: IPatientData) => void
}

interface props {
  patientData: IListType
  showOnlyCritical: boolean
  filteredPatientData: IPatientData[]
  setShowOnlyCritical: (showOnlyCritical: boolean) => void
}

const UpcomingAlignerChange = (props: props) => {
  const {patientData, showOnlyCritical, filteredPatientData, setShowOnlyCritical} = props
  const [isModalNudgeOpen, setIsModalNudgeOpen] = useState<boolean>(false)
  const [reminderPatientList, setReminderPatientList] = useState<
    {
      patient_id: number
      patient_name: string
    }[]
  >([])

  const filteredUpcomingAlignerChangePatientList = true
    ? removeDuplicates(patientData.upcoming_aligner_changes as any)
    : []

  //Remind All Patient
  const remindAllPatient = () => {
    const patientsList = filteredUpcomingAlignerChangePatientList.map((patient: any) => ({
      patient_id: patient?.patient_id,
      patient_name: patient?.patient_name,
    }))
    setReminderPatientList(patientsList)
    setIsModalNudgeOpen(true)
  }

  // Remind One Event
  const remindOnePatient = (patient: any) => {
    setReminderPatientList([
      {
        patient_id: patient.patient_id,
        patient_name: patient.patient_name,
      },
    ])
    setIsModalNudgeOpen(true)
  }

  const [isShowInfoCard, setIsShowInfoCard] = useState(
    getStorageType().getItem('upcoming_aligner_info') !== 'true'
  )

  const removeNotification = () => {
    setIsShowInfoCard(false)
    getStorageType().setItem('upcoming_aligner_info', 'true')
  }

  return (
    <DashboardCard
      icon={<SwitchArrowIcon />}
      title='Upcoming aligner changes'
      showButton={true}
      isButtonDisabled={!showOnlyCritical}
      onClick={remindAllPatient}
    >
      {isModalNudgeOpen && (
        <ModalNudgePatients
          setIsModalNudgeOpen={setIsModalNudgeOpen}
          patientList={reminderPatientList}
        />
      )}

      <When isTrue={hasValue(patientData)}>
        <button
          className={clsx(
            'rounded-3xl px-4 py-1.5 border border-mediumGray text-sm text-textColor font-semibold',
            showOnlyCritical ? 'bg-secondaryColor text-white' : 'bg-white'
          )}
          onClick={() => {
            const newShowOnlyCritical = !showOnlyCritical
            setShowOnlyCritical(newShowOnlyCritical)
          }}
        >
          <div className='flex items-center gap-2'>
            <When isTrue={showOnlyCritical}>
              <CheckMarkIcon width='11' height='8' color='white' />
            </When>
            <p>Show only critical</p>
          </div>
        </button>
        <div className='h-[430px] overflow-auto'>
          <div className='pt-4'>
            <When isTrue={isShowInfoCard}>
              <DashboardInfoCard
                content='Encourage critical patients who are overdue for an aligner change to switch promptly'
                onClick={removeNotification}
              />
            </When>
          </div>

          {/* For Web */}
          <div className={clsx('md:flex flex-col w-full md:order-1 hidden')}>
            <UpcomingAlignerPatientTableView
              showOnlyCritical={showOnlyCritical}
              patientData={filteredPatientData}
              remindOnePatient={remindOnePatient}
            />
          </div>
          {/* Mobile */}
          <div className={clsx('md:hidden')}>
            <UpcomingAlignerPatientMobile
              showOnlyCritical={showOnlyCritical}
              patientData={filteredPatientData}
              remindOnePatient={remindOnePatient}
            />
          </div>
        </div>
      </When>
    </DashboardCard>
  )
}

export default UpcomingAlignerChange

const EmptyState = ({showOnlyCritical}: {showOnlyCritical: boolean}) => {
  return (
    <CommonEmptyState
      boxStyle='w-full h-full justify-center items-center'
      image={IMAGE_DASHBOARD_EMPTY_STATE}
      imageStyle='w-[138px] h-[134px] mt-10'
      title={showOnlyCritical ? 'No critical patients' : 'No aligner changes coming up'}
      titleStyle=' text-textColor font-semibold text-[16px] mt-4 text-center'
      subTitle='Looks like no aligner changes are coming, we will notify you once something comes up'
      subTitleStyle='md:w-[325px] w-full text-textColor font-medium text-[14px]  text-center'
    />
  )
}

const UpcomingAlignerPatientTableView: React.FC<UpcomingAlignerPatientTableViewProps> = ({
  showOnlyCritical,
  patientData,
  remindOnePatient,
}) => {
  const navigate = useNavigate()
  const profileBasePath = useProfileBasePath()
  return (
    <div>
      <table className='border-collapse border-none w-full '>
        <thead className='w-full'>
          <tr className='border-b '>
            <th className='py-4 px-2 text-start text-sm text-textColor font-medium'>
              Patient details
            </th>
            <th className='py-4 px-2  text-start text-sm text-textColor font-medium'>
              Scheduled change
            </th>
            <th className='py-4 px-2  text-start text-sm text-textColor font-medium'>Wear data</th>
            <th className='py-4 px-2'></th>
          </tr>
        </thead>
        <tbody className='w-full '>
          {patientData.map((patient) => (
            <tr key={patient.patient_id} className='text-center py-4 border-b table-fixed'>
              <td className='text-start py-4'>
                <div>
                  <div className='flex gap-3'>
                    <div>
                      {patient?.patient_profile !== null ? (
                        <Image
                          className='min-w-12 h-12 object-cover rounded-full'
                          src={patient?.patient_profile}
                        />
                      ) : (
                        <DefaultImage
                          className='min-w-12 h-12 '
                          letter={patient?.patient_name?.charAt(0)}
                        />
                      )}
                    </div>
                    <div>
                      <div className='font-semibold text-[16px] max-w-36 truncate ...'>
                        {patient?.patient_name}
                      </div>
                      <div className='font-medium text-[14px] text-textColor'>
                        {hasValue(patient?.mobile_no)
                          ? patient?.country_code + ' ' + patient?.mobile_no
                          : '--'}
                      </div>
                    </div>
                  </div>
                </div>
              </td>
              <td className='text-start py-4'>
                <div className='flex gap-2 justify-start items-center'>
                  <div>
                    {getFirstLetterCapitalOfWord(patient?.current_aligner_jaw_type) +
                      ' ' +
                      patient.current_aligner_no}
                  </div>
                  <RightArrowIcon color='black' />
                  <div>
                    {getFirstLetterCapitalOfWord(patient?.next_aligner_jaw_type) +
                      ' ' +
                      patient.next_aligner_no}
                  </div>
                </div>
                <div className='flex justify-start items-start'>
                  <When isTrue={hasValue(patient.change_offset)}>
                    <DueMessage offSetDays={patient.change_offset} />
                  </When>
                </div>
              </td>
              <td className='text-start py-4'>
                <div className='text-textColor text-[16px] font-medium'>
                  <span className='text-black  font-semibold'>
                    {hasValue(patient?.current_aligner_avg_wear_time_in_secs)
                      ? secToHour(patient?.current_aligner_avg_wear_time_in_secs)
                      : '--'}
                  </span>{' '}
                  of{' '}
                  <span className='text-black  font-semibold'>
                    {patient?.recommended_hours_to_wear_aligners}
                  </span>{' '}
                  hrs
                </div>
                <When isTrue={hasValue(patient?.current_aligner_compliance)}>
                  <div
                    className={clsx(
                      'text-textColor text-sm font-semibold',
                      patient?.current_aligner_compliance === 'POOR' && '!text-red'
                    )}
                  >
                    {'('}
                    {getFirstLetterCapitalOfWord(patient?.current_aligner_compliance)}
                    {')'}
                  </div>
                </When>
              </td>
              <td className='text-start py-4'>
                <button
                  className='flex justify-center items-center gap-2 font-semibold text-[12px] text-textColor'
                  onClick={() => {
                    if (
                      patient.aligner_change_status === 'DELAYED' &&
                      patient.patient_connected &&
                      patient.tracking_type === 'PATIENTAPP'
                    ) {
                      remindOnePatient(patient)
                    } else {
                      identifyUser()

                      navigate(`${profileBasePath}/${patient.patient_id}`)
                    }
                  }}
                >
                  {patient.aligner_change_status === 'DELAYED' &&
                  patient.patient_connected &&
                  patient.tracking_type === 'PATIENTAPP'
                    ? 'Remind'
                    : 'View'}
                  <RightArrowIcon color='#666666' width='12' height='12' />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <When isTrue={!hasValue(patientData)}>
        <EmptyState showOnlyCritical={showOnlyCritical} />
      </When>
    </div>
  )
}

const UpcomingAlignerPatientMobile: React.FC<UpcomingAlignerPatientTableViewProps> = ({
  patientData,
  showOnlyCritical,
  remindOnePatient,
}) => {
  const navigate = useNavigate()
  const profileBasePath = useProfileBasePath()
  return (
    <div>
      {patientData.map((patient) => (
        <div
          className='rounded-lg w-full px-4 py-4 border border-mediumGray mt-4'
          key={patient.patient_id}
        >
          <div className='flex justify-between items-center'>
            <div className='flex gap-3'>
              <div>
                {patient?.patient_profile !== null ? (
                  <Image
                    className='min-w-12 h-12 object-cover rounded-full'
                    src={patient?.patient_profile}
                  />
                ) : (
                  <DefaultImage
                    className='min-w-12 h-12 '
                    letter={patient?.patient_name?.charAt(0)}
                  />
                )}
              </div>
              <div>
                <div className='font-semibold text-[16px] max-w-36 truncate ...'>
                  {patient?.patient_name}
                </div>
                <div className='font-medium text-[14px] text-textColor'>
                  {hasValue(patient?.mobile_no)
                    ? patient?.country_code + ' ' + patient?.mobile_no
                    : '--'}
                </div>
              </div>
            </div>
            <button
              className='flex gap-2 items-center'
              onClick={() => {
                if (patient.aligner_change_status === 'DELAYED') {
                  remindOnePatient(patient)
                } else {
                  identifyUser()

                  navigate(`${profileBasePath}/${patient.patient_id}`)
                }
              }}
            >
              <div className='text-sm text-textColor font-medium'>
                {patient.aligner_change_status === 'DELAYED' ? 'Remind' : 'View'}
              </div>
              <ArrowRight color='#666666' width='11' height='8' />
            </button>
          </div>
          <div className='flex justify-between items-center mt-3'>
            <div>
              <div className='flex gap-2 justify-start items-center text-[12px] font-semibold'>
                <div>
                  {getFirstLetterCapitalOfWord(patient?.current_aligner_jaw_type) +
                    ' ' +
                    patient.current_aligner_no}
                </div>
                <RightArrowIcon color='#666' />
                <div>
                  {getFirstLetterCapitalOfWord(patient?.next_aligner_jaw_type) +
                    ' ' +
                    patient.next_aligner_no}
                </div>
              </div>
              <div className='flex justify-start items-start'>
                <When isTrue={hasValue(patient.change_offset)}>
                  <DueMessage offSetDays={patient.change_offset} />
                </When>
              </div>
            </div>
            <div>
              <div className='text-textColor text-sm font-semibold'>
                <span className='text-black  font-semibold'>
                  {hasValue(patient?.current_aligner_avg_wear_time_in_secs)
                    ? secToHour(patient?.current_aligner_avg_wear_time_in_secs)
                    : '--'}
                </span>{' '}
                of{' '}
                <span className='text-black  font-semibold'>
                  {patient?.recommended_hours_to_wear_aligners}
                </span>{' '}
                hrs
              </div>
              <When isTrue={hasValue(patient?.current_aligner_compliance)}>
                <div
                  className={clsx(
                    'text-textColor text-sm font-semibold',
                    patient?.current_aligner_compliance === 'POOR' && '!text-red'
                  )}
                >
                  {'('}
                  {getFirstLetterCapitalOfWord(patient?.current_aligner_compliance)}
                  {')'}
                </div>
              </When>
            </div>
          </div>
        </div>
      ))}
      <When isTrue={!hasValue(patientData)}>
        <EmptyState showOnlyCritical={showOnlyCritical} />
      </When>
    </div>
  )
}
