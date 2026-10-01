import useDispatchAction from '@hooks/useDispatchAction'
import {AuthContext} from 'context/AuthContext'
import React, {useState, useEffect, useContext} from 'react'
import {Formik, FormikHelpers} from 'formik'
import FormikInput from 'components/atom/Inputs/FormikInput'
import {useSelector} from 'react-redux'
import {
  addWorkflowStatus,
  changePositionWorkflowStatus,
  deleteWorkflowStatus,
  editWorkflowStatus,
  getWorkFlow,
  WorkflowStatus,
} from 'redux/Slices/AppSlice/workflow/workflow.slice'
import {RootState} from 'redux/store'
import {safeParseInt} from 'utils/ConstFunctions'
import {Input} from 'antd'
import * as Yup from 'yup'
import {DeleteWorkflowStatusModal} from './components/DeleteWorkflowStatusModal'
import {
  getServiceConfiguration,
  ServiceConfiguration,
} from 'redux/Slices/AppSlice/ServiceConfiguration/ServiceConfiguration.slice'
import ErrorToast from 'components/modal/Alert/ErrorToast'
import clsx from 'clsx'

const getWorkflow = (serviceConfig: ServiceConfiguration) => {
  if (serviceConfig?.ALIGNER_PLANNING_MANUFACTURING) {
    return 'ALIGNER_MANUFACTURING'
  } else if (serviceConfig?.PLANNING) {
    return 'PLANNING'
  } else if (serviceConfig?.MANUFACTURING) {
    return 'MANUFACTURING'
  } else {
    return 'ALIGNER_MANUFACTURING'
  }
}
/* ===================== COMPONENT ===================== */
const WorkflowPage: React.FC = () => {
  const {profileId} = useContext(AuthContext)
  const numeric_profile_id = safeParseInt(profileId)
  const {dispatchAction} = useDispatchAction()
  const {workFlowData} = useSelector((state: RootState) => state.workFlow)
  const [deleteModalVisible, setDeleteModalVisible] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [statusToDelete, setStatusToDelete] = useState<{id: number; name: string} | null>(null)
  const {serviceConfig} = useSelector((state: RootState) => state.serviceConfiguration)
  const service = getWorkflow(serviceConfig)

  useEffect(() => {
    getWorkFlowData()
  }, [service])

  useEffect(() => {
    if (!profileId) return
    dispatchAction(getServiceConfiguration({profileId: safeParseInt(profileId)}))
  }, [profileId])

  const getWorkFlowData = () => {
    dispatchAction(getWorkFlow({profile_id: safeParseInt(profileId), workflowConfig: service}))
  }

  /** Add custom status; Planning/Production/New Case use exact insert index; others unchanged */
  const addCustomStatus = ({
    subId,
    name,
    color,
    position,
    exactPosition,
  }: {
    subId: string
    name: string
    color: string
    position: number
    exactPosition: number | null
  }) => {
    dispatchAction(
      addWorkflowStatus({
        workflowId: safeParseInt(subId),
        name: name.toUpperCase(),
        color,
        position,
      })
    )
      .unwrap()
      .then((res: {id: number}) => {
        if (exactPosition === null) {
          ErrorToast('we can not have 2 Done state')
          return
        }
        moveStatus({status: res.id, position: exactPosition})
      })
      .catch(() => {})
  }

  const editCustomStatus = (statusId: number, data: {name: string; color: string}) => {
    dispatchAction(
      editWorkflowStatus({
        statusId: safeParseInt(statusId),
        name: data.name.toUpperCase(),
        color: data.color,
      })
    )
      .unwrap()
      .then(() => {
        getWorkFlowData()
      })
      .catch(() => {})
  }

  const moveStatusFromArrows = ({
    statusId,
    statusList,
    position,
  }: {
    statusId: number
    statusList: WorkflowStatus[]
    position: number
  }) => {
    if (checkMoveToThisPosition(statusList, position)) {
      dispatchAction(changePositionWorkflowStatus({statusId: safeParseInt(statusId), position}))
        .unwrap()
        .then(() => {
          getWorkFlowData()
        })
        .catch(() => {})
    } else {
      ErrorToast('You can not move to this position')
    }
  }

  const moveStatus = ({status, position}: {status: number; position: number}) => {
    dispatchAction(changePositionWorkflowStatus({statusId: safeParseInt(status), position}))
      .unwrap()
      .then(() => {
        getWorkFlowData()
      })
      .catch(() => {})
  }

  const deleteStatusFromSubWorkflow = async (statusId: number) => {
    setDeleteLoading(true)
    try {
      await dispatchAction(deleteWorkflowStatus({statusId, profileId: numeric_profile_id})).unwrap()
      getWorkFlowData()
    } finally {
      setDeleteLoading(false)
      setDeleteModalVisible(false)
      setStatusToDelete(null)
    }
  }

  const getExactPosition = (statusList: WorkflowStatus[]) => {
    const found = statusList.find(
      (item) =>
        (item.name === 'Packaged' && item.maps_to === 'IN_PROGRESS') || item.maps_to === 'DONE'
    )
    return found ? found.position : null
  }

  const checkMoveToThisPosition = (statusList: WorkflowStatus[], position: number): boolean => {
    const status: WorkflowStatus | undefined = statusList.find((s) => s.position === position)
    if (!status) return false

    return (
      !(['TODO', 'DONE', 'COMPLETED'].includes(status.maps_to) && status.name !== 'Packaged') &&
      !(['IN_PROGRESS'].includes(status.maps_to) && status.name === 'Packaged')
    )
  }

  return (
    <div className='px-4 sm:px-6'>
      <h2 className='text-2xl sm:text-3xl font-semibold'>Workflow Configuration</h2>
      <p className='text-gray-600 mt-2 text-sm sm:text-base'>
        Manage your cases through each stage of the operation. You can add custom in-progress stages
        and move cases freely between any stage to match your workflow.
      </p>

      {/* Sub-workflows */}
      <div className='mt-6 space-y-4'>
        <div className='flex flex-col gap-6'>
          {workFlowData &&
            workFlowData.map((sw) => {
              const sectionLabel = String(sw?.label ?? sw?.name ?? '').trim()

              return (
                <div key={sw.id} className='p-4 sm:p-6 border rounded bg-white w-full'>
                  <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3'>
                    <h3 className='font-semibold text-base sm:text-lg'>{sectionLabel}</h3>
                    <div className='flex items-center gap-3'>
                      <div className='text-sm text-gray-500'>{sw.statuses.length} statuses</div>
                    </div>
                  </div>

                  <div className='space-y-2'>
                    {sw.statuses.map((s) => (
                      <StatusRow
                        key={s.id}
                        status={s}
                        subId={sw.id}
                        onEdit={(data) => editCustomStatus(s.id, data)}
                        onMove={(position) =>
                          moveStatusFromArrows({statusId: s.id, statusList: sw.statuses, position})
                        }
                        onDelete={() => {
                          setStatusToDelete({id: s.id, name: s.label_name})
                          setDeleteModalVisible(true)
                        }}
                        showEdit={
                          sectionLabel !== 'Plans Outsourced' &&
                          sectionLabel !== 'Production Outsourced'
                        }
                      />
                    ))}

                    {sectionLabel !== 'Plans Outsourced' &&
                      sectionLabel !== 'Production Outsourced' && (
                        <div className='mt-2'>
                          <AddCustomStatusForm
                            onAdd={(name, color) =>
                              addCustomStatus({
                                subId: sw.id,
                                name,
                                color,
                                position: sw.statuses.length + 1,
                                exactPosition: getExactPosition(sw.statuses),
                              })
                            }
                          />
                        </div>
                      )}
                  </div>
                </div>
              )
            })}
        </div>
      </div>

      <DeleteWorkflowStatusModal
        workflowName={statusToDelete?.name || ''}
        isModalVisible={deleteModalVisible}
        loading={deleteLoading}
        onClose={() => {
          setDeleteModalVisible(false)
          setStatusToDelete(null)
        }}
        onConfirm={() => {
          if (statusToDelete) deleteStatusFromSubWorkflow(statusToDelete.id)
        }}
      />
    </div>
  )
}

