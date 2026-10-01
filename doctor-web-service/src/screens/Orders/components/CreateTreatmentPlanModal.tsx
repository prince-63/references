import {Modal} from 'antd'
import AntdButton from 'components/atom/Buttons/AntdButton'
import {useContext, useEffect, useState} from 'react'
import FilterOptionSelectDropdown from 'screens/Practices/PracticeList/components/FilterOptionSelectDropdown'
import cn from '@utils/cn'
import useDispatchAction from '@hooks/useDispatchAction'
import {setTreatmentPlan} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileTreatmentPlan.slice'
import {useNavigate} from 'react-router-dom'
import {cloneOrder} from 'redux/Slices/AppSlice/orders/orders.slice'
import {AuthContext} from 'context/AuthContext'
import {safeParseInt} from 'utils/ConstFunctions'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import userOrderDetails from '../hooks/userOrderDetails'
import hasValue from 'utils/hasValue'

const options = [
  {
    label: 'Create purchase order',
    value: 'CREATE_PURCHASE_ORDER',
    subTitle: 'Clone order details to create a purchase order.',
  },
  {
    label: 'Create manually',
    value: 'CREATE_MANUALLY',
    subTitle: 'Create treatment plan manually.',
  },
]

const CreateTreatmentPlanModal = ({
  open,
  setOpen,
  patientId,
  orderId,
}: {
  open: boolean
  setOpen: (open: boolean) => void
  patientId?: number | string
  orderId?: string | null
}) => {
  const {dispatchAction} = useDispatchAction()
  const navigate = useNavigate()
  const {userId, profileId} = useContext(AuthContext)
  const {cloningOrder} = useSelector((state: RootState) => state.orders)
  const {order} = userOrderDetails()

  const isEnterpriseLabUser = order?.assigned_lab_user_id !== safeParseInt(profileId)
  const hasPurchaseOrderDetails = hasValue(order?.purchase_order_details)
  const hasAssignedLabUser = hasValue(order?.assigned_lab_user_id)

  const defaultOption =
    hasPurchaseOrderDetails || (hasAssignedLabUser && isEnterpriseLabUser)
      ? 'CREATE_MANUALLY'
      : 'CREATE_PURCHASE_ORDER'

  const [selectedOption, setSelectedOption] = useState(defaultOption)

  const isCreatePurchaseOrderDisabled = () =>
    hasPurchaseOrderDetails || (hasAssignedLabUser && isEnterpriseLabUser)

  useEffect(() => {
    setSelectedOption(defaultOption)
  }, [defaultOption])

  const handleSubmit = async () => {
    if (selectedOption === 'CREATE_MANUALLY') {
      dispatchAction(setTreatmentPlan({}))
      navigate(`/leads-profile/${patientId}/treatment/new/setupTreatmentPlan?order_id=${orderId}`)
    } else {
      const result = await dispatchAction(
        cloneOrder({
          customer_order_id: orderId ?? '',
          doctor_id: safeParseInt(userId),
        })
      ).unwrap()

      navigate(`/orders/create-order/${result.purchase_order_id}`, {
        replace: true,
        state: {isClone: true},
      })
    }
  }

  return (
    <Modal
      destroyOnClose
      style={{fontFamily: 'figtree'}}
      closable={false}
      open={open}
      title={<p className='font-semibold text-2xl'>Create treatment plan</p>}
      width={500}
      centered
      footer={
        <div className='flex justify-between gap-2'>
          <button
            className='w-full rounded-lg h-10 px-5 text-textColor border border-mediumGray justify-start'
            type='button'
            onClick={() => setOpen(false)}
          >
            Cancel
          </button>
          <AntdButton
            key='submit'
            text='Continue'
            htmlType='submit'
            loading={cloningOrder}
            className='h-10 w-full bg-primaryColor text-center'
            onClick={handleSubmit}
          />
        </div>
      }
    >
      <div className='flex flex-col gap-4'>
        {options.map((option) => {
          const isDisabled =
            option.value === 'CREATE_PURCHASE_ORDER' && isCreatePurchaseOrderDisabled()
          const isSelected = option.value === selectedOption

          return (
            <FilterOptionSelectDropdown
              key={option.value}
              value={option.value}
              label={option.label}
              isDisabledOption={isDisabled}
              subTitle={option.subTitle}
              onChange={(option) => setSelectedOption(option.value)}
              className={cn(
                'px-4 py-3 border border-mediumGray rounded-lg',
                isSelected && !isDisabled && 'border-primaryColor'
              )}
              checked={isSelected && !isDisabled}
              labelClassName='truncate font-medium text-lg text-black'
            />
          )
        })}
      </div>
    </Modal>
  )
}

export default CreateTreatmentPlanModal
