import {IMAGE_APP_LOGO} from 'utils/ImageConst'
import {Steps} from 'antd'
import useDispatchAction from '@hooks/useDispatchAction'
import {
  clearOrder,
  getVendorsList,
  resetPatientDetails,
  updateCurrentStep,
} from 'redux/Slices/AppSlice/orders/orders.slice'

import useSubscriptionDetails from '@hooks/useSubscriptionDetails'
import {useLocation, useParams} from 'react-router-dom'
import hasValue from 'utils/hasValue'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import {useContext, useEffect, useState} from 'react'
import InfoCard from 'screens/Patients/LeadsProfile/main/alignersTracking/components/InfoCard'
import CrossIcon from 'assets/icons/CrossIcon'
import When from 'components/when/When'
import {AuthContext} from 'context/AuthContext'
import cn from '@utils/cn'
import {safeParseInt} from 'utils/ConstFunctions'
import {resetFilesUploadStatus} from 'redux/Slices/AppSlice/CaseRecords/CaseRecords.slice'
import orderStatusConstants from '@constants/orderStatus.constants'
import {getApiDataDoctorProfile} from 'redux/Slices/AppSlice/DoctorProfile/DoctorProfileGetSlice'
import useAllUserPlan from '@hooks/useAllUserPlan'
import getStepItems from '../helpers/getStepItems'
import {getCreateOrderSteps} from '../components/CreateCustomerOrderSteps'
import userOrderDetails from 'screens/Orders/hooks/userOrderDetails'
import RefinementInstructionsModal from '../components/RefinementInstructionsModal'

const CustomerCreateOrderPage = () => {
  const {dispatchAction} = useDispatchAction()
  const {currentStep} = useSelector((state: RootState) => state.orders)
  const {order} = userOrderDetails(true)
  useSubscriptionDetails(true)
  const {orderId} = useParams()
  const isEditOrder = hasValue(orderId)
  const location = useLocation()
  const {state} = location
  const {userId} = useContext(AuthContext)
  const {isPractice, isOrganization, isCustomer, isGrowthPlanUser, isAlignerCompanyOrg} =
    useAllUserPlan()
  const isLabSelected = hasValue(order?.order_details?.target_user_details?.profile_id)

  useEffect(() => {
    if (order && order.status === orderStatusConstants.NEED_MORE_INFO) {
      dispatchAction(updateCurrentStep(1))
    }

    if (isOrganization || isCustomer) {
      dispatchAction(
        getVendorsList({
          doctor_id: safeParseInt(userId),
        })
      )
    }

    return () => {
      dispatchAction(clearOrder())
      dispatchAction(resetFilesUploadStatus())
      dispatchAction(resetPatientDetails())
      dispatchAction(updateCurrentStep(0))
    }
  }, [])

  useEffect(() => {
    const postData = {
      doctor_id: safeParseInt(userId),
    }
    dispatchAction(getApiDataDoctorProfile(postData))
  }, [userId])

  const steps = getCreateOrderSteps()

  useEffect(() => {
    if (currentStep > steps.length - 1) {
      dispatchAction(updateCurrentStep(Math.max(steps.length - 1, 0)))
    }
  }, [currentStep, dispatchAction, steps.length])

  const [isInfoCardVisible, setIsInfoCardVisible] = useState(state?.isClone || false)
  const [showRefinementInstructions, setShowRefinementInstructions] = useState(
    state?.showRefinementInstructions || false
  )
  return (
    <div className='flex flex-col gap-1 pb-[70px] md:pb-0'>
      <RefinementInstructionsModal
        open={showRefinementInstructions}
        onClose={() => setShowRefinementInstructions(false)}
        onContinue={() => setShowRefinementInstructions(false)}
      />
      <div className='w-full h-[80px] flex justify-between items-center px-4'>
        <div className='flex items-center md:gap-6 gap-1'>
          <img src={IMAGE_APP_LOGO} alt='logo' className='md:w-[159px] w-[99px]' />
        </div>
      </div>
      <When isTrue={isInfoCardVisible}>
        <div className='mx-4 md:mx-auto md:w-3/4 mb-6'>
          <InfoCard
            className='border border-primaryColor bg-primarySupport text-sm font-normal '
            titleClassName='text-black text-base font-semibold'
            title='This a clone order with the same details'
            content='You just need to add a few details and edit if required and send it to your vendor'
            showButton={true}
            showArrowIcon={false}
            buttonText={
              <div className='flex gap-2 items-center'>
                <CrossIcon color='#735BF2' />
                <p>Understood</p>
              </div>
            }
            onClick={() => {
              setIsInfoCardVisible(false)
            }}
          />
        </div>
      </When>
      <div className='flex flex-col md:flex-row mx-auto w-full gap-2  md:w-3/4 px-2 md:px-0'>
        <div className='flex flex-col gap-6'>
          <div className='hidden md:block'>
            <Steps
              onChange={(v) => {
                dispatchAction(updateCurrentStep(v))
              }}
              direction='vertical'
              size='small'
              current={currentStep}
              items={getStepItems({
                order,
                isEditOrder,
                currentStep,
                isLabSelected,
                isPractice,
                steps,
              })}
            />
          </div>
          <div className='block md:hidden overflow-x-auto'>
            <Steps
              onChange={(v) => {
                dispatchAction(updateCurrentStep(v))
              }}
              direction='horizontal'
              current={currentStep}
              className='min-w-[250vw]'
              responsive={false}
              items={getStepItems({
                order,
                isEditOrder,
                currentStep,
                isLabSelected,
                isPractice,
                steps,
              })}
            />
          </div>
        </div>
        <div
          className={cn(
            'flex flex-1 md:h-[calc(100vh-17rem)] overflow-y-auto px-2 md:min-h-fit',
            isInfoCardVisible ? 'md:h-[calc(100vh-17rem)]' : 'md:h-[calc(100vh-11rem)]'
          )}
        >
          <When isTrue={isPractice || isGrowthPlanUser || isAlignerCompanyOrg || isCustomer}>
            {steps[currentStep]?.content}
          </When>
        </div>
      </div>
    </div>
  )
}

export default CustomerCreateOrderPage
