import treatmentTypeMain from '@constants/treatmentTypeMain'
import useDispatchAction from '@hooks/useDispatchAction'
import AntdButton from 'components/atom/Buttons/AntdButton'
import ModalLayout from 'components/modal/ModalLayout'
import {AuthContext} from 'context/AuthContext'
import {useContext} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {useNavigate, useParams} from 'react-router-dom'
import {
  getLeadsTreatmentList,
  setIsModalSuccessAddTreatmentOpen,
  setSelectedTreatment,
} from 'redux/Slices/AppSlice/LeadsProfile/LeadAddTreatment'
import {getApiLeadsOverview} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfile.slice'
import {getLeadsProfileDetails} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileDetails.slice'
import {
  setTreatmentPlan,
  setTreatmentPlanBraces,
} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileTreatmentPlan.slice'
import {RootState} from 'redux/store'
import {identifyUser, safeParseInt} from 'utils/ConstFunctions'
import getBrandConfig from 'utils/getBrandConfig'
import {IMAGE_SETUP_TREATMENT_PLAN} from 'utils/ImageConst'

const ModalSuccessAddTreatment = () => {
  const navigation = useNavigate()
  const {patientId}: any = useParams()
  const {dispatchAction} = useDispatchAction()
  const dispatch = useDispatch()
  const {userId} = useContext(AuthContext)

  const {
    selectedTreatment,
  }: {
    selectedTreatment: string
  } = useSelector((state: RootState) => state.LeadAddTreatment)

  const viewProfile = () => {
    ;(dispatchAction(
      getApiLeadsOverview({
        data: {
          patient_id: safeParseInt(patientId),
          doctor_id: safeParseInt(userId),
        },
      })
    ),
      dispatchAction(
        getLeadsProfileDetails({
          patient_id: safeParseInt(patientId),
          doctor_id: safeParseInt(userId),
        })
      ))
    dispatch(setIsModalSuccessAddTreatmentOpen(false))
    navigation(`/leads-profile/${patientId}`)
    dispatch(setSelectedTreatment(treatmentTypeMain.ALIGNERS))
  }

  const setUpTreatmentPlan = async () => {
    identifyUser()

    await dispatchAction(
      getLeadsTreatmentList({
        doctor_id: String(userId),
        patient_id: String(patientId),
      })
    )
    dispatch(setIsModalSuccessAddTreatmentOpen(false))
    dispatchAction(setTreatmentPlan({}))
    dispatchAction(setTreatmentPlanBraces({}))
    if (selectedTreatment === treatmentTypeMain.ALIGNERS) {
      navigation(`/leads-profile/${patientId}/treatment/new/setupTreatmentPlan`)
    } else {
      const queryParams = new URLSearchParams({
        new: 'true',
      }).toString()
      navigation(
        `/leads-profile/${patientId}/treatment/braces/new/setupTreatmentPlanBraces?${queryParams}`
      )
    }
  }
  return (
    <ModalLayout className='md:w-[528px] md:px-10 px-3'>
      <div className='flex justify-center mt-3'>
        <img className='w-[265.81px] h-[266.81px]' src={IMAGE_SETUP_TREATMENT_PLAN} />
      </div>
      <div className='flex flex-col justify-center items-center'>
        <div className='text-center mt-7 text-black text-xl font-semibold '>
          {selectedTreatment === treatmentTypeMain.ALIGNERS ? 'Aligners ' : 'Braces '}
          treatment added successfully!
        </div>
        <div className=' text-textColor font-[16px] md:w-[385px] px-4 text-center'>
          A few more steps and your patient will be ready to be tracked on {getBrandConfig().name}{' '}
          app
        </div>
      </div>
      <div className='mt-7 flex flex-col-reverse md:flex-row gap-5'>
        <AntdButton
          text={'View profile'}
          className='h-[56px] border !border-primaryColor w-full hover:!bg-primarySupport hover:!text-primaryColor text-primaryColor  text-[16px]  font-semibold'
          onClick={() => viewProfile()}
        />
        <AntdButton
          text={'Set-up treatment plan'}
          className='h-[56px] !bg-primaryColor w-full hover:!bg-primaryColor  text-[16px]  font-semibold'
          onClick={() => setUpTreatmentPlan()}
        />
      </div>
    </ModalLayout>
  )
}

export default ModalSuccessAddTreatment
