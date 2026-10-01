import {IAccountDetails, IBillingDetails} from 'screens/settings/settings.types'
import {getSalutations} from 'utils/ConstFunctions'

export default (billingData: IBillingDetails, accountData: IAccountDetails) => {
  const companyDisplayName = `${getSalutations(
    accountData?.salutation
  )} ${accountData?.first_name} ${accountData?.last_name}`.slice(0, 49)
  const company_brand_name = `${getSalutations(
    accountData?.salutation
  )} ${accountData?.first_name} ${accountData?.last_name}`.slice(0, 49)
  return {
    companyLegalName: billingData.company_legal_name ?? null,
    address1: billingData.address_line1 ?? null,
    address2: billingData.address_line2 ?? null,
    country: billingData.country ?? null,
    state: billingData.state ?? null,
    city: billingData.city ?? null,
    pincode: billingData.pincode ?? null,
    companyTaxId: billingData.company_tax_id ?? null,
    currency: billingData.currency ?? null,
    companyProfilePicture: null,
    company_brand_name_profile: null,
    companyDisplayName: billingData.company_display_name ?? companyDisplayName,
    file_action: 'NOT_UPDATE',
    file_brand_action: 'NOT_UPDATE',
    company_display_name: billingData.company_display_name,
    company_brand_name: billingData.company_brand_name ?? company_brand_name,
  }
}
