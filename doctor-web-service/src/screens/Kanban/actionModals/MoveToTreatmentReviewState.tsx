import {Modal} from 'antd'
import clsx from 'clsx'
import AntdButton from 'components/atom/Buttons/AntdButton'
import {useDispatch, useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import {useMemo} from 'react'
import {useNavigate} from 'react-router-dom'
import {setIsOpenTreatmentReviewModal} from 'redux/Slices/AppSlice/Kanban/Kanban.slice'
import {setTreatmentPlan} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileTreatmentPlan.slice'
import {useFeatureAccess} from '@hooks/useFeatureAccess'
import {parsePlanSummary} from '@utils/kanban'

const MoveToTreatmentReviewState = () => {
  const {isOpenTreatmentReviewModal, cardDetails, dynamicLabel, dynamicStatus} = useSelector(
    (state: RootState) => state.kanban
  )
  const {serviceConfig} = useSelector((state: RootState) => state.serviceConfiguration)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const {permissionChecks} = useFeatureAccess()
  const canCreateTreatmentPlan = permissionChecks?.patientProfileActions?.createNewPlan?.isViewable

  const handleCloseModal = () => {
    dispatch(setIsOpenTreatmentReviewModal({isOpen: false, error: ''}))
  }

  const handleCreateTreatmentPlan = () => {
    dispatch(setIsOpenTreatmentReviewModal({isOpen: false, error: ''}))
    dispatch(setTreatmentPlan({}))
    if (serviceConfig.PLANNING) {
      navigate(`/profile/${cardDetails?.patient_id}/plans?order_id=${cardDetails?.order_id}`)
    } else {
      navigate(`/profile/${cardDetails?.patient_id}/plans-list`)
    }
  }

  const serverMessage = isOpenTreatmentReviewModal?.error ?? ''
  const counts = useMemo(() => parsePlanSummary(serverMessage), [serverMessage])

  const summaryLine = useMemo(
    () => (
      <>
        <span className='inline-flex items-center mr-4'>
          📝<span className='ml-1'>{counts.draft} Draft</span>
        </span>
        <span className='inline-flex items-center mr-4'>
          ⏳<span className='ml-1'>{counts.pendingReview} Pending Review</span>
        </span>
        <span className='inline-flex items-center mr-4'>
          ✏️<span className='ml-1'>{counts.inRevision} In Revision</span>
        </span>
        <span className='inline-flex items-center'>
          ✅<span className='ml-1'>{counts.approved} Approved</span>
        </span>
      </>
    ),
    [counts]
  )

  return (
    <Modal
      onCancel={handleCloseModal}
      destroyOnClose
      centered
      open={isOpenTreatmentReviewModal?.isOpen}
      className={clsx('md:w-[640px] w-full ds-mtr-modal')}
      maskClosable={false}
      width={640}
      footer={null}
    >
      <div className='flex flex-col items-start gap-6 py-4 px-4'>
        <div className='text-xl sm:text-2xl font-bold text-black text-start'>
          {`Cannot Move to ${dynamicLabel}`}
        </div>

        {/* mobile: allow natural wrapping; desktop unchanged max width */}
        <div className='text-sm sm:text-base text-textColor text-start max-w-none sm:max-w-md break-words'>
          {dynamicStatus === 'In Review'
            ? `This case cannot be moved to ${dynamicLabel} because there are no treatment plans pending review. Create or update a plan, then mark it as ready for review to continue.`
            : `This case cannot be moved to ${dynamicLabel} because there are no treatment plans pending review.`}
        </div>

        <div className='text-sm sm:text-base text-textColor text-start max-w-none sm:max-w-md mt-2'>
          Summary of plans
        </div>

        {/* desktop stays single-line; mobile wraps nicely */}
        <div className='text-base text-black text-start w-full mt-1 flex flex-wrap sm:flex-nowrap items-center gap-x-4 gap-y-2 whitespace-normal sm:whitespace-nowrap overflow-visible sm:overflow-hidden'>
          {summaryLine}
        </div>

        {/* desktop row exactly as before; mobile stacks buttons */}
        <div className='flex w-full mt-4 gap-4 flex-col sm:flex-row'>
          <AntdButton
            className='w-full sm:flex-1 h-12 rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
            text='Cancel'
            htmlType='button'
            onClick={handleCloseModal}
          />
          {canCreateTreatmentPlan && (
            <AntdButton
              className='w-full sm:flex-1 h-12 rounded-lg text-white !bg-primaryColor hover:!bg-primaryColor/90'
              text='View plans'
              htmlType='button'
              onClick={handleCreateTreatmentPlan}
            />
          )}
        </div>
      </div>
    </Modal>
  )
}

export default MoveToTreatmentReviewState
