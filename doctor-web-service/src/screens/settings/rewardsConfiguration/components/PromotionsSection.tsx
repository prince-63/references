import {useState, useContext} from 'react'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import {AuthContext} from 'context/AuthContext'
import useDispatchAction from '@hooks/useDispatchAction'
import {safeParseInt} from 'utils/ConstFunctions'
import {
  createPromotion,
  deletePromotion,
  getPromotions,
} from 'redux/Slices/AppSlice/rewards/rewards.slice'
import ContainerWrapper from 'screens/settings/components/ContainerWrapper'
import {InputNumber, Input, Select, DatePicker} from 'antd'
import dayjs from 'dayjs'
import SuccessToast from 'components/modal/Alert/SuccessToast'
import ErrorToast from 'components/modal/Alert/ErrorToast'
import AntdButton from 'components/atom/Buttons/AntdButton'

const PROMOTION_TYPES = [
  {value: 'bonus_coins', label: 'Bonus Coins'},
  {value: 'discount_percentage', label: 'Discount %'},
  {value: 'patient_referral', label: 'Patient Referral'},
]

const PromotionsSection = () => {
  const {profileId} = useContext(AuthContext)
  const {dispatchAction} = useDispatchAction()
  const {promotions} = useSelector((state: RootState) => state.rewards)

  const [formData, setFormData] = useState({
    name: '',
    type: 'bonus_coins',
    bonus_value: 50,
    end_date: null as dayjs.Dayjs | null,
  })

  const handleLaunchPromotion = async () => {
    if (!formData.name.trim()) {
      ErrorToast('Please enter a promotion name')
      return
    }

    if (!formData.end_date) {
      ErrorToast('Please select an end date')
      return
    }

    if (!profileId) {
      ErrorToast('User not authenticated')
      return
    }

    const doctorId = safeParseInt(profileId)

    const payload = {
      promotion_name: formData.name,
      promotion_type: formData.type.toUpperCase(),
      value: formData.bonus_value,
      target_audience: 'ALL',
      profile_id: doctorId,
      start_date: dayjs().toISOString(),
      end_date: formData.end_date!.toISOString(),
    }

    try {
      await dispatchAction(createPromotion(payload))
        .unwrap()
        .then(() => {
          dispatchAction(getPromotions())
            .unwrap()
            .then(() => {
              SuccessToast('Promotion launched successfully!')
              setFormData({
                name: '',
                type: 'bonus_coins',
                bonus_value: 50,
                end_date: null,
              })
            })
        })

      // Reset form
    } catch (error) {
      ErrorToast('Failed to launch promotion')
    }
  }

  const handleDeletePromotion = async (promotionId: number) => {
    if (!profileId) return
    const doctorId = safeParseInt(profileId)
    try {
      await dispatchAction(deletePromotion({id: promotionId, doctor_id: doctorId}))
        .unwrap()
        .then(() => {
          dispatchAction(getPromotions())
            .unwrap()
            .then(() => {
              SuccessToast('Promotion ended successfully')
            })
        })
    } catch (error) {
      ErrorToast('Failed to end promotion')
    }
  }

  return (
    <div className='flex flex-col gap-6'>
      <ContainerWrapper title='Create Promotion' subTitle=''>
        <p className='text-gray-600 mb-6'>
          This promotion will automatically appear in Patient Rewards.
        </p>

        <div className='flex flex-col gap-4'>
          <div>
            <label className='block font-semibold mb-2'>Promotion Name</label>
            <Input
              placeholder='e.g., Holiday Bonus'
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className='w-full'
            />
          </div>

          <div>
            <label className='block font-semibold mb-2'>Type</label>
            <Select
              value={formData.type}
              onChange={(value) => setFormData({...formData, type: value})}
              options={PROMOTION_TYPES}
              className='w-full'
            />
          </div>

          <div>
            <label className='block font-semibold mb-2'>Bonus Coins / Discount %</label>
            <InputNumber
              min={0}
              maxLength={3}
              value={formData.bonus_value}
              onChange={(value) => setFormData({...formData, bonus_value: value || 0})}
              className='w-full'
            />
          </div>

          <div>
            <label className='block font-semibold mb-2'>End Date</label>
            <DatePicker
              className='w-full'
              value={formData.end_date}
              onChange={(date) => setFormData({...formData, end_date: date})}
              disabledDate={(current) => {
                return current && current < dayjs().endOf('day')
              }}
              placeholder='Select end date'
            />
          </div>

          <div className='mt-2'>
            <button
              onClick={handleLaunchPromotion}
              className='h-9 px-4 bg-primaryColor text-white rounded-md font-medium hover:bg-primaryColor/90 transition-colors'
            >
              Launch Promotion
            </button>
          </div>
        </div>
      </ContainerWrapper>

      {/* Active Promotions List */}
      <ContainerWrapper
        title='Active Promotions'
        subTitle='These promotions are appearing in Patient Rewards now'
      >
        {promotions.length > 0 ? (
          <div className='flex flex-col gap-4'>
            {promotions.map((promotion: any) => (
              <div
                key={promotion.id}
                className='bg-gray-50 rounded-lg p-6 border border-transparent'
              >
                <div className='ml-0'>
                  <h4 className='text-lg font-semibold text-black mb-2'>
                    {promotion.promotion_name}
                  </h4>
                  <p className='text-sm text-textColor mb-4'>
                    {promotion.promotion_description || 'No description provided.'}
                  </p>

                  <p className='text-sm text-textColor mb-4'>
                    Type: {promotion.promotion_type?.toLowerCase().replace('_', ' ')} • Value:{' '}
                    {promotion.value} • Target: {promotion.target_audience?.toLowerCase()}
                  </p>

                  <div className='flex items-center gap-3'>
                    <span
                      className={`px-3 py-1 ${promotion.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'} rounded-full text-sm font-medium`}
                    >
                      {promotion.status || 'Active'}
                    </span>
                    {promotion.end_date && (
                      <div className='text-sm text-textColor'>
                        Ends: {dayjs(promotion.end_date).format('MMM DD, YYYY')}
                      </div>
                    )}
                    <AntdButton
                      text={'End'}
                      className='ml-auto h-8 w-fit px-3 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700'
                      onClick={() => handleDeletePromotion(promotion.id)}
                      danger
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className='text-gray-500 italic'>No active promotions found.</p>
        )}
      </ContainerWrapper>
    </div>
  )
}

export default PromotionsSection
