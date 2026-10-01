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

interface DailyRewardItem {
  id: number
  task_name: string
  coin_reward: number
  is_enabled: boolean
  description?: string
}

interface DailyRewardsSectionProps {
  dailyRewards: DailyRewardItem[]
}

const DailyRewardsSection: React.FC<DailyRewardsSectionProps> = ({dailyRewards}) => {
  const {profileId, organizationId} = useContext(AuthContext)
  const {dispatchAction} = useDispatchAction()
  const [localDailyRewards, setLocalDailyRewards] = useState<DailyRewardItem[]>(dailyRewards)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingReward, setEditingReward] = useState<DailyRewardItem | null>(null)
  const [editCoins, setEditCoins] = useState(0)

  // Sync local state with prop changes
  useEffect(() => {
    setLocalDailyRewards(dailyRewards)
  }, [dailyRewards])

  const openEditModal = (reward: DailyRewardItem) => {
    setEditingReward(reward)
    setEditCoins(reward.coin_reward)
    setIsModalOpen(true)
  }

  const handleSave = async () => {
    if (editingReward && profileId) {
      const doctorId = safeParseInt(profileId)
      const orgId = safeParseInt(organizationId)

      const payload = {
        id: editingReward.id,
        doctor_id: doctorId,
        organization_id: orgId,
        task_name: editingReward.task_name,
        description: editingReward.description || editingReward.task_name,
        coins: editCoins,
        is_enabled: editingReward.is_enabled,
      }

      try {
        await dispatchAction(updateDailyReward(payload))
          .unwrap()
          .then(() => {
            dispatchAction(getRewardTasks())
              .unwrap()
              .then(() => {
                SuccessToast('Daily reward updated successfully')
                setLocalDailyRewards((prev) =>
                  prev.map((reward) =>
                    reward.id === editingReward.id ? {...reward, coin_reward: editCoins} : reward
                  )
                )
              })
          })
      } catch (error) {
        ErrorToast('Failed to update daily reward')
      }
    }
    setIsModalOpen(false)
    setEditingReward(null)
  }

  const handleToggleEnabled = async (rewardId: number) => {
    if (!profileId) return

    const reward = localDailyRewards.find((r) => r.id === rewardId)
    if (!reward) return

    const newEnabledState = !reward.is_enabled
    const doctorId = safeParseInt(profileId)

    try {
      await dispatchAction(
        toggleTaskStatus({
          taskId: rewardId,
          doctor_id: doctorId,
          enabled: newEnabledState,
        })
      )
        .unwrap()
        .then(() => {
          dispatchAction(getRewardTasks())
            .unwrap()
            .then(() => {
              setLocalDailyRewards((prev) =>
                prev.map((r) => (r.id === rewardId ? {...r, is_enabled: newEnabledState} : r))
              )
            })
        })
    } catch (error) {
      ErrorToast(`Failed to ${newEnabledState ? 'enable' : 'disable'} task`)
    }
  }

  return (
    <ContainerWrapper title='Daily Rewards' subTitle=''>
      <div className='overflow-x-auto'>
        <table className='w-full border-collapse'>
          <thead>
            <tr className='bg-gray-50'>
              <th className='text-left p-3 border-b-2 border-mediumGray font-semibold'>Task</th>
              <th className='text-center p-3 border-b-2 border-mediumGray font-semibold w-36'>
                Enabled
              </th>
              <th className='text-center p-3 border-b-2 border-mediumGray font-semibold w-36'>
                Coin Value
              </th>
              <th className='text-center p-3 border-b-2 border-mediumGray font-semibold w-32'>
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {localDailyRewards.map((reward) => (
              <tr key={reward.id} className='hover:bg-gray-50 border-b border-gray-100 group'>
                <td className='p-3 font-semibold text-base text-textColor'>{reward.task_name}</td>
                <td className='p-3 text-center'>
                  <div className='flex justify-center'>
                    <Switch
                      checked={reward.is_enabled}
                      onChange={() => handleToggleEnabled(reward.id)}
                      className={reward.is_enabled ? '!bg-green-500' : '!bg-gray-300'}
                    />
                  </div>
                </td>
                <td className='p-3 text-center'>
                  <div className='flex justify-center'>
                    <InputNumber
                      min={0}
                      maxLength={3}
                      value={reward.coin_reward}
                      disabled
                      className='w-20 text-sm text-black font-bold !bg-white rounded-sm'
                    />
                  </div>
                </td>
                <td className='p-3 text-center'>
                  <div className='flex justify-center'>
                    <VisibleEditButton onClick={() => openEditModal(reward)} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal - Only coins can be edited */}
      <Modal
        title='Edit Daily Reward'
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
            <label className='block font-medium mb-2'>Task Name</label>
            <div className='p-2 bg-gray-100 rounded text-gray-700'>{editingReward?.task_name}</div>
          </div>
          <div>
            <label className='block font-medium mb-2'>Coin Value *</label>
            <InputNumber
              min={0}
              maxLength={3}
              value={editCoins}
              onChange={(value) => setEditCoins(value || 0)}
              className='w-full'
              prefix='🪙'
            />
          </div>
        </div>
      </Modal>
    </ContainerWrapper>
  )
}

export default DailyRewardsSection
