import useAllUserPlan from '@hooks/useAllUserPlan'
import useDispatchAction from '@hooks/useDispatchAction'
import AntdButton from 'components/atom/Buttons/AntdButton'
import QuitEditingModal from 'components/quitEditingModal/QuitEditingModal'
import {useState} from 'react'
import {useSelector} from 'react-redux'
import {useNavigate} from 'react-router-dom'
import {prevStep} from 'redux/Slices/AppSlice/orders/orders.slice'
import {RootState} from 'redux/store'
import VSPFooter from 'screens/VSP/CreateOrder/components/VSPFooter'
import useProfileBasePath from '@hooks/useProfileBasePath'

type FooterProps = {
  onNext: () => void
  nextButtonText?: string
  disableNext?: boolean
  showNextButton?: boolean
  loadingNext?: boolean
}

const Footer = ({
  onNext,
  nextButtonText = 'Save & continue',
  disableNext = false,
  showNextButton = true,
  loadingNext = false,
}: FooterProps) => {
  const [cancelSaveModalVisible, setCancelSaveModalVisible] = useState(false)

  const navigate = useNavigate()
  const profileBasePath = useProfileBasePath()
  const {validatingPatient, creatingOrder, currentStep, order} = useSelector(
    (state: RootState) => state.orders
  )
  const {dispatchAction} = useDispatchAction()
  const {isPractice, isAlignerCompanyOrg, isGrowthPlanUser} = useAllUserPlan()

  const isCreateOrderPath =
    window.location.pathname.includes('customer/create-order') ||
    window.location.pathname.includes('vsp/create-order')
  const isVspCreateOrderPath = window.location.pathname.includes('vsp/create-order')

  if (isVspCreateOrderPath) {
    return (
      <VSPFooter
        onNext={onNext}
        nextButtonText={nextButtonText}
        disableNext={disableNext}
        showNextButton={showNextButton}
        loadingNext={loadingNext}
      />
    )
  }

  return (
    <div className='py-6 border-t border-mediumGray/40 flex md:justify-end justify-center md:px-6 mt-auto bg-white'>
      <div className='flex flex-col-reverse md:flex-row gap-3 md:mr-[180px] w-full md:w-fit'>
        <button
          className='md:w-fit w-full rounded-lg h-10 px-5 text-textColor border border-mediumGray justify-start'
          type='button'
          onClick={() => {
            setCancelSaveModalVisible(true)
          }}
          disabled={validatingPatient || creatingOrder}
        >
          Cancel
        </button>
        <div className='flex flex-wrap gap-2'>
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
            disabled={validatingPatient || creatingOrder || (isCreateOrderPath && currentStep <= 0)}
          />
          {showNextButton && (
            <AntdButton
              onClick={onNext}
              className='w-full sm:w-1/2 md:w-auto border border-primaryColor h-10 font-semibold text-base bg-primaryColor'
              isLoading={validatingPatient || creatingOrder || loadingNext}
              text={nextButtonText}
              disabled={validatingPatient || creatingOrder || loadingNext || disableNext}
            />
          )}
        </div>
      </div>
      <QuitEditingModal
        {...{
          visible: cancelSaveModalVisible,
          setQuitModalVisible: setCancelSaveModalVisible,
          onOkClick: () => {
            if (isCreateOrderPath) {
              const patientId = order?.patient_details?.id
              if (patientId) {
                navigate(`${profileBasePath}/${patientId}/plans`)
              } else {
                navigate(-1)
              }
            } else if (isPractice || isAlignerCompanyOrg || isGrowthPlanUser) {
              navigate('/aligner-orders?workFlow=new-case')
            } else {
              navigate('/orders')
            }
          },
        }}
      />
    </div>
  )
}

export default Footer
