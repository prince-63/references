import useAllUserPlan from '@hooks/useAllUserPlan'
import useDispatchAction from '@hooks/useDispatchAction'
import ClockClockwiseIcon from 'assets/icons/ClockClockwiseIcon'
import AntdButton from 'components/atom/Buttons/AntdButton'
import When from 'components/when/When'
import {
  setOpenCompleteManufacturingModal,
  setOpenConfirmMarkAsDeliveredModal,
  setOpenModalManufacturing,
  setOpenShippingDetailsModal,
} from 'redux/Slices/AppSlice/LeadsProfile/GettingStartedOverview/GettingStartedOverview.slice'
import {useManufacturingDetails} from 'screens/Patients/LeadsProfile/main/overview/hooks/useManufacturingDetails'
import {ManufacturingStatus} from 'screens/Patients/LeadsProfile/main/overview/types/GettingStarted.types'

const GetActionButton = ({
  status,
  isLastTreatmentDeactivated,
}: {
  status: ManufacturingStatus
  isLastTreatmentDeactivated: boolean
}) => {
  const {isAlignerCompanyOrg} = useAllUserPlan()
  const {dispatchAction} = useDispatchAction()
  const {latest_manufacturing_data} = useManufacturingDetails({})

  return (
    <div className='w-full flex justify-center'>
      <When
        isTrue={
          status === 'PENDING' ||
          status === null ||
          status === 'DELIVERED' ||
          !latest_manufacturing_data
        }
      >
        {isAlignerCompanyOrg ? (
          <GetAction
            isLastTreatmentDeactivated={isLastTreatmentDeactivated}
            text={'Start manufacturing'}
            onClick={() => {
              dispatchAction(setOpenModalManufacturing(true))
            }}
          />
        ) : (
          <GetWaitingAction text={'Ongoing'} />
        )}
      </When>

      <When isTrue={status === 'MANUFACTURING_STARTED'}>
        {isAlignerCompanyOrg ? (
          <GetAction
            isLastTreatmentDeactivated={isLastTreatmentDeactivated}
            text={'Complete manufacturing'}
            onClick={() => {
              dispatchAction(setOpenCompleteManufacturingModal(true))
            }}
          />
        ) : (
          <GetWaitingAction text={'Ongoing'} />
        )}
      </When>

      <When isTrue={status === 'COMPLETED'}>
        {isAlignerCompanyOrg ? (
          <GetAction
            isLastTreatmentDeactivated={isLastTreatmentDeactivated}
            text={'Add shipping details'}
            onClick={() => {
              dispatchAction(setOpenShippingDetailsModal(true))
            }}
          />
        ) : (
          <GetWaitingAction text={'Ongoing'} />
        )}
      </When>

      <When isTrue={status === 'SHIPPED'}>
        {isAlignerCompanyOrg ? (
          <GetWaitingAction text={'Awaiting confirmation'} />
        ) : (
          <GetAction
            isLastTreatmentDeactivated={isLastTreatmentDeactivated}
            text={'Mark as received'}
            onClick={() => {
              dispatchAction(setOpenConfirmMarkAsDeliveredModal(true))
            }}
          />
        )}
      </When>
    </div>
  )
}

export default GetActionButton

const GetAction = ({
  text,
  onClick,
  isLastTreatmentDeactivated,
}: {
  text: string
  onClick: () => void
  isLastTreatmentDeactivated: boolean
}) => {
  return (
    <AntdButton
      text={text}
      htmlType='button'
      disabled={isLastTreatmentDeactivated}
      className='w-full rounded-lg bg-primaryColor flex gap-2 items-center py-2 text-white  font-semibold justify-center h-10'
      onClick={onClick}
    />
  )
}

const GetWaitingAction = ({text}: {text: string}) => {
  return (
    <div className='flex gap-2 items-center text-textColor font-semibold py-2'>
      <ClockClockwiseIcon />
      <div>{text}</div>
    </div>
  )
}
