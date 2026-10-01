import useDispatchAction from '@hooks/useDispatchAction'
import {Spin} from 'antd'
import cn from '@utils/cn'
import QuitEditingModal from 'components/quitEditingModal/QuitEditingModal'
import {ArrowLeft, ArrowRight} from 'lucide-react'
import {useState} from 'react'
import {useSelector} from 'react-redux'
import {useNavigate} from 'react-router-dom'
import {prevStep} from 'redux/Slices/AppSlice/orders/orders.slice'
import {RootState} from 'redux/store'

type VSPFooterProps = {
  onNext: () => void
  nextButtonText?: string
  disableNext?: boolean
  showNextButton?: boolean
  loadingNext?: boolean
}

const VSPFooter = ({
  onNext,
  nextButtonText = 'Save & continue',
  disableNext = false,
  showNextButton = true,
  loadingNext = false,
}: VSPFooterProps) => {
  const navigate = useNavigate()
  const {dispatchAction} = useDispatchAction()
  const [cancelSaveModalVisible, setCancelSaveModalVisible] = useState(false)
  const {currentStep} = useSelector((state: RootState) => state.orders)
  const {createVspOrderLoading, updateVspOrderLoading, vspOrderDetails, createdVspOrder} =
    useSelector((state: RootState) => state.vspOrders)

  const isLoading = createVspOrderLoading || updateVspOrderLoading || loadingNext
  const isDisabled = isLoading || disableNext

  return (
    <>
      <div className='fixed bottom-0 left-0 right-0 z-40 border-t border-[#DFE4F3] bg-white/95 px-4 py-4 backdrop-blur md:left-[280px] md:px-6'>
        <div className='mx-auto flex w-full max-w-[980px] flex-col-reverse gap-3 md:flex-row md:justify-end'>
          <button
            type='button'
            className={cn(
              'h-11 rounded-xl border border-[#D0D5DD] px-5 text-sm font-semibold text-[#344054]',
              'transition-all hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-50'
            )}
            onClick={() => setCancelSaveModalVisible(true)}
            disabled={isLoading}
          >
            Cancel
          </button>

          <div className='flex flex-wrap gap-2'>
            <button
              type='button'
              onClick={() => {
                if (currentStep === 0) {
                  setCancelSaveModalVisible(true)
                  return
                }
                dispatchAction(prevStep())
              }}
              disabled={isLoading || currentStep <= 0}
              className={cn(
                'h-11 rounded-xl border border-[#CAD7FF] bg-[#EEF2FF] px-5 text-sm font-semibold text-[#3754EB]',
                'inline-flex items-center justify-center gap-2 transition-all hover:bg-[#E6EDFF]',
                'disabled:cursor-not-allowed disabled:opacity-50'
              )}
            >
              <ArrowLeft className='h-4 w-4' />
              Go back
            </button>

            {showNextButton ? (
              <button
                type='button'
                onClick={onNext}
                disabled={isDisabled}
                className={cn(
                  'h-11 rounded-xl border border-[#4462EA] bg-[#4A62E8] px-6 text-sm font-semibold text-white',
                  'inline-flex items-center justify-center gap-2 shadow-[0_8px_18px_-10px_rgba(74,98,232,0.75)] transition-all',
                  'hover:bg-[#3E57DD] disabled:cursor-not-allowed disabled:opacity-50'
                )}
              >
                {isLoading ? (
                  <Spin size='small' className='[&_.ant-spin-dot-item]:bg-white' />
                ) : (
                  <>
                    {nextButtonText}
                    <ArrowRight className='h-4 w-4' />
                  </>
                )}
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <QuitEditingModal
        visible={cancelSaveModalVisible}
        setQuitModalVisible={setCancelSaveModalVisible}
        onOkClick={() => {
          const patientId = vspOrderDetails?.patient_id ?? createdVspOrder?.patient_id
          if (patientId) {
            navigate(`/vsp-profile/${patientId}/plans`)
            return
          }
          navigate(-1)
        }}
      />
    </>
  )
}

export default VSPFooter
