import userOrderDetails from '../hooks/userOrderDetails'
import {Formik} from 'formik'
import PatientProfileInitials from 'components/patientDetails/PatientProfileInitials'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import {Image} from 'assets/images/Images/Image'
import FormikInputTextArea from 'components/atom/Inputs/FormikInputTextArea'
import AntdButton from 'components/atom/Buttons/AntdButton'
import {Tooltip} from 'antd'
import cn from '@utils/cn'
import hasValue from 'utils/hasValue'
import TimeLineItem from './TimeLineItem'
import useDispatchAction from '@hooks/useDispatchAction'
import {addTimeLineComment} from 'redux/Slices/AppSlice/orders/orders.slice'
import {useContext} from 'react'
import {AuthContext} from 'context/AuthContext'
import {safeParseInt} from 'utils/ConstFunctions'
import orderStatusConstants from '@constants/orderStatus.constants'
import {useFeatureAccess} from '@hooks/useFeatureAccess'

const TimeLineContent = () => {
  const {order} = userOrderDetails()
  const timeLine = order?.comment_details
  const {account} = useSelector((state: RootState) => state.settings)
  const {userId} = useContext(AuthContext)
  const {dispatchAction} = useDispatchAction()
  const {permissionChecks} = useFeatureAccess()
  const isHasPermissionAddComment =
    permissionChecks?.practiceOrderManagement?.commentOnOrderPage?.isAddable ||
    permissionChecks?.practiceOrderManagement?.commentOnOrderPageSendToCustomerPractice
      ?.isAddable ||
    permissionChecks?.customerOrderManagement?.commentOnOrderPage?.isAddable
  return (
    <div className='flex flex-col my-3 gap-4'>
      {order?.status !== orderStatusConstants.CANCELLED && (
        <Formik
          initialValues={{
            comment: '',
          }}
          onSubmit={async (values, {resetForm}) => {
            if (!order?.order_id) return
            await dispatchAction(
              addTimeLineComment({
                notes: values.comment.trim(),
                order_id: order.order_id,
                doctor_id: safeParseInt(userId),
              })
            )
            resetForm()
          }}
        >
          {(formik) => {
            return (
              <div className=''>
                {' '}
                {isHasPermissionAddComment && (
                  <div className='flex gap-3'>
                    {account?.profile_picture ? (
                      <Image
                        className='w-8 h-8 rounded-[4px] object-cover cursor-pointer bg-transparent'
                        src={account?.profile_picture}
                        alt='profile photo'
                      />
                    ) : (
                      <PatientProfileInitials
                        {...{
                          name: account?.first_name ?? '',
                          className: 'w-8 h-8 ',
                        }}
                      />
                    )}

                    <div className='flex flex-col gap-2 w-full'>
                      <FormikInputTextArea
                        name={'comment'}
                        required
                        className='py-3 w-full'
                        maxLength={500}
                      />

                      <Tooltip
                        title={formik.values.comment.length === 0 ? 'Please enter a comment' : null}
                        placement='topLeft'
                      >
                        <AntdButton
                          text='Add comment'
                          disabled={formik.values.comment.trim().length === 0}
                          className={cn(
                            formik.values.comment.length > 0 &&
                              'h-12 md:h-9 text-base bg-primaryColor border border-primaryColor  hover:!bg-primaryColor hover:!text-white font-semibold text-white',
                            formik.values.comment.length === 0 &&
                              'h-12 md:h-9 text-base  font-semibold text-grayDisabled  !bg-lightGray hover:!bg-lightGray cursor-default hover:!text-grayDisabled ',
                            'w-fit'
                          )}
                          onClick={() => {
                            formik.handleSubmit()
                          }}
                          isLoading={formik.isSubmitting}
                        />
                      </Tooltip>
                    </div>
                  </div>
                )}
              </div>
            )
          }}
        </Formik>
      )}
      {hasValue(timeLine) && (
        <div className='flex flex-wrap flex-col gap-4'>
          {timeLine?.map((timeLine, index) => (
            <TimeLineItem key={index} {...{comment: timeLine}} />
          ))}
        </div>
      )}
    </div>
  )
}

export default TimeLineContent
