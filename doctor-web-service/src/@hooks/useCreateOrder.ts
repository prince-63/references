import {useCallback, useContext} from 'react'
import {useSelector} from 'react-redux'
import {AuthContext} from 'context/AuthContext'
import {RootState} from 'redux/store'
import {safeParseInt} from 'utils/ConstFunctions'
import useAllUserPlan from './useAllUserPlan'
import useDispatchAction from './useDispatchAction'
import {createOrderV2} from 'redux/Slices/AppSlice/orders/orders.slice'
import {Product} from 'screens/Kanban/screens/ProductionSetup/SelectTaskManufacturingType'
import ErrorToast from 'components/modal/Alert/ErrorToast'

type IdLike = string | number | null | undefined

type AssignedCustomer = {
  practice_profile_id?: IdLike
  practice_doctor_id?: IdLike
  practice_organization_id?: IdLike
  profile_id?: IdLike
  doctor_id?: IdLike
  organization_id?: IdLike
}

type HandleCreateOrderParams = {
  orderPayload: any
  product: Product | null
  assignedCustomer?: AssignedCustomer | null
}

const normalizeId = (value: IdLike) =>
  value === null || typeof value === 'undefined' ? undefined : safeParseInt(value)

const useCreateOrder = () => {
  const {profileId, userId, organizationId} = useContext(AuthContext)
  const {isEnterprisePlanUser} = useAllUserPlan()
  const {dispatchAction} = useDispatchAction()
  const {creatingOrder} = useSelector((state: RootState) => state.orders)

  const handleCreateOrder = useCallback(
    async ({orderPayload, product, assignedCustomer}: HandleCreateOrderParams) => {
      const senderFromCustomer = {
        profile_id:
          assignedCustomer?.practice_profile_id ??
          assignedCustomer?.profile_id ??
          assignedCustomer?.organization_id,
        doctor_id: assignedCustomer?.practice_doctor_id ?? assignedCustomer?.doctor_id,
        organization_id:
          assignedCustomer?.practice_organization_id ?? assignedCustomer?.organization_id,
      }

      const sender = isEnterprisePlanUser
        ? {
            profile_id: normalizeId(senderFromCustomer.profile_id) ?? normalizeId(profileId),
            doctor_id: normalizeId(senderFromCustomer.doctor_id) ?? normalizeId(userId),
            organization_id:
              normalizeId(senderFromCustomer.organization_id) ?? normalizeId(organizationId),
          }
        : {
            profile_id: normalizeId(profileId),
            doctor_id: normalizeId(userId),
            organization_id: normalizeId(organizationId),
          }

      const receiver = isEnterprisePlanUser
        ? {
            profile_id: normalizeId(product?.profile_id) ?? normalizeId(profileId),
            doctor_id: normalizeId(product?.doctor_id) ?? normalizeId(userId),
            organization_id: normalizeId(product?.organization_id) ?? normalizeId(organizationId),
          }
        : {
            profile_id: normalizeId(product?.profile_id),
            doctor_id: normalizeId(product?.doctor_id),
            organization_id: normalizeId(product?.organization_id),
          }

      const mergedPatientDetails = orderPayload?.patient_details
        ? {
            ...orderPayload.patient_details,
            sender_profile_id: sender.profile_id,
            sender_doctor_id: sender.doctor_id,
            sender_organization_id: sender.organization_id,
            receiver_profile_id: receiver.profile_id,
            receiver_doctor_id: receiver.doctor_id,
            receiver_organization_id: receiver.organization_id,
          }
        : undefined

      const payloadWithParties = {
        ...orderPayload,
        sender_profile_id: sender.profile_id,
        sender_doctor_id: sender.doctor_id,
        sender_organization_id: sender.organization_id,
        receiver_profile_id: receiver.profile_id,
        receiver_doctor_id: receiver.doctor_id,
        receiver_organization_id: receiver.organization_id,
        ...(mergedPatientDetails ? {patient_details: mergedPatientDetails} : {}),
      }

      try {
        return await dispatchAction(createOrderV2(payloadWithParties as any)).unwrap()
      } catch (error: any) {
        const errorCode = typeof error === 'string' ? error : error?.error_code
        if (errorCode === 'END000') {
          ErrorToast('You have exceeded your plan limit. Please upgrade to continue.')
        }
        throw error
      }
    },
    [dispatchAction, isEnterprisePlanUser, organizationId, profileId, userId]
  )

  return {
    handleCreateOrder,
    creatingOrder,
  }
}

export default useCreateOrder
