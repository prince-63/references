import {Formik} from 'formik'
import getInitialValues from '../helpers/getInitialValues'
import FormikInput from 'components/atom/Inputs/FormikInput'
import FormikSelectList from 'components/atom/Dropdown/FormikSelectList'
import {useContext, useEffect} from 'react'
import {safeParseInt} from 'utils/ConstFunctions'
import useDispatchAction from '@hooks/useDispatchAction'
import {AuthContext} from 'context/AuthContext'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import FormikDatePicker from 'components/atom/Inputs/FormikDatePicker'
import {Button, Modal} from 'antd'
import dayjs from 'dayjs'
import {
  AddMyTaskData,
  getMyTaskList,
  UpdateMyTaskData,
} from 'redux/Slices/AppSlice/Profile/Profile.slice'
import {useParams} from 'react-router-dom'
import {getRolesOptionList} from 'redux/Slices/AppSlice/accessControl/AccessControl.slice'
import {TaskCardTask} from './TaskCard'

const AddMyTask = ({
  task,
  openModal,
  setOpenModal,
}: {
  task: TaskCardTask | null
  openModal: boolean
  setOpenModal: React.Dispatch<React.SetStateAction<boolean>>
}) => {
  const {userId, profileId, userDetail, organizationId} = useContext(AuthContext)
  const {dispatchAction} = useDispatchAction()
  const {patientId} = useParams()
  const {planId} = useSelector((state: RootState) => state.accessControl)

  const refreshData = (formik: any) => {
    formik.setSubmitting(false)
    formik.resetForm()
    setOpenModal(false)
    dispatchAction(
      getMyTaskList({
        doctor_id: safeParseInt(userId),
        patient_id: safeParseInt(patientId),
        filter: 'PENDING',
        order: 'ASC',
        assignee_profile_id: safeParseInt(profileId),
        profile_id: safeParseInt(profileId),
        my_task_type: 'MY_TASK',
      })
    )
  }
  useEffect(() => {
    if (!planId) return
    dispatchAction(
      getRolesOptionList({
        plan_id: safeParseInt(planId),
        doctor_id: safeParseInt(userId),
      })
    )
  }, [planId])

  const handleSubmit = async (values: ReturnType<typeof getInitialValues>, formik: any) => {
    try {
      if (task) {
        dispatchAction(
          UpdateMyTaskData({
            my_task_id: safeParseInt(task.my_task_id),
            doctor_id: safeParseInt(userId),
            assignee_profile_id: safeParseInt(values.assign_id),
            patient_id: safeParseInt(patientId),
            title: values.title,
            description: values.description || null,
            due_date: values.due_date,
            status: values.status,
            priority: 'MEDIUM',
            profile_id: safeParseInt(profileId),
            organization_id: safeParseInt(organizationId),
            my_task_type: 'MY_TASK',
          })
        )
          .unwrap()
          .then(() => refreshData(formik))
      } else {
        dispatchAction(
          AddMyTaskData({
            doctor_id: safeParseInt(userId),
            assignee_profile_id: safeParseInt(values.assign_id),
            patient_id: safeParseInt(patientId),
            title: values.title,
            description: values.description || null,
            due_date: values.due_date,
            status: values.status as 'PENDING' | 'COMPLETED',
            priority: 'MEDIUM',
            my_task_type: 'MY_TASK',
          })
        )
          .unwrap()
          .then(() => refreshData(formik))
      }
    } catch (error) {
      throw error
    }
  }

  return (
    <Formik
      initialValues={getInitialValues(task)}
      onSubmit={handleSubmit}
      enableReinitialize={true}
      // validationSchema={addTaskSchema()}
    >
      {(formik) => {
        useEffect(() => {
          formik.setFieldValue('assign_id', profileId)
        }, [openModal])

        return (
          <Modal
            destroyOnClose
            style={{fontFamily: 'figtree'}}
            closable={true}
            open={openModal}
            title={'Add Task'}
            width={400}
            centered
            footer={null}
            onCancel={() => {
              formik.resetForm()
              setOpenModal(false)
            }}
          >
            {' '}
            <div className='flex flex-col gap-3'>
              <FormikInput
                name={'title'}
                label={'Title '}
                required={true}
                className='py-3'
                maxLength={100}
                placeholder='Enter Title'
              />
              <FormikInput
                name={'description'}
                label={'Description'}
                className='py-3'
                maxLength={100}
                placeholder='Add description'
              />
              <FormikDatePicker
                name='due_date'
                label='Due Date'
                className='py-3'
                minDate={dayjs().add(1, 'day')}
              />
              <FormikSelectList
                label='Assign To'
                name='assign_id'
                items={[{label: userDetail?.first_name ?? 'Asa', value: profileId}]}
                required={true}
                disabled={true}
                onChangeMapperFunc={String}
                className='!h-12 !rounded-sm'
                size='large'
                value={profileId}
                onChangeSuccess={(value) => {
                  formik.setFieldValue('assign_id', value?.value)
                }}
              />
              <FormikSelectList
                label='Status'
                name='status'
                items={[
                  {label: 'Pending', value: 'PENDING'},
                  {label: 'Completed', value: 'COMPLETED'},
                ]}
                required={true}
                disabled={true}
                onChangeMapperFunc={String}
                className='!h-12 !rounded-sm'
                size='large'
                onChangeSuccess={(value) => {
                  formik.setFieldValue('status', value?.value)
                }}
              />
              <div className='flex justify-end'>
                <Button type='primary' htmlType='submit' onClick={() => formik.handleSubmit()}>
                  Add Task
                </Button>
              </div>
            </div>
          </Modal>
        )
      }}
    </Formik>
  )
}

export default AddMyTask
