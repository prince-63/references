import React, {useContext, useState} from 'react'
import {Card, Row, Col, Space, Typography, Button, Popover} from 'antd'
// Local lightweight TaskShape to decouple from slice definition
export interface TaskCardTask {
  my_task_id: number
  patient_id?: number
  added_by_profile_id?: number
  title: string
  description?: string | null
  assignee_name?: string
  assignee_profile_id?: number
  due_date: string
  status: 'PENDING' | 'COMPLETED'
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
}
import useDispatchAction from '@hooks/useDispatchAction'
import {safeParseInt} from 'utils/ConstFunctions'
import {AuthContext} from 'context/AuthContext'
import {useParams} from 'react-router-dom'
import {
  DeleteMyTaskData,
  getMyTaskList,
  UpdateMyTaskData,
} from 'redux/Slices/AppSlice/Profile/Profile.slice'
import QuickActionsRow from 'screens/Patients/LeadsProfile/main/files/components/QuickActionsRow'
import DeleteIcon from 'assets/icons/DeleteIcon'
import PencilIcon from 'assets/icons/PencilIcon'
import ellipse from 'assets/icons/ellipse.svg'
import moment from 'moment'
import {useFeatureAccess} from '@hooks/useFeatureAccess'

const {Text, Paragraph, Title} = Typography

export const TaskCard: React.FC<{
  setTask: React.Dispatch<React.SetStateAction<TaskCardTask | null>>
  task: TaskCardTask
  setOpenModal: React.Dispatch<React.SetStateAction<boolean>>
}> = ({setTask, task, setOpenModal}) => {
  const {userId, profileId, organizationId} = useContext(AuthContext)
  const {patientId} = useParams()
  const {dispatchAction} = useDispatchAction()
  const [openPopover, setOpenPopover] = useState(false)
  const {permissionChecks} = useFeatureAccess()

  const permissionsAddTask =
    permissionChecks?.taskManagement?.allowCreatingAndManagingTasksOnPatientProfile
  const handleMarkAsCompleted = async (values: TaskCardTask) => {
    try {
      dispatchAction(
        UpdateMyTaskData({
          my_task_id: safeParseInt(values.my_task_id),
          doctor_id: safeParseInt(userId),
          assignee_profile_id: safeParseInt(values.assignee_profile_id),
          patient_id: safeParseInt(patientId),
          title: values.title,
          description: values.description || null,
          due_date: values.due_date,
          status: 'COMPLETED',
          priority: 'MEDIUM',
          profile_id: safeParseInt(profileId),
          organization_id: safeParseInt(organizationId),
          my_task_type: 'MY_TASK',
        })
      )
        .unwrap()
        .then(() => {
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
        })
    } catch (error) {
      throw error
    }
  }

  const handleDelete = (values: TaskCardTask) => {
    dispatchAction(DeleteMyTaskData({my_task_id: safeParseInt(values.my_task_id)}))
      .unwrap()
      .then(() => {
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
      })
  }

  return (
    <Card style={{marginBottom: 12}} bodyStyle={{padding: 16}}>
      <Row justify='space-between' align='middle'>
        <Col>
          <Title level={5} style={{margin: 0}}>
            {task.title}
          </Title>
          {task.description ? <Paragraph style={{margin: 0}}>{task.description}</Paragraph> : null}
          <Space size='small' style={{marginTop: 8}}>
            {task.due_date && (
              <Text type='secondary'>Due: {moment(task.due_date).format('DD-MMM-YYYY')}</Text>
            )}
            {task.due_date && <Text type='secondary'>•</Text>}
            <Text type='secondary'>Assignee: {task.assignee_name}</Text>
          </Space>
        </Col>
        <Col>
          {task?.status === 'PENDING' && (
            <Space direction='vertical' align='end'>
              <div className='flex flex-col gap-2 justify-end items-end'>
                <Popover
                  content={
                    <div className='flex flex-col w-40 gap-2 '>
                      {permissionsAddTask?.isDeletable && (
                        <QuickActionsRow
                          {...{
                            showDivider: true,
                            icon: DeleteIcon,
                            title: 'Delete',
                            onClickAction: () => {
                              handleDelete(task)
                            },
                          }}
                        />
                      )}
                      {permissionsAddTask?.isEditable && (
                        <QuickActionsRow
                          {...{
                            showDivider: false,
                            icon: PencilIcon,
                            title: 'Edit',
                            onClickAction: () => {
                              setTask(task)
                              setOpenModal(true)
                            },
                          }}
                        />
                      )}
                    </div>
                  }
                  getPopupContainer={(triggerNode) => triggerNode.parentElement as HTMLElement}
                  placement='bottomLeft'
                  trigger={['click']}
                  open={openPopover}
                  onOpenChange={(open) => {
                    setOpenPopover(open)
                  }}
                  className='transition ease-in-out duration-200'
                >
                  <img
                    src={ellipse}
                    alt=''
                    className='cursor-pointer w-5 mb-6'
                    onClick={(e) => e.stopPropagation()} // Stop event propagation here
                  />
                </Popover>
                <Button type='primary' onClick={() => handleMarkAsCompleted(task)}>
                  {'Mark as Complete'}
                </Button>
              </div>
            </Space>
          )}
        </Col>
      </Row>
    </Card>
  )
}

export default TaskCard
