import {useSearchParams} from 'react-router-dom'
import {RowDataUserList} from 'screens/AccessControl/AccessControlList/types/accessControlList.types'

export default (invitation: RowDataUserList) => {
  const [searchParams] = useSearchParams()
  const isEdit = searchParams.get('edit') === 'true'
  const initialValue = isEdit
    ? {
        email: invitation.email ?? null,
        first_name: invitation.first_name ?? null,
        last_name: invitation.last_name ?? null,
        mobile_no: invitation.mobile_number ?? null,
        country_code: invitation.country_code ?? '+91',
        salutation: invitation.salutation ?? '',
        role: invitation?.sub_role_id ?? '',
        invitation_id: invitation.invitation_id ?? null,
      }
    : {
        email: null,
        first_name: null,
        last_name: null,
        mobile_no: null,
        country_code: null,
        salutation: 'Dr',
        role: '',
        invitation_id: null,
      }

  return initialValue
}
