import {Modal} from 'antd'
import clsx from 'clsx'
import React from 'react'
import {AlignerDetails} from './AlignerDetails'
import useDispatchAction from '@hooks/useDispatchAction'
import {
  postCompleteManufacturing,
  setOpenCompleteManufacturingModal,
} from 'redux/Slices/AppSlice/LeadsProfile/GettingStartedOverview/GettingStartedOverview.slice'
import {useParams} from 'react-router-dom'
import moment from 'moment'
import {safeParseInt} from 'utils/ConstFunctions'
import manufacturingConstants from '@constants/manufacturing.constants'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import {useManufacturingDetails} from '../hooks/useManufacturingDetails'

const CompleteManufacturingModal = ({
  openModal,
  refreshData,
}: {
  refreshData: () => void
  openModal: boolean
}) => {
  const {patientId: id} = useParams()
  const {dispatchAction} = useDispatchAction()
  const {order} = useSelector((state: RootState) => state.orders)
  const patientId = order?.patient_details?.id ?? id
  const {latest_manufacturing_data} = useManufacturingDetails({})
  const callCompleteManufacturing = () => {
    if (!latest_manufacturing_data) return
    const payload = {
      patient_id: safeParseInt(patientId),
      completion_date: moment().format('YYYY-MM-DD'),
      status: manufacturingConstants.COMPLETED,
      manufacturing_id: latest_manufacturing_data?.manufacturing_batch_id,
    }
    dispatchAction(postCompleteManufacturing(payload))
      .unwrap()
      .then(() => {
        refreshData()
        dispatchAction(setOpenCompleteManufacturingModal(false))
      })
  }
  return (
    <Modal
      closable={false}
      destroyOnClose={true}
      open={openModal}
      className={clsx('md:w-[566px] w-full')}
      maskClosable={false}
      width={566}
      footer={
        <div className={clsx('flex gap-2 px-5 pb-5')}>
          <button
            className={clsx(
              'w-full text-primaryColor border border-primaryColor py-3 px-6 rounded-lg'
            )}
            type='button'
            onClick={() => {
              dispatchAction(setOpenCompleteManufacturingModal(false))
            }}
          >
            Cancel
          </button>
          <button
            className={clsx('w-full text-white bg-primaryColor py-3 px-6 rounded-lg')}
            type='submit'
            onClick={() => {
              callCompleteManufacturing()
            }}
          >
            Complete
          </button>
        </div>
      }
    >
      <div className='flex  flex-col gap-3 p-5'>
        <div>
          <div className={clsx('md:text-2xl text-xl font-semibold')}>
            Confirm and start treatment?
          </div>

          <div className={clsx('text-base text-textColor ')}>
            This action is irreversible. Are you sure you want to continue?
          </div>
        </div>
        <AlignerDetails isManufacturing={true} />
      </div>
    </Modal>
  )
}

export default CompleteManufacturingModal
