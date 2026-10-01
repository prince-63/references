import {useContext} from 'react'
import {Modal} from 'antd'
import {Formik} from 'formik'
import * as Yup from 'yup'
import AntdButton from 'components/atom/Buttons/AntdButton'
import FormikInputTextArea from 'components/atom/Inputs/FormikInputTextArea'
import SuccessToast from 'components/modal/Alert/SuccessToast'
import ErrorToast from 'components/modal/Alert/ErrorToast'
import useDispatchAction from '@hooks/useDispatchAction'
import {AuthContext} from 'context/AuthContext'
import {safeParseInt} from 'utils/ConstFunctions'
import {addDoctorComment, moveTaskCard} from 'redux/Slices/AppSlice/Kanban/Kanban.slice'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'

export type NeedMoreInfoModalContext = {
  taskId: number
  patientId: number
  workflowId: number
  workflowName?: string | null
  previousStatusId?: number | null
  nextStatusId: number
  label?: string | null
}

type MoveToNeedMoreInfoModalProps = {
  open: boolean
  context: NeedMoreInfoModalContext | null
  onClose: () => void
  onSubmitted?: (context?: NeedMoreInfoModalContext) => void
}

const needMoreInfoSchema = Yup.object().shape({
  remarks: Yup.string().trim().required('Comment is required'),
})

const MoveToNeedMoreInfoModal = ({
  open,
  context,
  onClose,
  onSubmitted,
}: MoveToNeedMoreInfoModalProps) => {
  const {userId, profileId} = useContext(AuthContext)
  const {dispatchAction} = useDispatchAction()
  const {serviceConfig} = useSelector((state: RootState) => state.serviceConfiguration)

  const handleCancel = () => {
    onClose()
  }

  return (
    <Formik
      enableReinitialize
      initialValues={{remarks: ''}}
      validationSchema={needMoreInfoSchema}
      onSubmit={async (values, {resetForm, setSubmitting}) => {
        if (!context) {
          setSubmitting(false)
          return
        }
        const trimmedRemark = values.remarks.trim()
        if (!trimmedRemark) {
          setSubmitting(false)
          return
        }

        try {
          await dispatchAction(
            addDoctorComment({
              doctor_id: safeParseInt(userId),
              profile_id: profileId,
              notes: trimmedRemark,
              patient_id: safeParseInt(context.patientId),
              remark: trimmedRemark,
              task_id: safeParseInt(context.taskId),
            } as any)
          ).unwrap()

          await dispatchAction(
            moveTaskCard({
              task_id: safeParseInt(context.taskId),
              doctor_id: safeParseInt(userId),
              workflow_status_id: safeParseInt(context.nextStatusId),
              patient_id: safeParseInt(context.patientId),
              workflow_id: safeParseInt(context.workflowId),
              is_vsp_task_moving: serviceConfig?.VSP_PLANNING ? true : false,
            })
          ).unwrap()

          onSubmitted?.(context)
          SuccessToast('Comment added successfully')
          resetForm()
          onClose()
        } catch (error: any) {
          const errorMessage =
            error?.message ||
            error?.response?.data?.message ||
            'Failed to submit Need Information request.'
          ErrorToast(errorMessage)
        } finally {
          setSubmitting(false)
        }
      }}
    >
      {(formik) => {
        const handleSubmitClick = async () => {
          const errors = await formik.validateForm()
          formik.setTouched({remarks: true})
          if (!Object.keys(errors).length && formik.values.remarks.trim()) {
            formik.handleSubmit()
          }
        }

        return (
          <Modal
            destroyOnClose
            centered
            maskClosable={false}
            open={open}
            closable={false}
            width={566}
            footer={
              <div className='flex gap-2 md:px-5 md:pb-5 md:pt-3'>
                <button
                  type='button'
                  className='w-full text-primaryColor border border-primaryColor bg-primarySupport py-3 px-6 rounded-lg font-semibold'
                  onClick={() => {
                    formik.resetForm()
                    handleCancel()
                  }}
                >
                  Cancel
                </button>
                <AntdButton
                  className='w-full text-white !bg-primaryColor h-12 rounded-lg'
                  isLoading={formik.isSubmitting}
                  disabled={formik.isSubmitting}
                  text='Submit'
                  htmlType='button'
                  onClick={handleSubmitClick}
                />
              </div>
            }
          >
            <div className='flex flex-col gap-5 md:pt-5 md:px-5 '>
              <div>
                <div className='md:text-2xl text-xl font-semibold'>
                  {`${context?.label ?? 'Need Information'}?`}
                </div>
                <div className='text-gray-500 mt-2'>
                  Add details explaining why this case needs additional information before
                  proceeding. You can also assign it to a user for follow-up.
                </div>
              </div>

              <div className='flex flex-col gap-4'>
                <FormikInputTextArea
                  name='remarks'
                  label='Comment'
                  placeholder='Share details on why this case needs more information.'
                  rows={5}
                />
              </div>
            </div>
          </Modal>
        )
      }}
    </Formik>
  )
}

export default MoveToNeedMoreInfoModal
