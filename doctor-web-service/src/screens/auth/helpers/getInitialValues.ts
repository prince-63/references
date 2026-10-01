import {InviteDetails} from '../inviteDetails.types'

export default (inviteDetails: InviteDetails) => {
  return {
    email: inviteDetails.email?.toLocaleLowerCase(),
    mobileNumber: inviteDetails.mobile_no ?? '',
    firstName: inviteDetails.first_name,
    salutation: inviteDetails.salutation,
    acceptTerms: false,
    password: '',
    lastName: inviteDetails.last_name ?? '',
  }
}
