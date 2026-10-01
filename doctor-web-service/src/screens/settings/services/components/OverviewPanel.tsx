import React, {useMemo} from 'react'
import Page from 'components/page/Page'
import BorderedCard from 'components/BorderedCard/BorderedCard'
import {CheckOutlined} from '@ant-design/icons'
import {useSelector} from 'react-redux'
import {ServiceConfigurationItemName} from 'redux/Slices/AppSlice/ServiceConfiguration/ServiceConfiguration.slice'
import {RootState} from 'redux/store'
import useServiceConfigurationState from '../hooks/useServiceConfigurationState'

const OVERVIEW_SECTIONS: Array<{
  key: string
  itemName: ServiceConfigurationItemName
  title: string
  description: string
  unavailableMessage: string
  alwaysShowStatus?: boolean
  showStatusForEnterprise?: boolean
  keepDescriptionOnDisableForEnterprise?: boolean
}> = [
  {
    key: 'aligners',
    itemName: ServiceConfigurationItemName.ALIGNERS_PLANNING_MANUFACTURING,
    title: 'Aligners (Planning & Manufacturing)',
    description:
      'End-to-end aligner workflow including treatment planning, manufacturing, and patient tracking.',
    unavailableMessage:
      'End-to-end aligner workflow including treatment planning, manufacturing, and patient tracking.',
    alwaysShowStatus: true,
  },
  {
    key: 'planning',
    itemName: ServiceConfigurationItemName.PLANNING,
    title: 'Planning Only',
    description: 'Provide digital treatment planning services for clinics or partner labs.',
    unavailableMessage: 'Not available under your current plan.',
    showStatusForEnterprise: true,
    keepDescriptionOnDisableForEnterprise: true,
  },
  {
    key: 'manufacturing',
    itemName: ServiceConfigurationItemName.MANUFACTURING,
    title: 'Manufacturing Only',
    description:
      'Produce aligners for pre-planned cases received from clinics or external partners.',
    unavailableMessage: 'Not available under your current plan.',
    showStatusForEnterprise: true,
    keepDescriptionOnDisableForEnterprise: true,
  },
  {
    key: 'vsp_planning',
    itemName: ServiceConfigurationItemName.VSP_PLANNING,
    title: 'VSP Planning',
    description: 'Virtual surgical planning services for clinics and partner labs.',
    unavailableMessage: 'Not available under your current plan.',
    alwaysShowStatus: true,
  },
]

const OverviewPanel: React.FC = () => {
  const {sections, loading, isEnterprisePlanUser} = useServiceConfigurationState()
  const {serviceConfig} = useSelector((state: RootState) => state.serviceConfiguration)

  const sectionStateByName = useMemo(() => {
    return sections.reduce(
      (acc, section) => {
        acc[section.itemName] = section
        return acc
      },
      {} as Record<ServiceConfigurationItemName, (typeof sections)[number]>
    )
  }, [sections])

  const renderedSections = useMemo(() => {
    return OVERVIEW_SECTIONS.filter((definition) => {
      if (definition.itemName === ServiceConfigurationItemName.VSP_PLANNING) {
        return Boolean(serviceConfig?.VSP_PLANNING)
      }
      return true
    }).map((definition) => {
      const state = sectionStateByName[definition.itemName]
      const isAvailable = state?.isAvailable ?? false
      const isActive = state?.isActive ?? false
      const isEnabled = isActive

      const keepDescriptionOnDisable =
        definition.keepDescriptionOnDisableForEnterprise && isEnterprisePlanUser

      const descriptionText =
        isEnabled || keepDescriptionOnDisable
          ? definition.description
          : isAvailable
            ? definition.description
            : definition.unavailableMessage

      const showStatus =
        definition.alwaysShowStatus ||
        (definition.showStatusForEnterprise && isEnterprisePlanUser) ||
        false

      const statusText = isEnabled ? 'Enabled' : isAvailable ? 'Disabled' : 'Disabled'

      return {
        key: definition.key,
        title: definition.title,
        enabled: isEnabled,
        description: descriptionText,
        isAvailable,
        showStatus,
        statusText,
      }
    })
  }, [isEnterprisePlanUser, sectionStateByName, serviceConfig?.VSP_PLANNING])

  return (
    <Page loading={loading}>
      <BorderedCard cardClassName='bg-white p-4 md:p-6 border-2 border-lightGray rounded-lg'>
        <div className='space-y-4 md:space-y-6 font-custom text-sm text-textColor leading-relaxed'>
          <div>
            <p className='text-base md:text-lg font-semibold text-neutralBlack'>
              Service Configuration
            </p>
            <p className='mt-2 text-xs md:text-sm'>
              Your available services are managed automatically based on your current subscription.
            </p>
            <p className='text-xs md:text-sm'>
              Checkboxes indicate which services are active for your account.
            </p>
          </div>

          <div className='space-y-4 md:space-y-5'>
            {renderedSections.map((section) => {
              const isEnabled = section.enabled
              return (
                <div key={section.key} className='flex items-start gap-2 md:gap-3'>
                  <div
                    className={`mt-0.5 md:mt-1 flex h-4 w-4 md:h-5 md:w-5 flex-shrink-0 items-center justify-center rounded-sm border ${
                      isEnabled
                        ? 'border-primaryColor bg-primaryColor text-white'
                        : 'border-mediumGray bg-lightGray text-mediumGray'
                    }`}
                  >
                    {isEnabled && <CheckOutlined className='text-[8px] md:text-[10px]' />}
                  </div>
                  <div className='flex-1 min-w-0'>
                    <div className='font-semibold text-neutralBlack text-sm md:text-base'>
                      {section.title}
                    </div>
                    {section.description && (
                      <p className='mt-1 text-xs md:text-sm text-textColor break-words'>
                        {section.description}
                      </p>
                    )}
                    {section.showStatus && (
                      <p className='mt-1 text-xs md:text-sm text-textColor'>
                        <span className='font-semibold text-neutralBlack'>Status:</span>{' '}
                        <span
                          className={`font-semibold ${
                            isEnabled
                              ? 'text-tertiaryColor'
                              : section.isAvailable
                                ? 'text-red'
                                : 'text-red'
                          }`}
                        >
                          {section.statusText}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          <p className='text-xs md:text-sm'>
            <span className='font-semibold text-neutralBlack'>Note:</span> Service access is
            determined by your subscription plan. Please contact your administrator for upgrades or
            changes.
          </p>
        </div>
      </BorderedCard>
    </Page>
  )
}
export default OverviewPanel
