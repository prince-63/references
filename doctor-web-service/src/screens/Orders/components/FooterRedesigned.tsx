import useAllUserPlan from '@hooks/useAllUserPlan'
import useDispatchAction from '@hooks/useDispatchAction'
import QuitEditingModal from 'components/quitEditingModal/QuitEditingModal'
import {ArrowLeft, ArrowRight, X} from 'lucide-react'
import {useState} from 'react'
import {useSelector} from 'react-redux'
import {useNavigate} from 'react-router-dom'
import {prevStep} from 'redux/Slices/AppSlice/orders/orders.slice'
import {RootState} from 'redux/store'
import cn from '@utils/cn'
import {Spin} from 'antd'
import VSPFooter from 'screens/VSP/CreateOrder/components/VSPFooter'
import useProfileBasePath from '@hooks/useProfileBasePath'

type FooterRedesignedProps = {
  onNext: () => void
  nextButtonText?: string
  disableNext?: boolean
  showNextButton?: boolean
  loadingNext?: boolean
}

const FooterRedesigned = ({
  onNext,
  nextButtonText = 'Save & continue',
  disableNext = false,
  showNextButton = true,
  loadingNext = false,
}: FooterRedesignedProps) => {
  const [cancelSaveModalVisible, setCancelSaveModalVisible] = useState(false)

  const navigate = useNavigate()
  const profileBasePath = useProfileBasePath()
  const {validatingPatient, creatingOrder, currentStep, order} = useSelector(
    (state: RootState) => state.orders
  )
  const {dispatchAction} = useDispatchAction()
  const {isPractice, isAlignerCompanyOrg, isGrowthPlanUser} = useAllUserPlan()

  const isPlanningOrderPath =
    window.location.pathname.includes('customer/create-order') ||
    window.location.pathname.includes('vsp/create-order')
  const isVspCreateOrderPath = window.location.pathname.includes('vsp/create-order')

  const isLoading = validatingPatient || creatingOrder || loadingNext
  const isDisabled = validatingPatient || creatingOrder || loadingNext || disableNext

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
    <>
      <div className='py-6 border-t border-mediumGray/40 flex md:justify-end justify-center md:px-6 mt-auto bg-white'>
        {/* ✅ FIXED WRAPPER */}
        <div className='flex flex-col-reverse md:flex-row md:flex-nowrap gap-3  w-full md:w-fit'>
          {/* Cancel */}
          <button
            className={cn(
              'md:w-fit w-full rounded-xl h-11 px-5 text-textColor border border-mediumGray',
              'flex items-center justify-center gap-2 transition-all duration-200',
              'hover:bg-gray-50 hover:border-gray-400 active:scale-[0.98]',
              'font-medium text-sm whitespace-nowrap'
            )}
            type='button'
            onClick={() => setCancelSaveModalVisible(true)}
            disabled={isLoading}
          >
            <X className='w-4 h-4' />
            Cancel
          </button>

          {/* Buttons Group */}
          <div className='flex flex-wrap md:flex-nowrap gap-2'>
            {/* Go Back */}
            <button
              onClick={() => {
                if (currentStep === 0) {
                  setCancelSaveModalVisible(true)
                  return
                }
                dispatchAction(prevStep())
              }}
              disabled={isLoading || (isPlanningOrderPath && currentStep <= 1)}
              className={cn(
                'w-full sm:w-auto md:w-auto rounded-xl h-11 px-5',
                'flex items-center justify-center gap-2 transition-all duration-200',
                'border border-primaryColor text-primaryColor bg-primarySupport',
                'hover:bg-primaryColor/10 active:scale-[0.98]',
                'font-semibold text-sm',
                'disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-primarySupport',
                'whitespace-nowrap'
              )}
              type='button'
            >
              <ArrowLeft className='w-4 h-4' />
              Go back
            </button>

            {/* Save & Continue */}
            {showNextButton && (
              <button
                onClick={onNext}
                disabled={isDisabled}
                className={cn(
                  'w-full sm:w-auto md:w-auto rounded-xl h-11 px-6 min-w-[170px]',
                  'flex items-center justify-center gap-2 transition-all duration-200',
                  'bg-primaryColor text-white border border-primaryColor',
                  'hover:shadow-colorPrimary active:scale-[0.98]',
                  'font-semibold text-sm',
                  'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none',
                  'whitespace-nowrap'
                )}
                type='button'
              >
                {isLoading ? (
                  <Spin size='small' className='[&_.ant-spin-dot-item]:bg-white' />
                ) : (
                  <>
                    {nextButtonText}
                    <ArrowRight className='w-4 h-4' />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Cancel Modal */}
      <QuitEditingModal
        visible={cancelSaveModalVisible}
        setQuitModalVisible={setCancelSaveModalVisible}
        onOkClick={() => {
          const patientId = order?.patient_details?.id
          if (isPlanningOrderPath) {
            if (patientId) {
              navigate(`${profileBasePath}/${patientId}/plans?order_id=${order.order_id}`)
            } else {
              navigate(-1)
            }
          } else if (isAlignerCompanyOrg || isGrowthPlanUser) {
            navigate('/aligner-orders?workFlow=new-case')
          } else if (isPractice) {
            if (patientId) {
              navigate(`/profile/${patientId}`)
            } else {
              navigate(-1)
            }
          } else {
            navigate('/orders')
          }
        }}
      />
    </>
  )
}

export default FooterRedesigned
