import React, {useContext, useState} from 'react'
import {AuthContext} from '../../context/AuthContext'
import {useDispatch} from 'react-redux'
import {ApiGetData, getFirstLetterCapitalOfWord} from '../../utils/ConstFunctions'
import {postApiDataPatientNudge} from '../../redux/Slices/AppSlice/Dashboard/PatientNudgeSlice'
import CommonSVG from '../atom/SVG/CommonSVG'
import {SVG_CROSS} from '../../utils/SvgConstants'
import userTypes from '../../@constants/userTypes'
import nudgePatientsMessageArray from '../../@constants/nudgePatientsMessageArray'
import ModalLayout from 'components/modal/ModalLayout'
import clsx from 'clsx'
import NotificationsIcon from 'assets/icons/NotificationsIcon'
import AntdButton from 'components/atom/Buttons/AntdButton'
import getColorPalette from 'utils/getColorPalette'
interface props {
  patientList?: any
  setIsModalNudgeOpen: (isModalNudgeOpen: boolean) => void
}

export const ModalNudgePatients: React.FC<props> = (props) => {
  const {patientList, setIsModalNudgeOpen} = props
  const dispatch = useDispatch()
  const [message, setMessage] = useState(nudgePatientsMessageArray.MESSAGE_LIST[0])
  const {userId, userDetail} = useContext(AuthContext)
  const [selectArch, setSelectArch] = useState(1)
  const userData: any = userDetail
  const [loading, setLoading] = useState(false)
  const handleNudgePatient = (data: any, index: number) => {
    setSelectArch(index)
    setMessage(data)
  }

  const callNudgeSubmit = () => {
    setLoading(true)
    const postData: ApiGetData = {
      data: {
        patients: patientList,
        doctor_name: `${userData.first_name + ' ' + userData.last_name}`,
        doctor_id: userId,
        message: message,
        role_name: getFirstLetterCapitalOfWord(userTypes.DOCTOR),
        created_by: `Dr ${userData.first_name + ' ' + userData.last_name}`,
      },
    }

    dispatch(postApiDataPatientNudge(postData) as any)
      .unwrap()
      .then(() => {
        setLoading(false)
        setIsModalNudgeOpen(false)
      })
      .catch((error: any) => {
        setLoading(false)
        console.error(error)
      })
  }

  return (
    <ModalLayout
      className={clsx(
        'w-[628px] bg-white rounded-lg px-[40px] pt-[39px] shadow-lg min-w-[37%] max-h-[95%] z-[1056] overflow-auto'
      )}
    >
      <div className='flex justify-between items-center'>
        <div
          onClick={() => setIsModalNudgeOpen(false)}
          className='w-[64px] h-[64px] bg-primarySupport rounded-full cursor-pointer flex justify-center items-center'
        >
          <NotificationsIcon color={getColorPalette().primaryColor} />
        </div>

        <div onClick={() => setIsModalNudgeOpen(false)}>
          <CommonSVG svg={SVG_CROSS} width='47' height='47' />
        </div>
      </div>
      <div className='text-black text-2xl font-semibold mt-4 '>
        Remind {patientList?.length > 1 && ' all '}
        {patientList?.length > 1 ? 'patients' : 'patient'}
      </div>
      <div className='w-full text-textColor text-sm font-normal '>
        Send messages to your users informing them to change aligner{' '}
      </div>
      <div className='text-textColor text-base font-medium mt-6'>Choose message to send</div>
      <div className='text-sm font-semibold w-full'>
        {nudgePatientsMessageArray.MESSAGE_LIST.map((message, index) => (
          <button
            key={index}
            className={clsx(
              'p-4 px-6 w-full rounded-[8px] focus:outline-none mt-4 text-start',
              selectArch === index + 1
                ? 'bg-primarySupport text-secondaryColor'
                : 'border border-mediumGray text-textColor'
            )}
            onClick={() => handleNudgePatient(message, index + 1)}
          >
            {message}
          </button>
        ))}
      </div>

      <div className='mt-6'>
        <AntdButton
          loading={loading}
          text={` Remind ${patientList?.length > 1 ? 'all' : ''}
        ${patientList?.length > 1 ? 'patients' : 'patient'}`}
          onClick={() => callNudgeSubmit()}
          className='w-full h-14 mt-2 bg-primaryColor text-white text-[14px] font-semibold text-base '
        />
      </div>
    </ModalLayout>
  )
}
