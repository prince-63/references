// screens/PatientDetailsOverview.tsx/components/ChecklistWithProgress.tsx
import React, {useMemo} from 'react'
import {Checkbox} from 'antd'
import {Formik} from 'formik'
import {useDispatch, useSelector} from 'react-redux'
import {useParams} from 'react-router-dom'

import FormikInput from 'components/atom/Inputs/FormikInput'
import {SectionTitle} from 'screens/Kanban/screens/ProductionReview/ProductionSetupReview'
import {safeParseInt} from 'utils/ConstFunctions'
import {
  addProductionTaskLocal,
  toggleProductionTaskLocal,
  TaskShape,
} from 'redux/Slices/AppSlice/Profile/Profile.slice'

type Props = {
  patientId?: number
  readOnly?: boolean
}

const ChecklistWithProgress: React.FC<Props> = ({patientId: patientIdProp, readOnly}) => {
  const dispatch = useDispatch()
  const {patientId: pidFromRoute} = useParams()

  // Resolve patientId
  const patientId = useMemo(() => {
    if (typeof patientIdProp === 'number') return patientIdProp
    const parsed = safeParseInt(pidFromRoute)
    return parsed || 0
  }, [patientIdProp, pidFromRoute])

  // Select local list from redux
  const productionTaskList: TaskShape[] =
    useSelector(
      (state: any) => state.profile.productionChecklistLocalByPatient?.[patientId] ?? []
    ) || []

  const completed = productionTaskList.filter((i) => i.status === 'COMPLETED').length
  const total = productionTaskList.length
  const percent = total ? Math.round((completed / total) * 100) : 0

  const handleToggle = (item: TaskShape) => {
    if (readOnly) return
    dispatch(toggleProductionTaskLocal({patientId, my_task_id: item.my_task_id}))
  }

  const handleAdd = async (title: string) => {
    if (readOnly) return
    if (!title.trim() || !patientId) return
    dispatch(addProductionTaskLocal({patientId, title: title.trim()}))
  }

  return (
    <div className='w-full font-[figtree] px-2 md:px-4 py-4 md:py-6'>
      <Formik
        enableReinitialize
        initialValues={{item: ''}}
        onSubmit={async (values, {resetForm}) => {
          await handleAdd(values.item)
          resetForm()
        }}
      >
        {({handleSubmit}) => (
          <>
            <div className='mb-5'>
              <SectionTitle title={` Production Checklist (${completed}/${total} done)`} />
              <div className='h-[14px] w-full mt-4 rounded-full bg-[#EEF0F7] overflow-hidden'>
                <div
                  className='h-full rounded-full bg-gradient-to-r from-[#5B3FFF] to-[#725BFF] transition-all duration-300'
                  style={{width: `${percent}%`}}
                />
              </div>
            </div>

            <ul className='mb-4 max-h-[340px] overflow-y-auto pr-1'>
              {productionTaskList.length > 0 ? (
                productionTaskList.map((item) => {
                  const isCompleted = item.status === 'COMPLETED'
                  return (
                    <li
                      key={item.my_task_id}
                      className='flex items-start gap-3 py-2.5 border-b border-[#EFF1F5] last:border-none'
                    >
                      <Checkbox
                        checked={isCompleted}
                        onChange={() => handleToggle(item)}
                        disabled={readOnly}
                        className='!mt-1 [&_.ant-checkbox-inner]:!rounded-[4px]'
                      />
                      <div className='flex-1 flex justify-between items-center min-h-[24px]'>
                        <span
                          className={`text-[15px] leading-snug mt-1 ${
                            isCompleted ? 'text-[#636A80]' : 'text-[#2B303B]'
                          }`}
                        >
                          {item.title}
                        </span>
                        {isCompleted && (
                          <span className='text-xs font-medium text-[#636A80] ml-3 shrink-0'>
                            Completed
                          </span>
                        )}
                      </div>
                    </li>
                  )
                })
              ) : (
                <li className='text-[#98A0AF] text-sm py-2'>No tasks yet</li>
              )}
            </ul>

            {!readOnly && (
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
                  className='!rounded-[12px] !h-[50px] !border-[#D9DEE8] focus:!border-[#5B3FFF] placeholder:!text-[#98A0AF]'
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
          </>
        )}
      </Formik>
    </div>
  )
}

export default ChecklistWithProgress
