import actionTypes from '@constants/actionTypes'
import useDispatchAction from '@hooks/useDispatchAction'
import {AxiosError} from 'axios'
import AntdButton from 'components/atom/Buttons/AntdButton'
import BackGroundSVG from 'components/atom/SVG/BackGroundSVG'
import CommonSVG from 'components/atom/SVG/CommonSVG'
import SuccessToast from 'components/modal/Alert/SuccessToast'
import ModalLayout from 'components/modal/ModalLayout'
import {useContext, useEffect} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {useParams} from 'react-router-dom'
import {
  ApiForceAlignerDataPayload,
  forceAlignerChangeAPI,
  setDataForceAlignerData,
} from 'redux/Slices/AppSlice/LeadsProfile/AlignerTracking.slice'
import {postApiDataTreatmentPlan} from 'redux/Slices/AppSlice/PatientProfile/TreatmentPlan/TreatmentPlan'

import {RootState} from 'redux/store'
import {ActionItem} from 'screens/Patients/LeadsProfile/leadsProfile.types'
import {ApiGetData, getFirstLetterCapitalOfWord, safeParseInt} from 'utils/ConstFunctions'
import {SVG_CROSS, SVG_SWITCH_ARROW} from 'utils/SvgConstants'
import hasValue from 'utils/hasValue'
import dayjs from 'dayjs'
import {getPatientTimeline} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfile.slice'
import {AuthContext} from 'context/AuthContext'

interface IForceAlignerData {
  handleOnClose: (option: ActionItem) => void
}

const ModalViewForceAlignerChange = (props: IForceAlignerData) => {
  const {handleOnClose} = props
  const dispatch = useDispatch()
  const {dispatchAction} = useDispatchAction()
  const {id: patientUserId, patientId} = useParams()
  const {dataForceAlignerData: data, loadingPostForceAlignerChange}: any = useSelector(
    (state: RootState) => state.alignerTracking
  )
  const now = dayjs()
  const selectedDateTime = dayjs(
    `${dayjs().format('YYYY-MM-DD')} ${data.changeTime}`,
    'YYYY-MM-DD h:mm A'
  )

  useEffect(() => {
    if (selectedDateTime.isBefore(now)) {
      dispatch(
        setDataForceAlignerData({
          ...data,
          changeTime: now.format('h:mm A'),
        })
      )
    }
  }, [])

  function generateFileNameObjects(imageList: any) {
    if (hasValue(imageList)) {
      return imageList.map((image: any) => ({
        original_filename: image.name,
        save_as_filename: image.name,
      }))
    } else {
      return null
    }
  }
  const {userId} = useContext(AuthContext)
  const selectedFilter = useSelector((state: RootState) => state.leadsProfile.selectedFilter)
  const callForceAlignerChange = async () => {
    const postData: ApiForceAlignerDataPayload = {
      details: {
        patient_id: safeParseInt(patientId),
        aligner_journey_id: data?.alignerJourneyId,
        new_aligner_no: data?.endAlignerNumber,
        previous_aligner_change_date: data?.changeDate,
        aligner_action_type: 'FORCE_ALIGNER_CHANGE',
        with_new_aligner_photo_files: generateFileNameObjects(data?.files),
        with_previous_aligner_photo_files: [],
        without_new_aligner_photo_files: [],
        previous_aligner_change_time: dayjs().tz('Asia/Kolkata').format('HH:mm:ss'),
      },
      photo: hasValue(data?.files) ? data?.files : null,
    }
    await dispatchAction(forceAlignerChangeAPI(postData))
      .unwrap()
      .then(async () => {
        const postData: ApiGetData = {
          data: {
            patient_id: patientUserId ?? patientId,
            alignerJourneyId: data?.alignerJourneyId,
          },
        }
        dispatch(postApiDataTreatmentPlan(postData) as any)
        dispatch(
          getPatientTimeline({
            doctor_id: safeParseInt(userId),
            patient_id: safeParseInt(patientId),
            filter: selectedFilter.key,
          }) as any
        )
        handleOnClose(actionTypes.FORCE_CHANGE_ALIGNER_CONFIRM_MODAL)
        SuccessToast('Aligner changed successfully!')
      })
      .catch((error: AxiosError) => {
        console.error(error)
      })
  }
  return (
    <ModalLayout className='w-[534px]'>
      <div className='px-4'>
        <div className='mt-3 relative'>
          <div className='text-2xl font-bold flex justify-between items-center'>
            <p>Confirm manual aligner change</p>
            <div
              className='cursor-pointer'
              onClick={() => {
                handleOnClose(actionTypes.FORCE_CHANGE_ALIGNER_CONFIRM_MODAL)
              }}
            >
              <CommonSVG svg={SVG_CROSS} width='47' height='47' />
            </div>
          </div>
          <div className='rounded-lg w-full border border-mediumGray mt-4 '>
            <div className='flex h-[86px] relative'>
              <div className='flex flex-col items-center justify-center w-1/2 border-r'>
                <div className='text-[16px] font-medium'>
                  {getFirstLetterCapitalOfWord(data?.startJawType) + ' ' + data?.startAlignerNumber}
                </div>
                <div className='text-[14px] text-textColor font-medium'>Changed from</div>
              </div>
              <div className='flex flex-col items-center justify-center w-1/2 '>
                <div className='text-[16px] font-medium'>
                  {getFirstLetterCapitalOfWord(data?.endJawType) + ' ' + data?.endAlignerNumber}
                </div>
                <div className='text-[14px] text-textColor font-medium'>Changed to</div>
              </div>
              <div className='absolute left-1/2 transform -translate-x-1/2 top-1/2 -translate-y-1/2'>
                <BackGroundSVG
                  className='w-[48px] h-[48px] bg-lightGray rounded-full'
                  svg={SVG_SWITCH_ARROW}
                  width='34'
                  height='34'
                />
              </div>
            </div>
            <div className='h-[45px] flex justify-between items-center border-t border-mediumGray px-4'>
              <div className='text-[16px] font-normal text-textColor'>Changed on:</div>
              <div className='text-[16px] font-semibold'>
                {dayjs(data?.changeDate).format('DD-MMM-YYYY')}
              </div>
            </div>
            <div className='h-[45px] flex justify-between items-center border-t border-mediumGray px-4'>
              <div className='text-[16px] font-normal text-textColor'>Changed at:</div>
              <div className='text-[16px] font-semibold'>{data?.changeTime}</div>
            </div>
          </div>

          <div className='mt-7 flex gap-8'>
            <AntdButton
              text={'Cancel'}
              className='h-12 border !border-primaryColor bg-primarySupport hover:!bg-primarySupport text-primaryColor w-full '
              onClick={() => handleOnClose(actionTypes.FORCE_CHANGE_ALIGNER_CONFIRM_MODAL)}
            />
            <AntdButton
              text={'Confirm & update'}
              className='h-12 !bg-primaryColor w-full hover:!bg-primaryColor'
              onClick={() => callForceAlignerChange()}
              loading={loadingPostForceAlignerChange}
            />
          </div>
        </div>
      </div>
    </ModalLayout>
  )
}

export default ModalViewForceAlignerChange
