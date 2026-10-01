import {useContext, useEffect, useMemo, useRef, useState} from 'react'
import {useDispatch} from 'react-redux'
import {AuthContext} from 'context/AuthContext'
import useDispatchAction from '@hooks/useDispatchAction'
import {safeParseInt} from 'utils/ConstFunctions'
import useActiveProfile from '@hooks/useActiveProfile'
import useAllUserPlan from '@hooks/useAllUserPlan'
import {getCategoryList, setServices} from 'redux/Slices/UISlices/services.slice'
import type {OrgServicesState} from '../components/types'
import {sampleOrg} from '../helpers/constants'

export function useOrgServices() {
  const [org, setOrg] = useState<OrgServicesState>(() => ({...sampleOrg}))
  const {profileId} = useContext(AuthContext)
  const {dispatchAction} = useDispatchAction()
  const reduxDispatch = useDispatch()
  const {activeProfile} = useActiveProfile()
  const {isGrowthPlanUser, isEnterprisePlanUser} = useAllUserPlan()
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    const svc = (activeProfile && (activeProfile as any).services) || null
    if (!svc) return
    setOrg((prev) => ({...prev, services: {...prev.services, ...svc}}))

    const tick = () => {
      try {
        reduxDispatch(setServices(svc))
      } catch {}
    }
    const raf =
      window.requestAnimationFrame ||
      ((cb: FrameRequestCallback) => window.setTimeout(cb, 0) as unknown as number)

    rafRef.current = raf(tick as any)
    return () => {
      if (!rafRef.current) return
      try {
        'cancelAnimationFrame' in window
          ? window.cancelAnimationFrame(rafRef.current)
          : clearTimeout(rafRef.current)
      } finally {
        rafRef.current = null
      }
    }
  }, [activeProfile, reduxDispatch])

  useEffect(() => {
    const planMode = isEnterprisePlanUser ? 'enterprise' : isGrowthPlanUser ? 'growth' : 'none'
    if (planMode === 'none') return

    setOrg((prev) => {
      const current = prev.services
      const nextServices: OrgServicesState['services'] =
        planMode === 'enterprise'
          ? {
              ...current,
              in_house_aligners: true,
              outsourced_aligners: true,
              planning: true,
              manufacturing: true,
              outsource_planning: true,
              outsource_manufacturing: false,
              operations_in_house: true,
              operations_outsource: true,
              offer_planning: true,
              offer_manufacturing: false,
            }
          : {
              ...current,
              in_house_aligners: true,
              outsourced_aligners: true,
              planning: true,
              manufacturing: true,
              outsource_planning: false,
              outsource_manufacturing: false,
              operations_in_house: false,
              operations_outsource: false,
              offer_planning: false,
              offer_manufacturing: false,
            }

      try {
        reduxDispatch(setServices(nextServices))
      } catch {}

      return {...prev, services: nextServices}
    })
  }, [isEnterprisePlanUser, isGrowthPlanUser, reduxDispatch])

  useEffect(() => {
    dispatchAction(getCategoryList({profile_id: safeParseInt(profileId)}))
  }, [dispatchAction, profileId])

  return useMemo(
    () => ({org, setOrg, isGrowthPlanUser, isEnterprisePlanUser}),
    [org, isGrowthPlanUser, isEnterprisePlanUser]
  )
}

// 🔑 add default export too (so either import style works)
export default useOrgServices
