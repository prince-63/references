import React, {useContext, useEffect} from 'react'
import {Checkbox} from 'antd'
import {Formik} from 'formik'
import FormikInput from 'components/atom/Inputs/FormikInput'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import {AuthContext} from 'context/AuthContext'
import useDispatchAction from '@hooks/useDispatchAction'
import {
  AddMyTaskData,
  UpdateMyTaskData,
  getMyTaskList,
} from 'redux/Slices/AppSlice/Profile/Profile.slice'

type Props = {
  batchId: number
  patientId: number
}

const BatchChecklistWithProgress: React.FC<Props> = ({batchId, patientId}) => {
  const {dispatchAction} = useDispatchAction()
  const {userId, profileId} = useContext(AuthContext)

  const batchKey = `${patientId}:${batchId}`
  const productionTaskList = useSelector(
    (state: RootState) => state.profile.productionTaskListByBatch[batchKey]
  )

  useEffect(() => {
    if (!userId || !patientId || !batchId) return
    dispatchAction(
      getMyTaskList({
        doctor_id: Number(userId),
        patient_id: Number(patientId),
        filter: null,
        order: 'ASC',
        my_task_type: 'PRODUCTION_CHECK_LIST_BATCH',
        batch_id: Number(batchId),
      })
    )
  }, [dispatchAction, userId, patientId, batchId])

  const handleToggleStatus = async (item: any) => {
    if (!userId || !patientId) return
    await dispatchAction(
      UpdateMyTaskData({
        my_task_id: item.my_task_id,
        doctor_id: Number(userId),
        patient_id: Number(patientId),
        title: item.title,
        description: item.description,
        due_date: item.due_date,
        status: item.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED',
        priority: item.priority,
        profile_id: item.added_by_profile_id || Number(profileId),
        organization_id: item.organization_id || 0,
        my_task_type: 'PRODUCTION_CHECK_LIST_BATCH',
        batch_id: Number(batchId),
      })
    )
    dispatchAction(
      getMyTaskList({
        doctor_id: Number(userId),
        patient_id: Number(patientId),
        filter: null,
        order: 'ASC',
        my_task_type: 'PRODUCTION_CHECK_LIST_BATCH',
        batch_id: Number(batchId),
      })
    )
  }

  const completed = productionTaskList?.filter((i: any) => i.status === 'COMPLETED').length || 0
  const total = productionTaskList?.length || 0
  const percent = total ? Math.round((completed / total) * 100) : 0

  return (
    <div className='w-full font-[figtree] px-2 md:px-4 py-4 md:py-6'>
      <div className='mb-4'>
        <h3 className='text-[18px] font-semibold text-[#1C1F27] mb-2 tracking-tight'>
          Batch Checklist{' '}
          <span className='text-sm text-[#636A80]'>
            ({completed}/{total})
          </span>
        </h3>
        <div className='h-[10px] w-full rounded-full bg-[#EEF0F7] overflow-hidden'>
          <div
            className='h-full rounded-full bg-gradient-to-r from-[#5B3FFF] to-[#725BFF] transition-all duration-300'
            style={{width: `${percent}%`}}
          />
        </div>
      </div>

      <ul className='mb-4 max-h-[260px] overflow-y-auto pr-1'>
        {productionTaskList && productionTaskList.length > 0 ? (
          productionTaskList.map((item: any) => {
            const isCompleted = item.status === 'COMPLETED'
            return (
              <li
                key={item.my_task_id}
                className='flex items-start gap-3 py-2.5 border-b last:border-none'
              >
                <Checkbox checked={isCompleted} onChange={() => handleToggleStatus(item)} />
                <div className='flex-1 flex justify-between items-start min-h-[24px]'>
                  <span
                    className={`text-[14px] ${isCompleted ? 'text-[#636A80]' : 'text-[#2B303B]'}`}
                  >
                    {item.title}
                  </span>
                  {isCompleted && (
                    <span className='text-xs font-medium text-[#636A80] ml-3 shrink-0'>Done</span>
                  )}
                </div>
              </li>
            )
          })
        ) : (
          <li className='text-[#98A0AF] text-sm py-2'>No tasks yet</li>
        )}
      </ul>

      <Formik
        initialValues={{item: ''}}
        onSubmit={async (values, {resetForm}) => {
          if (values.item.trim() && userId && patientId) {
            await dispatchAction(
              AddMyTaskData({
                doctor_id: Number(userId),
                patient_id: Number(patientId),
                title: values.item.trim(),
                description: null,
                due_date: new Date().toISOString(),
                status: 'PENDING',
                priority: 'MEDIUM',
                my_task_type: 'PRODUCTION_CHECK_LIST_BATCH',
                batch_id: Number(batchId),
              })
            )
            resetForm()
            dispatchAction(
              getMyTaskList({
                doctor_id: Number(userId),
                patient_id: Number(patientId),
                filter: null,
                order: 'ASC',
                my_task_type: 'PRODUCTION_CHECK_LIST_BATCH',
                batch_id: Number(batchId),
              })
            )
          }
        }}
      >
        {({handleSubmit}) => (
          <form
            className='relative'
            onSubmit={(e) => {
              e.preventDefault()
              handleSubmit()
            }}
          >
            <FormikInput
              name='item'
              placeholder='+ Add checklist item (press Enter)'
              className='!rounded-[12px] !h-[46px] !border-[#D9DEE8] placeholder:!text-[#98A0AF]'
              autoComplete='off'
              onKeyDown={(e: any) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleSubmit()
                }
              }}
            />
          </form>
        )}
      </Formik>
    </div>
  )
}

export default BatchChecklistWithProgress
