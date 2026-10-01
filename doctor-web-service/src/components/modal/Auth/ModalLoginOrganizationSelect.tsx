import React from 'react'
import Button from '../../atom/Buttons/Button'
import ButtonOutlined from '../../atom/Buttons/ButtonOutlined'

export interface LoginOrganizationProfile {
  organization_id: number
  profile_id?: number | null
  organization_name?: string | null
  profile_name?: string | null
  user_name?: string | null
  name?: string | null
  subscription_plan_name?: string | null
  is_subscription_plan_active?: boolean
}

interface Props {
  profiles: LoginOrganizationProfile[]
  selectedProfileId: number | null
  onSelect: (profileId: number) => void
  onContinue: () => void
  onClose: () => void
}

const ModalLoginOrganizationSelect: React.FC<Props> = ({
  profiles,
  selectedProfileId,
  onSelect,
  onContinue,
  onClose,
}) => {
  return (
    <div className='fixed left-0 top-0 z-[1055] h-full w-full flex justify-center items-center bg-black bg-opacity-40 p-4'>
      <div className='bg-white w-full max-w-2xl rounded-lg px-5 py-4 shadow-lg'>
        <div className='text-black text-2xl font-bold'>Choose organization</div>
        <p className='text-textColor text-base mt-2'>
          Multiple organizations are linked to this email. Select one to continue login.
        </p>

        <div className='mt-6 grid gap-3 max-h-[50vh] overflow-y-auto'>
          {[...profiles]
            .sort(
              (a, b) =>
                Number(b.is_subscription_plan_active ?? false) -
                Number(a.is_subscription_plan_active ?? false)
            )
            .map((profile) => {
              const currentProfileId = profile.profile_id ?? null
              const isSelected = selectedProfileId === currentProfileId
              return (
                <button
                  key={`${profile.organization_id}-${profile.profile_id ?? profile.profile_name ?? profile.name ?? ''}`}
                  type='button'
                  onClick={() => currentProfileId && onSelect(currentProfileId)}
                  className={`w-full rounded-xl border p-4 text-left transition ${
                    isSelected
                      ? 'border-primaryColor bg-primarySupport'
                      : 'border-mediumGray hover:border-primaryColor'
                  }`}
                >
                  <div className='flex items-start justify-between gap-4'>
                    <div>
                      <div className='text-base font-semibold text-black'>
                        {profile.organization_name || 'Organization'}
                      </div>
                      <div className='text-sm text-textColor mt-1'>
                        {profile.user_name || profile.name || '-'}
                      </div>
                      <div className='text-sm text-textColor mt-1'>
                        {profile.subscription_plan_name || '-'}
                      </div>
                      {profile.is_subscription_plan_active !== undefined && (
                        <div className='flex items-center gap-1.5 mt-1.5'>
                          <div
                            className={`h-2 w-2 rounded-full ${
                              profile.is_subscription_plan_active ? 'bg-green-500' : 'bg-red'
                            }`}
                          />
                          <span
                            className={`text-sm ${profile.is_subscription_plan_active ? 'text-green-600' : 'text-red-600'}`}
                          >
                            {profile.is_subscription_plan_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      )}
                    </div>
                    <div
                      className={`mt-1 h-5 w-5 rounded-full border ${
                        isSelected ? 'border-primaryColor bg-primaryColor' : 'border-mediumGray'
                      }`}
                    />
                  </div>
                </button>
              )
            })}
        </div>

        <div className='mt-8 flex gap-3'>
          <ButtonOutlined className='h-12' text='Go back' onClick={onClose} />
          <Button text='Continue' onClick={onContinue} isDisabled={!selectedProfileId} />
        </div>
      </div>
    </div>
  )
}

export default ModalLoginOrganizationSelect
