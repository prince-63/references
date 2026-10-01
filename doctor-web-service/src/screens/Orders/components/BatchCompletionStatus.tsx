import useDispatchAction from '@hooks/useDispatchAction'
import {Modal} from 'antd'
import CaretRightIcon from 'assets/icons/CaretRightIcon'
import CheckMarkIcon from 'assets/icons/CheckMarkIcon'
import clsx from 'clsx'
import moment from 'moment'
import {useState} from 'react'
import {getManufacturingDetails} from 'redux/Slices/AppSlice/LeadsProfile/GettingStartedOverview/GettingStartedOverview.slice'
import ShippingDetailsContainer from 'screens/Patients/LeadsProfile/main/overview/components/ShippingDetailsContainer'
import {ManufacturingItem} from 'screens/Patients/LeadsProfile/main/overview/types/GettingStarted.types'
import getColorPalette from 'utils/getColorPalette'

const BatchCompletionStatus = ({manufacturing}: {manufacturing: ManufacturingItem}) => {
  const {dispatchAction} = useDispatchAction()
  const [openShippingDetailsModalOpen, setOpenShippingDetailsModalOpen] = useState(false)

  return (
    <div>
      <Modal
        closable={true}
        destroyOnClose={true}
        open={openShippingDetailsModalOpen}
        className={clsx('md:w-[566px] w-full')}
        maskClosable={false}
        width={566}
        footer={null}
        onCancel={() => {
          setOpenShippingDetailsModalOpen(false)
        }}
      >
        <div className='p-5'>
          <div className='text-2xl font-semibold mb-3'>Shipping details</div>
          <ShippingDetailsContainer shipping_detail={manufacturing} />
        </div>
      </Modal>
      {manufacturing?.started_on && (
        <BatchStatus
          text={`Manufacturing started on ${moment(manufacturing?.started_on).format(
            'DD-MMM-YYYY'
          )}.`}
        />
      )}

      {manufacturing?.completed_on && (
        <BatchStatus
          text={`Manufacturing completed on ${moment(manufacturing?.completed_on).format(
            'DD-MMM-YYYY'
          )}.`}
        />
      )}

      {(manufacturing?.status === 'SHIPPED' || manufacturing?.status === 'DELIVERED') &&
        manufacturing?.tentative_delivery_date && (
          <div className='flex items-center gap-2 '>
            <BatchStatus
              text={`Shipping details added on ${
                manufacturing?.shipping_added_on
                  ? moment(manufacturing?.shipping_added_on).format('DD-MMM-YYYY')
                  : '-'
              }.`}
            />
            <button
              type='button'
              className='text-primaryColor text-sm font-semibold flex gap-2 items-center'
              onClick={() => {
                dispatchAction(
                  getManufacturingDetails({
                    manufacturing_id: manufacturing?.manufacturing_batch_id,
                  })
                )
                setOpenShippingDetailsModalOpen(true)
              }}
            >
              View details <CaretRightIcon color={getColorPalette().primaryColor} />
            </button>
          </div>
        )}

      {manufacturing?.delivered_on && (
        <BatchStatus
          text={`Marked as received on ${moment(manufacturing?.delivered_on).format(
            'DD-MMM-YYYY'
          )}.`}
        />
      )}
    </div>
  )
}

export default BatchCompletionStatus

const BatchStatus = ({text}: {text: string}) => {
  return (
    <div className='flex items-center gap-2 '>
      <CheckMarkIcon width='16' height='16' color='#00b383 ' /> <div>{text}</div>
    </div>
  )
}
