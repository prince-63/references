import useDispatchAction from '@hooks/useDispatchAction'
import AntdButton from 'components/atom/Buttons/AntdButton'
import QuitEditingModal from 'components/quitEditingModal/QuitEditingModal'
import {useState} from 'react'
import {useSelector} from 'react-redux'
import {useNavigate} from 'react-router-dom'
import {prevStep} from 'redux/Slices/AppSlice/StarterPlanUserAddPatientStepper/StarterPlanUserAddPatientStepper.slice'
import {RootState} from 'redux/store'

type FooterProps = {
  onNext: () => void
  nextButtonText?: string
  disableNext?: boolean
  showNextButton?: boolean
  showBack?: boolean
  loadingNext?: boolean
}

const Footer = ({
  onNext,
  nextButtonText = 'Save & continue',
  disableNext = false,
  showNextButton = true,
  showBack = true,
  loadingNext = false,
}: FooterProps) => {
  const [cancelSaveModalVisible, setCancelSaveModalVisible] = useState(false)

  const navigate = useNavigate()
  const {validatingPatient, currentStep} = useSelector((state: RootState) => state.orders)
  const {dispatchAction} = useDispatchAction()

  return (
    <div className='py-4 border-t bg-white border-mediumGray flex md:justify-end justify-center md:px-4 mt-auto md:pb-4 pb-[70px] w-full'>
      <div className='flex flex-col-reverse md:flex-row gap-3 md:mr-[180px] w-full md:w-fit'>
        <div className='flex flex-wrap gap-2'>
          {showBack && (
            <AntdButton
              onClick={() => {
                if (currentStep === 0) {
                  setCancelSaveModalVisible(true)
                }
                dispatchAction(prevStep())
              }}
              className='w-full sm:w-1/2 md:w-auto rounded-lg h-10 cursor-pointer border border-primaryColor text-primaryColor font-semibold hover:!bg-primarySupport hover:!text-primaryColor bg-primarySupport'
              text={'Go back'}
              loading={false}
              disabled={validatingPatient}
            />
          )}
          {showNextButton && (
            <AntdButton
              onClick={onNext}
              className='w-full sm:w-1/2 md:w-auto border border-primaryColor h-10 font-semibold text-base bg-primaryColor'
              isLoading={validatingPatient || loadingNext}
              text={nextButtonText}
              disabled={validatingPatient || loadingNext || disableNext}
            />
          )}
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
