import {useFormik} from 'formik'
import CommentComponent from './CommentComponent'
import AntdButton from 'components/atom/Buttons/AntdButton'
import InputTextArea from 'components/atom/Inputs/InputTextArea'
import clsx from 'clsx'
import {IAlignerUpdateDetails, IComment} from 'screens/Patients/LeadsProfile/leadsProfile.types'
import apiHelper from '@utils/apiHelper'
import HttpMethod from '@constants/httpMethods.constants'
import {URL_SEND_COMMENT} from 'redux/Endpoints/apiEndpoints'
import userTypes from '@constants/userTypes'
import {useContext} from 'react'
import {AuthContext} from 'context/AuthContext'
import useDispatchAction from '@hooks/useDispatchAction'
import {getAlignerUpdateDetails} from 'redux/Slices/AppSlice/LeadsProfile/AlignerTracking.slice'
import {Tooltip} from 'antd'
import hasValue from 'utils/hasValue'
import When from 'components/when/When'
import PatientProfileInitials from 'components/patientDetails/PatientProfileInitials'
import {Image} from 'assets/images/Images/Image'
import useActiveProfile from '@hooks/useActiveProfile'
import {getImageUrlById} from 'utils/ConstFunctions'

const Comments = ({
  comments,
  alignerActionId,
  isAccessibleActionButton,
  alignerUpdateDetails,
}: {
  comments: IComment[]
  alignerActionId: number
  isAccessibleActionButton: boolean
  alignerUpdateDetails: IAlignerUpdateDetails
}) => {
  const {userId} = useContext(AuthContext)
  const {dispatchAction} = useDispatchAction()

  const formik = useFormik({
    initialValues: {
      comment: '',
    },
    onSubmit: async (values) => {
      formik.setSubmitting(true)
      await apiHelper(URL_SEND_COMMENT, HttpMethod.POST, {
        user_type: userTypes.DOCTOR,
        user_id: userId,
        aligner_action_id: alignerActionId,
        comment: values.comment,
        reply_to_comment: 0,
      }).then(async () => {
        await dispatchAction(
          getAlignerUpdateDetails({
            aligner_action_id: alignerActionId,
          })
        )
          .unwrap()
          .then(() => {
            formik.resetForm()
            formik.setSubmitting(false)
          })
      })
    },
  })
  const {activeProfile} = useActiveProfile()
  return (
    <div className=''>
      <div className=' text-textColor text-sm font-medium '>Comments</div>
      {hasValue(comments) && (
        <div className='flex flex-col gap-4 mt-2'>
          {comments.map((comment) => (
            <CommentComponent key={comment.aligner_feedback_id} {...{comment}} />
          ))}
        </div>
      )}
      <When isTrue={isAccessibleActionButton}>
        <When isTrue={!alignerUpdateDetails.validated}>
          <div className='flex gap-3 items-start'>
            {(activeProfile?.profile_picture !== null &&
              activeProfile?.profile_picture !== 'N/A') ||
            activeProfile?.profile_picture_id ? (
              <Image
                className='min-w-8 h-8 object-cover rounded-full'
                src={
                  activeProfile?.profile_picture_id
                    ? getImageUrlById(activeProfile?.profile_picture_id)
                    : (activeProfile?.profile_picture ?? '')
                }
              />
            ) : (
              <PatientProfileInitials
                {...{
                  name: activeProfile?.first_name ?? '',
                  className: 'w-8 h-8 border border-mediumGray bg-lightGray',
                }}
              />
            )}
            <form onSubmit={formik.handleSubmit} className='flex flex-col mt-2 w-full'>
              <InputTextArea
                className='border border-mediumGray rounded-[4px] p-2 card-wrapper'
                placeholder='Your comment'
                name='comment'
                formik={formik}
                maxLength={500}
              />
              <div className='flex flex-col gap-2'>
                <div className='font-medium text-base flex gap-3 mt-3 md:justify-end justify-around'>
                  <button
                    className={clsx(
                      formik.values.comment.length > 0
                        ? 'text-textColor w-1/2 md:w-auto'
                        : 'text-grayDisabled w-1/2 md:w-auto'
                    )}
                    type='button'
                    disabled={formik.values.comment.length === 0}
                    onClick={() => {
                      formik.resetForm()
                    }}
                  >
                    Cancel
                  </button>
                  <Tooltip
                    title={formik.values.comment.length === 0 ? 'Please enter a comment' : null}
                    placement='topLeft'
                  >
                    <AntdButton
                      text='Send'
                      disabled={formik.values.comment.length === 0}
                      className={clsx(
                        formik.values.comment.length > 0 &&
                          'h-12 md:h-9 text-base bg-primarySupport border border-primaryColor text-primaryColor hover:!bg-primarySupport hover:!text-primaryColor font-semibold',
                        formik.values.comment.length === 0 &&
                          'h-12 md:h-9 text-base  font-semibold text-grayDisabled  !bg-lightGray hover:!bg-lightGray cursor-default hover:!text-grayDisabled ',
                        'w-1/2 md:w-auto'
                      )}
                      onClick={() => {
                        formik.handleSubmit()
                      }}
                      isLoading={formik.isSubmitting}
                    />
                  </Tooltip>
                </div>
              </div>
            </form>
          </div>
        </When>
      </When>
    </div>
  )
}

export default Comments
