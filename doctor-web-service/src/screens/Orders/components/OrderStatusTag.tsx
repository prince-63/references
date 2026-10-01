import orderStatusConstants from '@constants/orderStatus.constants'
import useDispatchAction from '@hooks/useDispatchAction'
import {Select} from 'antd'
import Tag from 'components/tags/Tag'
import {
  setIsShowCancelOrderModal,
  setIsShowNeedMoreInfoModal,
} from 'redux/Slices/AppSlice/orders/orders.slice'
import userOrderDetails from '../hooks/userOrderDetails'
import hasValue from 'utils/hasValue'
import useAllUserPlan from '@hooks/useAllUserPlan'
const {Option} = Select

const OrderStatusTag = ({
  status,
  className = '',
  isShowManufacturingStatus,
  isShowDropdown = true,
}: {
  status: string
  className?: string
  isShowManufacturingStatus: boolean
  isShowDropdown?: boolean
}) => {
  const {isAlignerCompanyOrg, isPractice, isDesignLabUser, isVendor} = useAllUserPlan()
  const {dispatchAction} = useDispatchAction()
  const {order} = userOrderDetails()
  const hasNotTreatmentPlan = !hasValue(order?.treatment_plan_responses)
  const isAllowToUseNeedMoreInfoAndCancel =
    ((!order?.is_purchase_order && isAlignerCompanyOrg) ||
      (!isAlignerCompanyOrg && isDesignLabUser) ||
      isVendor) &&
    hasNotTreatmentPlan
  const getStatusForOrg = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return 'DRAFT'
      case 'ORDERED':
        return 'ORDERED'
      case 'IN_PROGRESS':
        return 'PLAN IN PROGRESS'
      case 'IN_REVIEW':
        return 'PLAN IN REVIEW'
      case 'RE_PLAN':
        return 'RE-PLAN'
      case 'APPROVED':
        return 'PLAN APPROVED'
      case orderStatusConstants.STL_FILES_REQUESTED:
        return 'STL FILES REQUESTED'
      case orderStatusConstants.STL_FILES_UPLOADED:
        return 'STL FILES UPLOADED'
      case 'PENDING':
        return 'MANUFACTURING PENDING'
      case 'MANUFACTURING_PENDING':
        return 'MANUFACTURING PENDING'
      case 'MANUFACTURING_STARTED':
        return 'MANUFACTURING IN PROGRESS'
      case 'COMPLETED':
        return 'MANUFACTURING COMPLETED'
      case 'SHIPPED':
        return 'IN TRANSIT'
      case 'DELIVERED':
        return 'DELIVERED'
      case 'MANUFACTURING_COMPLETED':
        return 'COMPLETED'
      case 'NEED_MORE_INFO':
        return 'NEED MORE INFO'
      case 'CANCELLED':
        return 'CANCELLED'
      default:
        return status || '-'
    }
  }

  const getStatus = (status: string) => {
    switch (status) {
      case orderStatusConstants.DRAFT:
        return 'DRAFT'
      case orderStatusConstants.ORDERED:
        return 'ORDERED'
      case orderStatusConstants.IN_PROGRESS:
        return 'PLAN IN PROGRESS'
      case orderStatusConstants.IN_REVIEW:
        return 'PLAN IN REVIEW'
      case orderStatusConstants.RE_PLAN:
        return 'RE-PLAN'
      case orderStatusConstants.APPROVED:
        return 'PLAN APPROVED'
      case orderStatusConstants.COMPLETED:
        return 'COMPLETED'

      case orderStatusConstants.STL_FILES_REQUESTED:
        return 'STL FILES REQUESTED'
      case orderStatusConstants.STL_FILES_UPLOADED:
        return 'STL FILES UPLOADED'
      case 'NEED_MORE_INFO':
        return 'NEED MORE INFO'
      case 'CANCELLED':
        return 'CANCELLED'
      default:
        return status || '-'
    }
  }

  if (!status) {
    return (
      <Tag
        value='-'
        className={`w-fit text-xs font-semibold bg-gray-100 text-gray-500 ${className}`}
      />
    )
  }

  const displayStatus =
    (isPractice || isAlignerCompanyOrg) && isShowManufacturingStatus
      ? getStatusForOrg(status)
      : getStatus(status)

  const handleChange = (value: string) => {
    if (value === orderStatusConstants.NEED_MORE_INFO) {
      dispatchAction(setIsShowNeedMoreInfoModal(true))
    } else {
      dispatchAction(setIsShowCancelOrderModal(true))
    }
  }

  return (
    <div>
      {isAllowToUseNeedMoreInfoAndCancel &&
      (status === 'ORDERED' || status === 'IN_PROGRESS') &&
      isShowDropdown ? (
        <Select
          placeholder='Select status'
          className='w-full custom-select-dropdown'
          onChange={handleChange}
          value={getStatusForOrg(status)}
          dropdownClassName='custom-select-dropdown'
        >
          <Option
            className='text-xs font-semibold text-textColor hover:bg-secondaryColor'
            value={orderStatusConstants?.NEED_MORE_INFO}
          >
            NEED MORE INFO
          </Option>

          {isAllowToUseNeedMoreInfoAndCancel && (
            <Option
              className='text-xs font-semibold text-textColor hover:bg-secondaryColor'
              value={orderStatusConstants?.CANCELLED}
            >
              CANCELLED
            </Option>
          )}
        </Select>
      ) : (
        <Tag
          value={displayStatus}
          className={`md:w-fit md:!justify-center !justify-start text-xs font-semibold ${
            displayStatus === 'CANCELLED'
              ? 'text-red bg-redSupport'
              : 'text-secondaryColor bg-secondarySupport'
          } ${className}`}
        />
      )}
    </div>
  )
}

export default OrderStatusTag
