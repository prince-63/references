import useAllUserPlan from '@hooks/useAllUserPlan'
import useDispatchAction from '@hooks/useDispatchAction'
import AntdButton from 'components/atom/Buttons/AntdButton'
import QuitEditingModal from 'components/quitEditingModal/QuitEditingModal'
import {useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {useNavigate} from 'react-router-dom'
import {prevStep, nextStep} from 'redux/Slices/AppSlice/ExistingCase/ExistingCase.slice'
import {RootState} from 'redux/store'

const Footer = ({onNext, disabled = false}: {onNext: () => void; disabled?: boolean}) => {
  const [cancelSaveModalVisible, setCancelSaveModalVisible] = useState(false)
  const navigate = useNavigate()
  const {currentStep} = useSelector((state: RootState) => state.existingCase)
  const {patientDetails} = useSelector((state: RootState) => state.orders)
  const patientData = patientDetails?.patient_details
  const {isAlignerCompanyOrg} = useAllUserPlan()

  const {dispatchAction} = useDispatchAction()
  const dispatch = useDispatch()

  const handleNext = () => {
    if (currentStep === 3) {
      navigate('/patients-list')
      return
    }
    dispatch(nextStep())
  }

  return (
    <div className=' py-4 border-t border-mediumGray md:absolute fixed bottom-0 left-0 right-0 flex  md:justify-end  px-4 mt-auto bg-white z-20 '>
      <div className='flex flex-col-reverse md:flex-row gap-3 md:mr-[180px] w-full md:w-fit '>
        <div className='flex flex-wrap gap-2'>
          <AntdButton
            onClick={() => {
              if (currentStep === 0) {
                setCancelSaveModalVisible(true)
              }
              dispatchAction(prevStep())
            }}
            className='w-full sm:w-1/2 md:w-auto rounded-lg h-10 cursor-pointer border border-primaryColor text-primaryColor font-semibold hover:!bg-primarySupport hover:!text-primaryColor bg-primarySupport'
            text={'Back'}
            loading={false}
          />
          <AntdButton
            onClick={() =>
              patientData?.is_practice_assigned && isAlignerCompanyOrg ? handleNext() : onNext()
            }
            className='w-full sm:w-1/2 md:w-auto border border-primaryColor h-10 font-semibold text-base bg-primaryColor'
            text={'Next'}
            disabled={disabled}
          />
        </div>
      </div>
      <QuitEditingModal
        {...{
          visible: cancelSaveModalVisible,
          setQuitModalVisible: setCancelSaveModalVisible,
          onOkClick: () => {
            navigate('/patients-list')
          },
        }}
      />
    </div>
  )
}

export default Footer
