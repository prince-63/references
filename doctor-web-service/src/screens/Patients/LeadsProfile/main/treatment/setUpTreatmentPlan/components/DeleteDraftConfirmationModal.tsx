import useDispatchAction from '@hooks/useDispatchAction'
import AntdButton from 'components/atom/Buttons/AntdButton'
import ModalLayout from 'components/modal/ModalLayout'
import {AuthContext} from 'context/AuthContext'
import React, {useContext} from 'react'
import {
  postDeleteDraft,
  setOpenDeleteDraftPlanModal,
} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileTreatmentPlan.slice'
import {safeParseInt} from 'utils/ConstFunctions'

import {useNavigate, useParams, useSearchParams} from 'react-router-dom'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import useProfileBasePath from '@hooks/useProfileBasePath'

const DeleteDraftConfirmationModal = ({refreshData}: {refreshData?: () => void}) => {
  const {dispatchAction} = useDispatchAction()
  const navigate = useNavigate()
  const {patientId} = useParams()
  const profileBasePath = useProfileBasePath()
  const {profileId} = useContext(AuthContext)
  const {treatmentId} = useSelector((state: RootState) => state.leadsProfileTreatmentPlanReducer)
  const {serviceConfig} = useSelector((state: RootState) => state.serviceConfiguration)
  const [searchParams] = useSearchParams()
  const order_id = searchParams.get('order_id')

  const handleConfirmDeleteDraft: React.MouseEventHandler<HTMLElement> = () => {
    if (!treatmentId) return
    dispatchAction(
      postDeleteDraft({
        profileId: safeParseInt(profileId),
        treatmentPlanId: treatmentId,
      })
    )
      .unwrap()
      .then(() => {
        refreshData && refreshData()
        if (serviceConfig?.PLANNING) {
          navigate(`/profile/${patientId}/plans?order_id=${order_id}`, {
            replace: true,
          })
        } else {
          navigate(`${profileBasePath}/${patientId}/plans-list`)
        }
        dispatchAction(setOpenDeleteDraftPlanModal(false))
      })
  }
  return (
    <div>
      <ModalLayout>
        <div className='flex flex-col gap-6'>
          <div className='text-center md:text-start'>
            <p className='font-bold text-2xl text-black'>Delete Draft Plan</p>
            <p className='text-textColor text-base'>
              Are you sure you want to delete this draft? This action cannot be undone.
            </p>
          </div>
          <div className='flex  gap-2'>
            <button
              className='bg-white text-red border border-red h-14 font-semibold text-base w-full rounded'
              type='button'
              onClick={() => {
                dispatchAction(setOpenDeleteDraftPlanModal(false))
              }}
            >
              Cancel
            </button>
            <AntdButton
              className='bg-red text-white h-14 font-semibold text-base w-full hover:!bg-red'
              text='Delete'
              onClick={handleConfirmDeleteDraft}
            />
          </div>
        </div>
      </ModalLayout>
    </div>
  )
}

export default DeleteDraftConfirmationModal
