import useDispatchAction from '@hooks/useDispatchAction'
import {Steps} from 'antd'
import {useSelector} from 'react-redux'
import {resetPatientDetails, updateCurrentStep} from 'redux/Slices/AppSlice/orders/orders.slice'
import {RootState} from 'redux/store'
import {IMAGE_APP_LOGO} from 'utils/ImageConst'
import createExistingCaseSteps from './components/createExistingCaseSteps'
import cn from '@utils/cn'
import {resetUpdatedInfo} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileUpdateDetails.slice'
import {resetStep} from 'redux/Slices/AppSlice/ExistingCase/ExistingCase.slice'
import {resetTreatmentPlan} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileTreatmentPlan.slice'
import {resetManufacturingListData} from 'redux/Slices/AppSlice/LeadsProfile/GettingStartedOverview/GettingStartedOverview.slice'
import {useEffect} from 'react'
import StartTreatmentPlanModal from './steps/StartTreatmentPlanModal'

type HeaderTitleProps = {
  title: string
  subTitle?: string
  fullName?: string | null
}

const HeaderTitle = ({title, subTitle, fullName}: HeaderTitleProps) => {
  return (
    <div>
      <p className='font-semibold text-2xl text-textColor'>{title}</p>
      {fullName && subTitle && (
        <p className='text-textColor font-normal text-base'>
          {subTitle}: <span className='text-textColor font-normal text-base'>{fullName}</span>
        </p>
      )}
    </div>
  )
}

const CreateExistingCase = () => {
  const {dispatchAction} = useDispatchAction()
  const {currentStep, savePatientData} = useSelector((state: RootState) => state.existingCase)
  const firstName = savePatientData?.data?.first_name ?? ''
  const lastName = savePatientData?.data?.last_name ?? ''
  const fullName = (firstName + ' ' + lastName).trim()

  useEffect(() => {
    dispatchAction(resetTreatmentPlan())

    return () => {
      dispatchAction(resetTreatmentPlan())
      dispatchAction(resetStep())
      dispatchAction(resetUpdatedInfo())
      dispatchAction(resetPatientDetails())
      dispatchAction(resetManufacturingListData({}))
    }
  }, [])

  return (
    <div className='flex flex-col'>
      <StartTreatmentPlanModal />

      <div className='w-full h-[70px] flex justify-between items-center px-4'>
        <div className='flex items-center md:gap-6 gap-1'>
          <img src={IMAGE_APP_LOGO} alt='logo' className='md:w-[159px] w-[99px]' />
        </div>
      </div>

      <div className='flex flex-col gap-4 mx-auto w-full md:w-3/4 px-2 md:px-0'>
        <HeaderTitle title='Quick Add' subTitle='Patient' fullName={fullName ?? undefined} />

        <div className='flex flex-col md:flex-row border-mediumGray border-t py-4'>
          <div className='flex flex-col gap-6'>
            <div className='hidden md:block'>
              <Steps
                onChange={(v) => {
                  dispatchAction(updateCurrentStep(v))
                }}
                direction='vertical'
                size='small'
                current={currentStep}
                items={createExistingCaseSteps}
              />
            </div>
          </div>
          <div className='block md:hidden overflow-x-auto pb-4 mb-4 border-b border-mediumGray'>
            <Steps
              onChange={(v) => {
                dispatchAction(updateCurrentStep(v))
              }}
              direction='horizontal'
              current={currentStep}
              className='min-w-[250vw]'
              responsive={false}
              items={createExistingCaseSteps}
            />
          </div>
          <div
            className={cn(
              'flex flex-1 overflow-y-auto px-2',
              'md:h-[calc(100vh-17rem)]',
              'lg:h-[calc(100vh-15rem)]'
            )}
          >
            {createExistingCaseSteps[currentStep]?.content}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateExistingCase
