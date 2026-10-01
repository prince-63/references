import React, {useState, useEffect, useContext} from 'react'
import ContainerWrapper from 'screens/settings/components/ContainerWrapper'
import VisibleEditButton from 'components/atom/Buttons/VisibleEditButton'
import {Modal, Switch, InputNumber} from 'antd'
import {AuthContext} from 'context/AuthContext'
import useDispatchAction from '@hooks/useDispatchAction'
import {
  getRewardTasks,
  toggleTaskStatus,
  updateDailyReward,
} from 'redux/Slices/AppSlice/rewards/rewards.slice'
import {safeParseInt} from 'utils/ConstFunctions'
import SuccessToast from 'components/modal/Alert/SuccessToast'
import ErrorToast from 'components/modal/Alert/ErrorToast'

interface MilestoneItem {
  id: number
  task_name: string
  coin_reward: number
  is_enabled: boolean
  description?: string
}

interface MilestonesSectionProps {
  milestones: MilestoneItem[]
}

const MilestonesSection: React.FC<MilestonesSectionProps> = ({milestones}) => {
  const {userId, organizationId} = useContext(AuthContext)
  const {dispatchAction} = useDispatchAction()
  const [localMilestones, setLocalMilestones] = useState<MilestoneItem[]>(milestones)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingMilestone, setEditingMilestone] = useState<MilestoneItem | null>(null)
  const [editCoins, setEditCoins] = useState(0)

  // Sync local state with prop changes
  useEffect(() => {
    setLocalMilestones(milestones)
  }, [milestones])

  const openEditModal = (milestone: MilestoneItem) => {
    setEditingMilestone(milestone)
    setEditCoins(milestone.coin_reward)
    setIsModalOpen(true)
  }

  const handleSave = async () => {
    if (editingMilestone && userId) {
      const doctorId = safeParseInt(userId)
      const orgId = safeParseInt(organizationId)

      const payload = {
        id: editingMilestone.id,
        doctor_id: doctorId,
        organization_id: orgId,
        task_name: editingMilestone.task_name,
        description: editingMilestone.description || editingMilestone.task_name,
        coins: editCoins,
        is_enabled: editingMilestone.is_enabled,
      }

      try {
        await dispatchAction(updateDailyReward(payload))
          .unwrap()
          .then(() => {
            dispatchAction(getRewardTasks())
              .unwrap()
              .then(() => {
                SuccessToast('Milestone reward updated successfully')
                setLocalMilestones((prev) =>
                  prev.map((milestone) =>
                    milestone.id === editingMilestone.id
                      ? {...milestone, coin_reward: editCoins}
                      : milestone
                  )
                )
              })
          })
      } catch (error) {
        ErrorToast('Failed to update milestone reward')
      }
    }
    setIsModalOpen(false)
    setEditingMilestone(null)
  }

  const handleToggleEnabled = async (milestoneId: number) => {
    if (!userId) return

    const milestone = localMilestones.find((m) => m.id === milestoneId)
    if (!milestone) return

    const newEnabledState = !milestone.is_enabled
    const doctorId = safeParseInt(userId)

    try {
      await dispatchAction(
        toggleTaskStatus({
          taskId: milestoneId,
          doctor_id: doctorId,
          enabled: newEnabledState,
        })
      )
        .unwrap()
        .then(() => {
          dispatchAction(getRewardTasks())
            .unwrap()
            .then(() => {
              setLocalMilestones((prev) =>
                prev.map((m) => (m.id === milestoneId ? {...m, is_enabled: newEnabledState} : m))
              )
            })
        })
    } catch (error) {
      ErrorToast(`Failed to ${newEnabledState ? 'enable' : 'disable'} milestone`)
    }
  }

  return (
    <ContainerWrapper title='Milestone Rewards' subTitle=''>
      {/* Table */}
      <div className='overflow-x-auto'>
        <table className='w-full border-collapse'>
          <thead>
            <tr className='bg-gray-50'>
              <th className='text-left p-3 border-b-2 border-mediumGray font-semibold'>
                Milestone
              </th>
              <th className='text-center p-3 border-b-2 border-mediumGray font-semibold w-36'>
                Enabled
              </th>
              <th className='text-center p-3 border-b-2 border-mediumGray font-semibold w-36'>
                Coins
              </th>
              <th className='text-center p-3 border-b-2 border-mediumGray font-semibold w-32'>
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {localMilestones.map((milestone) => (
              <tr key={milestone.id} className='hover:bg-gray-50 border-b border-gray-100 group'>
                <td className='p-3 font-semibold text-base text-textColor'>
                  {milestone.task_name}
                </td>
                <td className='p-3 text-center'>
                  <div className='flex justify-center'>
                    <Switch
                      checked={milestone.is_enabled}
                      onChange={() => handleToggleEnabled(milestone.id)}
                      className={milestone.is_enabled ? '!bg-green-500' : '!bg-gray-300'}
                    />
                  </div>
                </td>
                <td className='p-3 text-center'>
                  <div className='flex justify-center'>
                    <InputNumber
                      min={0}
                      maxLength={3}
                      value={milestone.coin_reward}
                      disabled
                      className='w-20 text-sm text-black font-bold !bg-white rounded-sm'
                    />
                  </div>
                </td>
                <td className='p-3 text-center'>
                  <div className='flex justify-center'>
                    <VisibleEditButton onClick={() => openEditModal(milestone)} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal - Only coins can be edited */}
      <Modal
        title='Edit Milestone Reward'
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={
          <div className='flex justify-end gap-2'>
            <button
              onClick={() => setIsModalOpen(false)}
              className='px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50'
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className='px-4 py-2 bg-primaryColor text-white rounded-md hover:bg-primaryColor/90'
            >
              Save
            </button>
          </div>
        }
      >
        <div className='flex flex-col gap-4 py-4'>
          <div>
            <label className='block font-medium mb-2'>Milestone Name</label>
            <div className='p-2 bg-gray-100 rounded text-gray-700'>
              {editingMilestone?.task_name}
            </div>
          </div>
          <div>
            <label className='block font-medium mb-2'>Coins *</label>
            <InputNumber
              min={0}
              maxLength={3}
              value={editCoins}
              onChange={(value) => setEditCoins(value || 0)}
              className='w-full'
            />
          </div>
        </div>
      </Modal>
    </ContainerWrapper>
  )
}

export default MilestonesSection
