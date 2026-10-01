import {FC, useContext, useEffect, useState} from 'react'
import LabelTitle from '../../../../atom/Labels/LabelTitle'
import {IMAGE_DEFAULT_PATIENT} from '../../../../../utils/ImageConst'
import {
  ApiGetData,
  identifyUser,
  safeParseInt,
  validateList,
  getImageUrl,
  getImageUrlById,
} from '../../../../../utils/ConstFunctions'
import {useSelector} from 'react-redux'
import {AuthContext} from '../../../../../context/AuthContext'
import {postApiDataNewChatAdd} from '../../../../../redux/Slices/AppSlice/Chat/NewChatAddSlice'
import BackGroundSVG from '../../../../atom/SVG/BackGroundSVG'
import {SVG_CROSS, SVG_PROFILE_PATIENT} from '../../../../../utils/SvgConstants'
import CommonSVG from '../../../../atom/SVG/CommonSVG'
import {useNavigate} from 'react-router-dom'
import {Image} from '../../../../../assets/images/Images/Image'
import hasValue from '../../../../../utils/hasValue'
import When from '../../../../when/When'
import ModalLayout from 'components/modal/ModalLayout'
import useDispatchAction from '@hooks/useDispatchAction'
import {
  getPatientsList,
  RequestPatientList,
} from 'redux/Slices/AppSlice/PatientsList/patientsList.slice'
import PracticeSearchInput from 'screens/Practices/PracticeList/components/PracticeSearchInput'
import {RootState} from 'redux/store'
import {PatientRowDetails} from 'screens/Patients/PatientList/types/patientsList.types'
import InfiniteScroll from 'react-infinite-scroll-component'
import Spinner from 'components/spinner/Spinner'
import filterPatientList from '@constants/filterPatientList'
import patientCountStatTypesConstants from '@constants/patientCountStatTypes.constants'
import useAllUserPlan from '@hooks/useAllUserPlan'