/* ===================== ROW + ADD FORM ===================== */

const StatusRow: React.FC<{
  status: WorkflowStatus
  subId: string
  onEdit: (data: {name: string; color: string}) => void
  onMove: (position: number) => void
  onDelete: () => void
  showEdit: boolean
}> = ({status, onEdit, onMove, onDelete, showEdit}) => {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(status.label_name)
  const [color, setColor] = useState(status.color || '#6b7280')

  useEffect(() => {
    setName(status.label_name)
    setColor(status.color || '#6b7280')
  }, [status])

  const EditSchema = Yup.object({
    name: Yup.string()
      .trim()
      .min(2, 'Minimum 2 characters')
      .max(24, 'Maximum 24 characters')
      .required('Name is required'),
    color: Yup.string()
      .matches(/^#([0-9A-F]{3}){1,2}$/i, 'Invalid color')
      .required('Color is required'),
  })

  if (editing) {
    return (
      <div className='p-2 border rounded'>
        <Formik
          initialValues={{name: name, color: color}}
          validationSchema={EditSchema}
          validateOnBlur
          validateOnChange
          onSubmit={async (
            values: {name: string; color: string},
            helpers: FormikHelpers<{name: string; color: string}>
          ) => {
            try {
              onEdit({name: values.name.trim().toUpperCase(), color: values.color})
              helpers.setSubmitting(false)
              setEditing(false)
            } catch {
              helpers.setSubmitting(false)
            }
          }}
        >
          {(formik) => (
            <form
              onSubmit={formik.handleSubmit}
              className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'
            >
              <div className='flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-2 w-full'>
                <div className='flex-1'>
                  <FormikInput
                    name='name'
                    placeholder='Name'
                    className='border p-2 rounded w-full'
                    value={formik.values.name?.toUpperCase()}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    maxLength={24}
                  />
                  {formik.touched.name && formik.errors.name ? (
                    <span className='text-xs text-red-600 mt-1'>{formik.errors.name}</span>
                  ) : null}
                </div>

                <div className='flex items-center gap-2'>
                  <Input
                    type='color'
                    value={formik.values.color}
                    onChange={(e) => formik.setFieldValue('color', e.target.value)}
                    className='w-10 h-9'
                    name='color'
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched.color && formik.errors.color ? (
                    <span className='text-xs text-red-600'>{formik.errors.color}</span>
                  ) : null}
                </div>
              </div>

              <div className='flex items-center gap-2'>
                <button
                  type='submit'
                  disabled={formik.isSubmitting || !formik.values.name || !!formik.errors.name}
                  className='px-3 py-2 bg-primaryColor text-white rounded disabled:opacity-60 text-sm'
                >
                  {formik.isSubmitting ? 'Saving...' : 'Save'}
                </button>
                <button
                  type='button'
                  onClick={() => {
                    formik.resetForm()
                    setEditing(false)
                    setName(status.label_name)
                    setColor(status.color || '#6b7280')
                  }}
                  className='px-3 py-2 border rounded text-sm'
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </Formik>
      </div>
    )
  }

  const displayLabel = (status.label_name || status.name || '').toUpperCase()

  return (
    <div className='p-2 border rounded flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'>
      <div className='flex items-start sm:items-center gap-3'>
        <div
          style={{
            width: 12,
            height: 12,
            borderRadius: 6,
            backgroundColor: status.color || '#6b7280',
            marginTop: 6,
          }}
        />
        <div>
          <div className='font-medium text-sm sm:text-base'>{displayLabel}</div>
          <div className='text-xs sm:text-sm text-gray-500'>
            Internal: <span className='font-medium'>{status.internal_name}</span>
          </div>
        </div>
      </div>
      <div className='flex flex-wrap gap-2'>
        {status.custom && (
          <>
            <button
              onClick={() => onMove(status.position - 1)}
              className='text-sm px-2 py-1 border rounded'
            >
              ↑
            </button>
            <button
              onClick={() => onMove(status.position + 1)}
              className={clsx('text-sm px-2 py-1 border rounded')}
            >
              ↓
            </button>
          </>
        )}
        {showEdit && (
          <button onClick={() => setEditing(true)} className='text-sm px-2 py-1 border rounded'>
            Edit
          </button>
        )}
        {status.custom && (
          <button onClick={onDelete} className='text-sm px-2 py-1 border rounded text-red-600'>
            Delete
          </button>
        )}
      </div>
    </div>
  )
}

const AddCustomStatusForm: React.FC<{
  onAdd: (name: string, color: string) => void
}> = ({onAdd}) => {
  const [open, setOpen] = useState(false)

  const AddStatusSchema = Yup.object({
    name: Yup.string()
      .trim()
      .min(2, 'Minimum 2 characters')
      .max(24, 'Maximum 24 characters')
      .required('Name is required'),
    color: Yup.string()
      .matches(/^#([0-9A-F]{3}){1,2}$/i, 'Invalid color')
      .required('Color is required'),
  })

  if (!open)
    return (
      <button onClick={() => setOpen(true)} className='text-sm text-primaryColor'>
        + Add status
      </button>
    )

  return (
    <div className='mt-2 p-2 border rounded'>
      <Formik
        initialValues={{name: '', color: '#3b82f6'}}
        validationSchema={AddStatusSchema}
        validateOnChange
        validateOnBlur
        onSubmit={(
          values: {name: string; color: string},
          helpers: FormikHelpers<{name: string; color: string}>
        ) => {
          if (values.name && values.name.trim()) {
            onAdd(values.name.trim().toUpperCase(), values.color)
            helpers.resetForm()
            setOpen(false)
          }
        }}
      >
        {(formik) => (
          <form
            onSubmit={formik.handleSubmit}
            className='flex flex-col sm:flex-row sm:items-center gap-3'
          >
            <div className='flex-1'>
              <FormikInput
                name='name'
                placeholder='Workflow status name'
                className='w-full sm:w-64 border p-2 rounded'
                value={formik.values.name?.toUpperCase()}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                maxLength={24}
              />
              {formik.touched.name && formik.errors.name && (
                <span className='text-xs text-red-600 mt-1'>{formik.errors.name}</span>
              )}
            </div>

            <div className='flex items-center gap-2'>
              <Input
                type='color'
                value={formik.values.color}
                onChange={(e) => formik.setFieldValue('color', e.target.value)}
                className='w-10 h-9'
                name='color'
                onBlur={formik.handleBlur}
              />
              {formik.touched.color && formik.errors.color && (
                <span className='text-xs text-red-600'>{formik.errors.color}</span>
              )}
            </div>

            <div className='flex items-center gap-2'>
              <button
                type='submit'
                disabled={formik.isSubmitting || !!formik.errors.name || !formik.values.name.trim()}
                className='px-3 py-2 bg-primaryColor text-white rounded disabled:opacity-60 text-sm'
              >
                Add
              </button>
              <button
                type='button'
                onClick={() => {
                  formik.resetForm()
                  setOpen(false)
                }}
                className='px-3 py-2 border rounded text-sm'
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </Formik>
    </div>
  )
}

export default WorkflowPage
