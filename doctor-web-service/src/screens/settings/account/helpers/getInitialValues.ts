import {IAccountDetails} from 'screens/settings/settings.types'

export default (data: IAccountDetails) => {
  return {
    firstName: data.first_name,
    lastName: data.last_name,
    mobileNumber: data.mobile_no ?? '',
    email: data.email?.toLocaleLowerCase(),
    displayName: data.display_name ?? null,
    profileImage: null,
    displayProfileImage: null,
    company_brand_name_profile: null,
    salutation: data.salutation,
    file_action_profile: 'NOT_UPDATE',
    file_action_display: 'NOT_UPDATE',
  }
}