const extractPatientRows = (payload: unknown): PatientRowDetails[] => {
  if (Array.isArray(payload)) {
    return payload as PatientRowDetails[]
  }

  if (payload && typeof payload === 'object') {
    const data = payload as {
      patients?: PatientRowDetails[]
      patient_details?: PatientRowDetails[]
      active_patient_details?: PatientRowDetails[]
    }

    return (data.active_patient_details ??
      data.patient_details ??
      data.patients ??
      []) as PatientRowDetails[]
  }

  return []
}
interface props {
  setNewPatientChatModel: any
  onPatientChatClick: () => void
  data: any
}
const ModelNewChat: FC<props> = (props) => {
  const {setNewPatientChatModel, onPatientChatClick, data: chatList} = props
  const {dataPatientsList, loadingPatients} = useSelector((state: RootState) => state.patientsList)
  const {dispatchAction} = useDispatchAction()
  const navigation = useNavigate()
  const {userId} = useContext(AuthContext)
  const [error, setError] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState<string | null>(null)
  const [pageNumber, setPageNumber] = useState(0)
  const {isStarterPlanUser} = useAllUserPlan()

  const initialPatients = (dataPatientsList?.active_patient_details ??
    dataPatientsList?.patients ??
    []) as PatientRowDetails[]
  const [patientList, setPatientList] = useState<PatientRowDetails[]>(initialPatients)
  // Active Patients List API
  useEffect(() => {
    getPatientList({})
  }, [])

  const getPatientList = async ({
    page = 1,
    search = null,
  }: {
    page?: number
    search?: string | null
  }) => {
    const payload: RequestPatientList = {
      page_number: page,
      doctor_id: safeParseInt(userId),
      search: search ?? '',
      practice_location: [],
      filter_by_treatment_type: '',
      filter_by_practice_name: '',
      filter_by_app_invite_status: filterPatientList.CONNECTED,
      filter_by_global_status: patientCountStatTypesConstants.ALL,
      filter_by_role: null,
    }
    dispatchAction(getPatientsList({payload}))
      .unwrap()
      .then((res: any) => {
        const normalizedPatients = extractPatientRows(res)
        const filteredPatients = normalizedPatients.filter((patient: PatientRowDetails) => {
          return !chatList.some(
            (chatListPatient: any) => patient?.patient_id === chatListPatient.user_id
          )
        })
        setPatientList(filteredPatients)
      })
      .catch((error: any) => {
        console.error(error)
        setPatientList([])
      })
  }

  const validateInput = (value: any) => {
    if (!value || typeof value !== 'string') {
      return false
    }
    const spaceCount = (value.match(/\s/g) || []).length
    return spaceCount <= 2 && /^[a-zA-Z ]*$/.test(value) && value.trim() !== ''
  }

  const callInvitePatient = () => {
    if (!validateInput(searchTerm)) {
      setError('Please enter a valid name')
      return
    }
    if (isStarterPlanUser) {
      navigation('/add-patient-starter')
      setError('')
    } else {
      navigation('/add-patient')
      setError('')
    }
  }
  // New Patient Add
  const callNewChatCreate = (patient: PatientRowDetails) => {
    const postData: ApiGetData = {
      data: {
        patient_id: [patient.patient_id],
        doctor_id: safeParseInt(userId),
      },
    }
    dispatchAction(postApiDataNewChatAdd(postData) as any)
      .unwrap()
      .then(() => {
        setNewPatientChatModel(false)
        identifyUser()
        navigation(`/chat-list/${patient.patient_id}`)
        onPatientChatClick()
      })
      .catch((error: any) => {
        console.error(error)
      })
  }

  const handleSearch = (search: string | null) => {
    setSearchTerm(search)
    getPatientList({page: 1, search: search})
  }
  const loadMoreData = () => {
    setPageNumber((prev) => prev + 1)
    getPatientList({page: pageNumber + 1})
  }
  return (
    <ModalLayout isResponsive={true} className='md:w-[628px]'>
      <div className='flex justify-between items-center'>
        <BackGroundSVG
          svg={SVG_PROFILE_PATIENT}
          width=''
          height=''
          className='w-16 h-16 bg-primarySupport rounded-full'
        />
        <div className='w-12 h-12' onClick={() => setNewPatientChatModel(false)}>
          <CommonSVG svg={SVG_CROSS} width='47' height='47' />
        </div>
      </div>
      <div className='text-black text-2xl font-semibold mt-6'>New chat</div>
      <div className='mt-5'>
        <LabelTitle title='Enter patients name' required={true} />
        <div
          className={`w-full relative rounded-lg  ${
            error ? 'border border-red' : 'border border-textColor'
          }`}
        >
          <PracticeSearchInput
            handleSearch={handleSearch}
            className='!w-full !border-transparent'
          />

          {patientList.length === 0 && !hasValue(error) && searchTerm !== null && (
            <button className='px-4 pb-2' onClick={() => callInvitePatient()}>
              <span className='text-textColor text-xl me-2 font-normal '> +</span>
              <span className='text-textColor text-base font-normal '>
                Patient not available. Do you want to invite{' '}
              </span>
              <span className='text-black text-base font-semibold'>“{searchTerm ?? ''}”?</span>
            </button>
          )}
        </div>
        {error && <div className='text-red'>{error}</div>}
      </div>
      <InfiniteScroll
        dataLength={patientList.length}
        next={loadMoreData} // Call next with the handler
        hasMore={true}
        height={300}
        loader={
          <div>
            <Spinner loading={loadingPatients} />
          </div>
        }
        refreshFunction={() => getPatientList({})}
        pullDownToRefresh
        pullDownToRefreshThreshold={50}
        pullDownToRefreshContent={
          <h3 style={{textAlign: 'center'}}>&#8595; Pull down to refresh</h3>
        }
        releaseToRefreshContent={<h3 style={{textAlign: 'center'}}>&#8593; Release to refresh</h3>}
      >
        <div className='max-h-[250px] overflow-y-scroll mt-5'>
          <div className='text-textColor text-sm font-medium '>Select from the list </div>
          {validateList(patientList) &&
            patientList.map((patient: PatientRowDetails, index: number) => (
              <div
                className='w-full h-full py-4 flex justify-start items-center gap-4  border-b hover:bg-secondarySupport cursor-pointer rounded-lg'
                key={index}
                onClick={() => callNewChatCreate(patient)}
              >
                <Image
                  className='w-12 h-12 relative rounded-3xl'
                  src={
                    patient.profile_picture_id
                      ? getImageUrlById(patient.profile_picture_id)
                      : patient.profile_url == null
                        ? IMAGE_DEFAULT_PATIENT
                        : getImageUrl({
                            url: patient.profile_url,
                            is_gdrive_platform:
                              patient.profile_url.includes('patient/drive/image/'),
                            drive_file_id: patient.profile_url.match(
                              /patient\/drive\/image\/([^/?#]+)/
                            )?.[1],
                          }) || patient.profile_url
                  }
                />
                <div>
                  <div className='w-full text-black text-base font-semibold '>
                    {patient.full_name}
                  </div>
                  <When isTrue={hasValue(patient.mobile)}>
                    <div className='w-full text-black text-opacity-80 text-xs font-medium'>
                      {patient.country_code}
                      {patient.mobile}
                    </div>
                  </When>
                </div>
              </div>
            ))}
        </div>
      </InfiniteScroll>
    </ModalLayout>
  )
}

export default ModelNewChat
