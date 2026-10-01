import {useCallback, useContext, useEffect, useMemo} from 'react'
import {useSelector} from 'react-redux'

import {AuthContext} from 'context/AuthContext'
import useAllUserPlan from '@hooks/useAllUserPlan'
import {safeParseInt} from 'utils/ConstFunctions'
import {RootState} from 'redux/store'
import useDispatchAction from '@hooks/useDispatchAction'
import {
  getServiceConfiguration,
  ServiceConfigurationItem,
  ServiceConfigurationItemName,
} from 'redux/Slices/AppSlice/ServiceConfiguration/ServiceConfiguration.slice'

export interface ServiceConfigurationSectionState {
  itemName: ServiceConfigurationItemName
  isActive: boolean
  isAvailable: boolean
  displayOrder: number | null
  rawItem: ServiceConfigurationItem | null
}

const SECTION_ORDER: ServiceConfigurationItemName[] = [
  ServiceConfigurationItemName.ALIGNERS_PLANNING_MANUFACTURING,
  ServiceConfigurationItemName.PLANNING,
  ServiceConfigurationItemName.MANUFACTURING,
  ServiceConfigurationItemName.VSP_PLANNING,
  ServiceConfigurationItemName.BRACES_ADD_ON,
  ServiceConfigurationItemName.PAYMENT_AND_BILLING,
]

const buildDefaultSectionState = (): Record<
  ServiceConfigurationItemName,
  ServiceConfigurationSectionState
> =>
  SECTION_ORDER.reduce(
    (acc, itemName) => {
      acc[itemName] = {
        itemName,
        isActive: false,
        isAvailable: false,
        displayOrder: null,
        rawItem: null,
      }
      return acc
    },
    {} as Record<ServiceConfigurationItemName, ServiceConfigurationSectionState>
  )

export const useServiceConfigurationState = () => {
  const {dispatchAction} = useDispatchAction()
  const {profileId} = useContext(AuthContext)
  const {isGrowthPlanUser, isEnterprisePlanUser} = useAllUserPlan()

  const {data, loading, error} = useSelector((state: RootState) => state.serviceConfiguration)

  const numericProfileId = useMemo(() => {
    const parsed = safeParseInt(profileId)
    return parsed > 0 ? parsed : null
  }, [profileId])

  const fetchServiceConfiguration = useCallback(() => {
    if (!numericProfileId) return
    dispatchAction(
      getServiceConfiguration({
        profileId: numericProfileId,
      })
    )
  }, [dispatchAction, numericProfileId])

  useEffect(() => {
    fetchServiceConfiguration()
  }, [fetchServiceConfiguration])

  const sections = useMemo(() => {
    const next = buildDefaultSectionState()

    const addItem = (item?: ServiceConfigurationItem | null) => {
      const itemName = item?.item_name
      if (!itemName || !(itemName in next)) return

      next[itemName] = {
        itemName,
        isActive: Boolean(item?.is_active),
        isAvailable: true,
        displayOrder: item?.display_order ?? null,
        rawItem: item ?? null,
      }
    }

    ;(data.enabled_items || []).forEach(addItem)
    ;(data.disabled_items || []).forEach(addItem)

    return SECTION_ORDER.map((itemName) => next[itemName])
  }, [data.disabled_items, data.enabled_items])

  return {
    loading,
    error,
    sections,
    isGrowthPlanUser,
    isEnterprisePlanUser,
    refetch: fetchServiceConfiguration,
  }
}

export default useServiceConfigurationState
