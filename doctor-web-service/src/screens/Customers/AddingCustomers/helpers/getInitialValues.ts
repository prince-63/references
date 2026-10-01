import rolesConstants from '@constants/roles.constants'
import {useParams} from 'react-router-dom'
import {Invitation} from 'screens/Labs/LabList/types/labs.types'
import hasValue from 'utils/hasValue'

export default (invitation: Invitation) => {
  const {customerId} = useParams()
  const initialValue = hasValue(customerId)
    ? {
        email: invitation.email ?? null,
        first_name: invitation.first_name ?? null,
        last_name: invitation.last_name ?? null,
        mobile_no: invitation.mobile_no ?? null,
        country_code: invitation.country_code ?? null,
        salutation: invitation.salutation ?? '',
        doctor_role: rolesConstants.CONSULTING_ORTHODONTIST,
        invitation_id: invitation.invitation_id ?? null,
      }
    : {
        email: null,
        first_name: null,
        last_name: null,
        mobile_no: null,
        country_code: null,
        salutation: 'Dr',
        doctor_role: rolesConstants.CONSULTING_ORTHODONTIST,
        invitation_id: null,
      }
  return initialValue
}
