import {FC, useContext, useEffect, useState} from 'react'
import Button from '../../atom/Buttons/Button'
import DropdownPrimary from '../../atom/Dropdown/DropdownPrimary'
import {useFormik} from 'formik'
import * as Yup from 'yup'
import {
  ERROR_PRACTICE_LOCATION_NAME,
  TEXT_LOADING,
  TEXT_UPDATE_DETAILS,
  fieldErrorMessages,
} from '../../../utils/MessageConstant'
import {AuthContext} from '../../../context/AuthContext'
import {useDispatch, useSelector} from 'react-redux'
import {
  ApiGetData,
  checkButtonStates,
  checkValueOrEmptyString,
  identifyUser,
  safeParseInt,
} from '../../../utils/ConstFunctions'
import {RootState} from '../../../redux/store'
import {postApiDataListActivePracticeLocation} from '../../../redux/Slices/AppSlice/PracticeLocation/listActivePracticeLocationSlice'
import {
  clearDataChangePracticeLocation,
  postApiDataChangePracticeLocationStatusSlice,
} from '../../../redux/Slices/AppSlice/PracticeLocation/changePracticeLocationStatusSlice'
import {useParams} from 'react-router-dom'
import ErrorToast from '../Alert/ErrorToast'
import BackGroundSVG from '../../atom/SVG/BackGroundSVG'
import {SVG_CLINIC_PRIMARY, SVG_CROSS} from '../../../utils/SvgConstants'
import CommonSVG from '../../atom/SVG/CommonSVG'
interface props {
  setIsEditPracticeLocationModalOpen: any
  setChangedPracticeLocation?: any
}
const initialValues = {
  practiceLocation: '',
}
const schema = Yup.object().shape({
  practiceLocation: Yup.string().required(ERROR_PRACTICE_LOCATION_NAME),
})

const ModalEditPracticeLocation: FC<props> = (props) => {
  const {id: patientUserId} = useParams()
  const {setIsEditPracticeLocationModalOpen, setChangedPracticeLocation} = props
  const dispatch = useDispatch()
  const [practiceLocationList, setPracticeLocationList] = useState([])
  const {userId} = useContext(AuthContext)
  const [buttonUpdateDetailsText, setButtonUpdateDetailsText] = useState(TEXT_UPDATE_DETAILS)

  // ASSIGN CLINIC
  const {
    loading: loadingPracticeLocationChangeChange,
    error: errorPracticeLocationChangeChange,
    data: dataPracticeLocationChangeChange,
  } = useSelector((state: RootState) => state.apiChangePracticeLocationStatus)

  const formik = useFormik({
    initialValues,
    validationSchema: schema,
    onSubmit: async (values) => {
      setButtonUpdateDetailsText(TEXT_LOADING)
      if (checkValueOrEmptyString(patientUserId) === null) {
        ErrorToast(fieldErrorMessages.TEXT_PATIENT_ID)
      } else {
        const practiceLocationId = values.practiceLocation
        const postData: ApiGetData = {
          data: {
            patient_id: safeParseInt(patientUserId),
            practice_location_id: practiceLocationId,
            user_id: safeParseInt(userId),
            treatment_type_id: 1,
          },
        }
        dispatch(postApiDataChangePracticeLocationStatusSlice(postData) as any)
      }
    },
  })

  // clinic list
  const {loading: loadingListActivePracticeLocation, data: dataListActivePracticeLocation} =
    useSelector((state: RootState) => state.apiListActivePracticeLocation)

  useEffect(() => {
    getClinics()
  }, [])

  const getClinics = () => {
    if (checkValueOrEmptyString(userId) === null) {
      ErrorToast(fieldErrorMessages.TEXT_DOCTOR_ID)
    } else {
      const postData: ApiGetData = {
        data: {
          doctor_id: safeParseInt(userId),
        },
      }
      dispatch(postApiDataListActivePracticeLocation(postData) as any)
    }
  }

  useEffect(() => {
    if (dataListActivePracticeLocation != null && !loadingListActivePracticeLocation) {
      const list: any = dataListActivePracticeLocation.practice_location_list

      const clinicList: any = []
      list.forEach((element: any) => {
        clinicList.push({
          value: element.practice_location_id,
          label: element.practice_location_name,
        })
      })
      setPracticeLocationList(clinicList)
    }
  }, [dataListActivePracticeLocation])

  useEffect(() => {
    if (errorPracticeLocationChangeChange == null) {
      setButtonUpdateDetailsText(TEXT_UPDATE_DETAILS)
      if (dataPracticeLocationChangeChange != null && !loadingPracticeLocationChangeChange) {
        dispatch(clearDataChangePracticeLocation())
        setChangedPracticeLocation(true)
        setIsEditPracticeLocationModalOpen(false)

        identifyUser()
      }
    } else {
      setButtonUpdateDetailsText(TEXT_UPDATE_DETAILS)
    }
  }, [dataPracticeLocationChangeChange, loadingPracticeLocationChangeChange])

  return (
    <div
      className='fixed left-0 top-0 z-[1055] h-full w-full flex justify-center items-center bg-black bg-opacity-40'
      tabIndex={-1}
    >
      <form
        onSubmit={formik.handleSubmit}
        className='bg-white w-96 rounded-lg p-6 shadow-lg  min-w-[35%]'
      >
        <div className='flex justify-between items-center'>
          <BackGroundSVG
            svg={SVG_CLINIC_PRIMARY}
            width='36'
            height='36'
            className='bg-primarySupport rounded-full w-[64px] h-[64px]'
          />
          <div className='w-12 h-12' onClick={() => setIsEditPracticeLocationModalOpen(false)}>
            <CommonSVG svg={SVG_CROSS} width='47' height='47' />
          </div>
        </div>
        <div className='mt-4'>
          <div className='text-black text-2xl font-semibold'>Edit practice location</div>
          <div className='mt-2 h-5 text-textColor text-base font-normal'>
            Edit the practice location assigned to your patient
          </div>
        </div>
        <div className='mt-10'>
          <DropdownPrimary
            name='practiceLocation'
            className=''
            label='Change practice location'
            classNameLabel='text-textColor text-lg font-medium'
            formik={formik}
            required={false}
            options={practiceLocationList}
          />
        </div>
        <div className='mt-7'>
          <Button
            text={buttonUpdateDetailsText}
            isDisabled={checkButtonStates(buttonUpdateDetailsText)}
            className='h-12'
          />
        </div>
      </form>
    </div>
  )
}

export default ModalEditPracticeLocation
