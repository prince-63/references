import appointmentTypes from '@constants/appointmentTypes'
import useFilter from '@hooks/useFilter'
import {Modal} from 'antd'
import RadioGroupCard from 'components/RadioGroup/RadioGroupCard'
import React, {useMemo} from 'react'
import getActiveFilter from 'screens/Patients/PatientList/utils/getActiveFilter'

import {SVG_APPOINTMENT_NOTE, SVG_REMINDER} from 'utils/SvgConstants'
import AntdButton from 'components/atom/Buttons/AntdButton'
import useDispatchAction from '@hooks/useDispatchAction'
import {setSelectedEvent} from 'redux/Slices/AppSlice/Calendar/calendar.slice'

const CreateAnEventModal = ({
  isCreateEventModalVisible,
  setIsCreateEventModalVisible,
  toggleAddReminderFormContainer,
  toggleAddAppointmentFormContainer,
}: {
  isCreateEventModalVisible: boolean
  setIsCreateEventModalVisible: React.Dispatch<React.SetStateAction<boolean>>
  toggleAddReminderFormContainer: (value: boolean) => void
  toggleAddAppointmentFormContainer: (value: boolean) => void
}) => {
  const appointmentTypeOptions = useMemo(
    () => [
      {
        value: appointmentTypes.ADD_REMINDER,
        active: true,
        icon: SVG_REMINDER,
        iconDisabled: SVG_REMINDER,
        title: 'Set a reminder',
        subTitle: 'Easily set reminders for production, payments, appointments and others',
        label: 'Set a reminder',
      },
      {
        value: appointmentTypes.ADD_APPOINTMENT,
        active: false,
        icon: SVG_APPOINTMENT_NOTE,
        iconDisabled: SVG_APPOINTMENT_NOTE,
        title: 'Create an appointment',
        subTitle: 'Schedule an appointment to manage patient visits and stay organized',
        label: 'Create an appointment',
      },
    ],
    []
  )
  type AppointmentTypeOption = (typeof appointmentTypeOptions)[number]
  const {filter, handleFilterChange, resetFilter} =
    useFilter<AppointmentTypeOption>(appointmentTypeOptions)

  const onClose = () => {
    setIsCreateEventModalVisible(false)
    resetFilter()
  }
  const {dispatchAction} = useDispatchAction()
  return (
    <Modal
      destroyOnClose={true}
      open={isCreateEventModalVisible}
      onCancel={onClose}
      style={{fontFamily: 'figtree'}}
      width={598}
      transitionName=''
      title={<p className='font-semibold text-2xl'>Create an event</p>}
      footer={[
        <AntdButton
          key='submit'
          text='Continue'
          htmlType='button'
          className='h-11 w-full bg-primaryColor text-center'
          onClick={() => {
            dispatchAction(setSelectedEvent(null))
            if (filter.ADD_REMINDER) {
              toggleAddReminderFormContainer(true)
            } else {
              toggleAddAppointmentFormContainer(true)
            }
            onClose()
          }}
        />,
      ]}
    >
      <div className='my-6'>
        <RadioGroupCard
          options={appointmentTypeOptions}
          className='!justify-normal font-normal text-base leading-7 md:w-full'
          onOptionChange={(option) => {
            handleFilterChange(option as AppointmentTypeOption['value'])
          }}
          selectedOption={getActiveFilter<AppointmentTypeOption>({filter})}
        />
      </div>
    </Modal>
  )
}

export default CreateAnEventModal
