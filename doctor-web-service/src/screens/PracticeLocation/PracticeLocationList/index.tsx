import {useContext, useEffect, useState} from 'react'

import {useDispatch} from 'react-redux'
import {
  ApiGetData,
  checkValueOrEmptyString,
  identifyUser,
  safeParseInt,
} from '../../../utils/ConstFunctions'
import {AuthContext} from '../../../context/AuthContext'
import {
  postApiDataEditPracticeLocation,
  PracticeLocation,
} from '../../../redux/Slices/AppSlice/PracticeLocation/editPracticeLocationSlice'

import {fieldErrorMessages} from '../../../utils/MessageConstant'
import ErrorToast from '../../../components/modal/Alert/ErrorToast'

import TableContainerForPracticeLocationList from './TableContainerForPracticeLocationList'
import {AxiosError} from 'axios'
import {eventEmitter} from '@utils/eventEmitter'
import alertType from '@constants/alertType'
import {postApiDataListPracticeLocation} from 'redux/Slices/AppSlice/PracticeLocation/listPracticeLocationSlice'
interface propsPracticeLocationList {}

const PracticeLocationList: React.FC<propsPracticeLocationList> = () => {
  const {userId} = useContext(AuthContext)

  const dispatch = useDispatch()
  const [clinicData, setClinicData] = useState({})
  const [addPracticeLocationStatusModal, setAddPracticeLocationStatusModal] = useState(false)
  const [editPracticeLocationStatusModel, setEditPracticeLocationStatusModel] = useState(false)
  const [activeRowOption, setActiveRowOption] = useState<number | null>(null)
  const [success, setSuccess] = useState<boolean>(false)
  const [successTitle, setSuccessTitle] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [practiceLocationList, setPracticeLocationList] = useState<PracticeLocation[]>([])
  useEffect(() => {
    if (success) {
      getClinics()
    }
  }, [success])

  useEffect(() => {
    if (!addPracticeLocationStatusModal) getClinics()
  }, [addPracticeLocationStatusModal])

  const getClinics = () => {
    setLoading(true)
    if (checkValueOrEmptyString(userId) === null) {
      ErrorToast(fieldErrorMessages.TEXT_DOCTOR_ID)
    } else {
      const postData: ApiGetData = {
        data: {
          doctor_id: safeParseInt(userId),
        },
      }
      dispatch(postApiDataListPracticeLocation(postData) as any)
        .unwrap()
        .then((res: any) => {
          setPracticeLocationList(res.practice_location_list)
          setLoading(false)
        })
        .catch((error: any) => {
          setLoading(false)

          eventEmitter.emit('apiError', {...error, alertType: alertType.MODAL})
        })
    }
  }

  const callSetPrimary = (clinic: any) => {
    const postData: ApiGetData = {
      data: {
        practice_location_id: clinic.practice_location_id,
        practice_location_name: clinic.practice_location_name,
        mobile_number: clinic.mobile_number,
        email_id: clinic.email_id,
        address: clinic.address,
        city: clinic.city,
        state: clinic.state,
        country: clinic.country,
        google_map_url: clinic.google_map_url,
        website_url: clinic.website_url,
        doctor_id: clinic.doctor_id,
        user_id: safeParseInt(userId),
        practice_location_type: 'Primary',
        active: clinic.active,
        pincode: clinic.pin_code,
      },
    }
    dispatch(postApiDataEditPracticeLocation(postData) as any)
      .unwrap()
      .then(() => {
        setSuccessTitle(`Success! The primary location has been changed.`)
        setActiveRowOption(null)
        getClinics()

        identifyUser()
      })
      .catch((error: AxiosError) => {
        console.error(error)
      })
  }

  const openEditPracticeLocation = (clinic: any) => {
    setActiveRowOption(0)
    setClinicData(clinic)
    setAddPracticeLocationStatusModal((prev) => !prev)
  }

  const changeStatus = (clinic: any, status: string) => {
    const postData: ApiGetData = {
      data: {
        practice_location_id: clinic.practice_location_id,
        practice_location_name: clinic.practice_location_name,
        mobile_number: clinic.mobile_number,
        email_id: clinic.email_id,
        address: clinic.address,
        city: clinic.city,
        state: clinic.state,
        country: clinic.country,
        google_map_url: clinic.google_map_url,
        website_url: clinic.website_url,
        doctor_id: clinic.doctor_id,
        user_id: safeParseInt(userId),
        practice_location_type: clinic.practice_location_type,
        active: status === '1' ? true : false,
        pincode: clinic.pin_code,
      },
    }
    dispatch(postApiDataEditPracticeLocation(postData) as any)
      .unwrap()
      .then(() => {
        setSuccessTitle('Practice location status updated!')
        getClinics()

        identifyUser()
      })
      .catch((error: any) => {
        ErrorToast(error.status.message)
        getClinics()
      })
  }

  return (
    <div className='md:pb-0 pb-[70px]'>
      {loading ? (
        'Loading...'
      ) : (
        <TableContainerForPracticeLocationList
          {...{
            changeStatus,
            setActiveRowOption,
            activeRowOption,
            openEditPracticeLocation,
            callSetPrimary,
            success,
            successTitle,
            setSuccessTitle,
            data: practiceLocationList,
            setSuccess,
            editPracticeLocationStatusModel,
            clinicData,
            addPracticeLocationStatusModal,
            setEditPracticeLocationStatusModel,
            setAddPracticeLocationStatusModal,
          }}
        />
      )}
    </div>
  )
}

export default PracticeLocationList
