import useDispatchAction from '@hooks/useDispatchAction'
import {Modal} from 'antd'
import clsx from 'clsx'
import AntdButton from 'components/atom/Buttons/AntdButton'
import FormikInputTextArea from 'components/atom/Inputs/FormikInputTextArea'
import {Formik} from 'formik'
import {useDispatch, useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import {AuthContext} from 'context/AuthContext'
import {useContext, useEffect, useMemo} from 'react'
import {
  addDoctorComment,
  getPatientTaskTrackerFiltered,
  moveTaskCard,
  setIsOpenNeedMoreIfoModal,
} from 'redux/Slices/AppSlice/Kanban/Kanban.slice'
import {safeParseInt} from 'utils/ConstFunctions'
import SuccessToast from 'components/modal/Alert/SuccessToast'
import * as Yup from 'yup'
import {getActiveUsers, updateOrder} from 'redux/Slices/AppSlice/orders/orders.slice'
import type {
  WorkflowDefinition,
  WorkflowStatus,
} from 'redux/Slices/AppSlice/workflow/workflow.slice'
import orderStatusConstants from '@constants/orderStatus.constants'
import apiHelper from '@utils/apiHelper'
import HttpMethod from '@constants/httpMethods.constants'
import {BASE_APP_PATIENT_URL} from 'redux/Endpoints/apiEndpoints'
import {getVspPatientProfile} from 'redux/Slices/AppSlice/CustomerPatientProfile/CustomerPatientProfile.slice'

const MoveToNeedMoreInfoState = () => {
  const {userId, profileId, organizationId} = useContext(AuthContext)
  const {dispatchAction} = useDispatchAction()
  const {isOpenNeedMoreIfoModal, cardDetails, dynamicLabel, dynamicWorkflowStatusId} = useSelector(
    (state: RootState) => state.kanban
  )
  const {serviceConfig} = useSelector((state: RootState) => state.serviceConfiguration)

  const {newWorkFlowData} = useSelector((state: RootState) => state.workFlow)
  const statuses = useMemo<WorkflowStatus[]>(() => {
    const wf: WorkflowDefinition | null = Array.isArray(newWorkFlowData)
      ? (newWorkFlowData[0] ?? null)
      : (newWorkFlowData ?? null)
    return Array.isArray(wf?.statuses) ? wf.statuses : []
  }, [newWorkFlowData])

  const needInfoId = useMemo<number | null>(() => {
    const match = statuses.find((s: any) => {
      const name = String(s?.name ?? '').trim()

      return name === 'Need Information'
    })
    return match?.id ?? null
  }, [statuses])

  const dispatch = useDispatch()
  const isPlanningInHouse = cardDetails?.workflow_name === 'Planning In House'

  useEffect(() => {
    if (!isOpenNeedMoreIfoModal) return
    dispatchAction(
      getActiveUsers({
        data: {
          sort_order: 'PRACTICE_NAME_ASC',
          page_number: 0,
          page_size: 0,
          search: '',
          doctor_id: safeParseInt(userId),
          invitation_status: 'ACCEPTED',
          invitation_roles: ['LAB_STAFF', 'INTERNAL_USER'],
        },
      })
    )
  }, [isOpenNeedMoreIfoModal])

  const handleCloseModal = () => {
    dispatch(setIsOpenNeedMoreIfoModal(false))
    dispatchAction(
      getPatientTaskTrackerFiltered({
        doctor_id: safeParseInt(userId),
        order_type: 'ALIGNER',
        workflow_name: cardDetails.workflow_name,
        page_number: 0,
        page_size: 10,
         sort:'UPDATED_ON',
         "order": "DESC"
      })
    )
  }

  return (
    <Formik
      enableReinitialize={true}
      initialValues={{
        remarks: '',
      }}
      validationSchema={Yup.object().shape({
        remarks: Yup.string().trim().required('Comment is required'),
      })}
      onSubmit={(values, {resetForm}) => {
        if (!values.remarks || values.remarks.trim() === '') {
          return
        }
        dispatch(setIsOpenNeedMoreIfoModal(false))
        const payload = {
          doctor_id: userId,
          profile_id: profileId,
          notes: values.remarks,
          patient_id: cardDetails?.patient_id,
          remark: values.remarks,
          task_id: cardDetails?.id,
        }
        dispatchAction(addDoctorComment(payload as any))
          .unwrap()
          .then(() => {
            SuccessToast('Comment added successfully')
            const targetStatusId = needInfoId ?? safeParseInt(dynamicWorkflowStatusId)
            if (!targetStatusId) return
            return dispatchAction(
              moveTaskCard({
                task_id: safeParseInt(cardDetails?.id),
                doctor_id: safeParseInt(userId),
                workflow_status_id: targetStatusId,
                patient_id: safeParseInt(cardDetails?.patient_id),
                workflow_id: safeParseInt(cardDetails?.workflow_id),
                is_vsp_task_moving: serviceConfig?.VSP_PLANNING ? true : false,
              })
            ).unwrap()
          })
          .then(() => {
            if (serviceConfig?.VSP_PLANNING) {
              const payload = {
                patient_id: safeParseInt(cardDetails?.patient_id),
                doctor_id: safeParseInt(userId),
              }
              dispatchAction(getVspPatientProfile(payload))
                .unwrap()
                .then((res: {active_order_id?: string | null; orderList?: string[]}) => {
                  const urlUpdateOrder = `${BASE_APP_PATIENT_URL}/patient/v1/vsp/orders/${res.active_order_id}/status?status=${'NEED_MORE_INFO'}`
                  apiHelper(urlUpdateOrder, HttpMethod.PATCH, {
                    profile_id: safeParseInt(profileId),
                    organization_id: safeParseInt(organizationId),
                  })
                })
            }
            if (cardDetails.order_id) {
              dispatchAction(
                updateOrder({
                  order_id: cardDetails?.order_id,
                  status: orderStatusConstants.NEED_MORE_INFO,
                  doctor_id: safeParseInt(userId),
                })
              ).unwrap()
            }

            // Refresh board
            return dispatchAction(
              getPatientTaskTrackerFiltered({
                doctor_id: safeParseInt(userId),
                order_type: 'ALIGNER',
                workflow_name: cardDetails.workflow_name,
                page_number: 0,
                page_size: 10,
                 sort:'UPDATED_ON' ,
                 "order": "DESC"
              })
            )
          })
          .finally(() => {
            resetForm()
          })
      }}
    >
      {(formik) => {
        const handleSubmitClick = async () => {
          // Validate form before submission
          const errors = await formik.validateForm()
          formik.setTouched({
            remarks: true,
          })

          // Only submit if there are no errors and remarks is not empty
          if (Object.keys(errors).length === 0 && formik.values.remarks.trim()) {
            formik.handleSubmit()
          }
        }

        return (
          <Modal
            closable={false}
            destroyOnClose={true}
            centered={true}
            open={isOpenNeedMoreIfoModal}
            className={clsx('md:w-[566px] w-full')}
            maskClosable={false}
            width={566}
            footer={
              <div className={clsx('flex gap-2 md:px-5 md:pb-5 md:pt-3')}>
                <button
                  className={clsx(
                    'w-full text-primaryColor border border-primaryColor bg-primarySupport py-3 px-6 rounded-lg font-semibold'
                  )}
                  type='button'
                  onClick={() => {
                    formik?.resetForm()
                    handleCloseModal()
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
              <div className=''>
                <div className={clsx('md:text-2xl text-xl font-semibold')}>
                  {isPlanningInHouse ? `${dynamicLabel}?` : `Move case to ${dynamicLabel}?`}
                </div>
                <div className={clsx('text-gray-500 mt-2')}>
                  {isPlanningInHouse
                    ? 'Please provide a comment explaining what additional information is needed.'
                    : 'Add details explaining why this case needs additional information before proceeding. You can also assign it to a user for follow-up.'}
                </div>
              </div>

              <div className='flex flex-col gap-4'>
                <FormikInputTextArea
                  name='remarks'
                  label='Comment'
                  placeholder='Add your comment here...'
                  required={true}
                  maxLength={1000}
                  rows={4}
                />
              </div>
            </div>
          </Modal>
        )
      }}
    </Formik>
  )
}

export default MoveToNeedMoreInfoState
