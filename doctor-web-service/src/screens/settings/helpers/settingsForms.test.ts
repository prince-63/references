import {upgradeRenewalSchema} from '../subscription/upgradeRenewal.schema'
import {accountSchema} from '../account/account.schema'
import {billingSchema} from '../billing/billing.schema'
import getBillingInitialValues from '../billing/helpers/getInitialValuesBillingPage'
import getAccountInitialValues from '../account/helpers/getInitialValues'
import getSubscriptionInitialValues from '../subscription/helpers/getInitialValues'
import getServiceInitialValues from '../services/helpers/getInitialValues'
import {sampleOrg} from '../services/helpers/constants'
import addProductFormValidationSchema from '../services/helpers/addProductFormValidations'
import defaultCountyCode from '@constants/defaultCountyCode'
import {IAccountDetails, IBillingDetails} from '../settings.types'

const buildAccount = (overrides: Partial<IAccountDetails> = {}): IAccountDetails => ({
  first_name: 'John',
  last_name: 'Doe',
  mobile_no: '+911234567890',
  email: 'John.Doe@Example.com',
  country_code: '+91',
  display_name: 'JD',
  salutation: 'Dr',
  profile_id: 1,
  organization_id: 2,
  doctor_id: 3,
  profile_picture: null,
  display_picture: null,
  ...overrides,
})

const buildBilling = (overrides: Partial<IBillingDetails> = {}): IBillingDetails => ({
  billing_id: 1,
  doctor_id: 3,
  organization_id: 2,
  profile_id: 1,
  company_legal_name: 'Acme Inc',
  address_line1: '123 St',
  address_line2: 'Suite 100',
  country: 'USA',
  state: 'CA',
  city: 'LA',
  pincode: '90001',
  company_tax_id: 'TAX',
  currency: 'USD',
  file_action: 'KEEP',
  file_brand_action: 'KEEP',
  company_display_name: 'Dr John Doe',
  company_brand_name: 'Dr John Doe',
  ...overrides,
})

describe('upgradeRenewalSchema', () => {
  test.each(['', '1', '12345', '123456789'])(
    'rejects India mobile shorter than 10 digits: %s',
    async (mobile) => {
      await expect(
        upgradeRenewalSchema(defaultCountyCode.DEFAULT_COUNTRY_CODE_INDIA).validate({
          mobile,
          request_type: 'upgrade',
        })
      ).rejects.toThrow('Please enter a valid mobile number')
    }
  )

  test.each(['1234567890', '9876543210'])(
    'accepts India mobile with 10+ digits: %s',
    async (mobile) => {
      await expect(
        upgradeRenewalSchema(defaultCountyCode.DEFAULT_COUNTRY_CODE_INDIA).validate({
          mobile,
          request_type: 'renewal',
        })
      ).resolves.toMatchObject({mobile})
    }
  )

  test.each(['', '12345', '123456'])(
    'rejects non-India mobile shorter than 7 digits: %s',
    async (mobile) => {
      await expect(
        upgradeRenewalSchema('+1').validate({mobile, request_type: 'upgrade'})
      ).rejects.toThrow('Please enter a valid mobile number')
    }
  )

  test.each(['1234567', '7654321'])(
    'accepts non-India mobile with 7+ digits: %s',
    async (mobile) => {
      await expect(
        upgradeRenewalSchema('+1').validate({mobile, request_type: 'upgrade'})
      ).resolves.toMatchObject({mobile})
    }
  )

  it('requires request_type', async () => {
    await expect(
      upgradeRenewalSchema('+1').validate({mobile: '1234567' as string, request_type: ''})
    ).rejects.toThrow('Please select an option')
  })

  it('allows optional fields when provided', async () => {
    const payload = {
      mobile: '1234567',
      request_type: 'upgrade',
      new_plan_name: 'Gold',
      notes: 'Hello',
    }
    await expect(upgradeRenewalSchema('+1').validate(payload)).resolves.toMatchObject(payload)
  })

  it('rejects when mobile is missing', async () => {
    await expect(
      upgradeRenewalSchema('+1').validate({request_type: 'upgrade'} as any)
    ).rejects.toThrow('Please enter a valid mobile number')
  })
})

describe('accountSchema', () => {
  it('requires first name', async () => {
    await expect(
      accountSchema(defaultCountyCode.DEFAULT_COUNTRY_CODE_INDIA).validate({firstName: ''})
    ).rejects.toThrow('First name is required')
  })

  test.each(['1', '12345'])(
    'rejects India mobile shorter than 10 digits: %s',
    async (mobileNumber) => {
      await expect(
        accountSchema(defaultCountyCode.DEFAULT_COUNTRY_CODE_INDIA).validate({
          firstName: 'John',
          mobileNumber,
        })
      ).rejects.toThrow()
    }
  )

  it('accepts India mobile with 10 digits', async () => {
    await expect(
      accountSchema(defaultCountyCode.DEFAULT_COUNTRY_CODE_INDIA).validate({
        firstName: 'John',
        mobileNumber: '1234567890',
      })
    ).resolves.toMatchObject({mobileNumber: '1234567890'})
  })

  test.each(['1234', '123456'])(
    'rejects non-India mobile shorter than 7 digits: %s',
    async (mobileNumber) => {
      await expect(
        accountSchema('+1').validate({firstName: 'John', mobileNumber})
      ).rejects.toThrow()
    }
  )

  it('accepts non-India mobile with 7 digits', async () => {
    await expect(
      accountSchema('+1').validate({firstName: 'John', mobileNumber: '1234567'})
    ).resolves.toMatchObject({mobileNumber: '1234567'})
  })

  it('allows nullable optional fields', async () => {
    await expect(
      accountSchema('+1').validate({
        firstName: 'John',
        lastName: null,
        email: '',
        displayName: null,
      })
    ).resolves.toBeDefined()
  })
})

describe('billingSchema', () => {
  it('accepts all nullable fields', async () => {
    await expect(
      billingSchema().validate({
        companyLegalName: null,
        address1: null,
        address2: null,
        country: null,
        state: null,
        city: null,
        pincode: null,
        companyTaxId: null,
        currency: null,
        companyProfilePicture: null,
        companyDisplayName: null,
      })
    ).resolves.toBeDefined()
  })

  it('accepts string values for fields', async () => {
    await expect(
      billingSchema().validate({
        companyLegalName: 'A',
        address1: 'B',
        address2: 'C',
        country: 'D',
        state: 'E',
        city: 'F',
        pincode: 'G',
        companyTaxId: 'H',
        currency: 'I',
        companyProfilePicture: 'pic',
        companyDisplayName: 'name',
      })
    ).resolves.toMatchObject({companyTaxId: 'H'})
  })

  test.each([
    ['companyLegalName', 'Co'],
    ['address1', 'Addr1'],
    ['address2', 'Addr2'],
    ['country', 'Country'],
    ['state', 'State'],
    ['city', 'City'],
    ['pincode', '12345'],
    ['companyTaxId', 'TIN'],
    ['currency', 'USD'],
  ])('passes validation when %s is provided', async (key, value) => {
    await expect(
      billingSchema().validate({[key]: value} as Record<string, string>)
    ).resolves.toBeDefined()
  })
})

describe('billing initial values', () => {
  it('uses provided billing display name when present', () => {
    const result = getBillingInitialValues(buildBilling(), buildAccount())
    expect(result.companyDisplayName).toBe('Dr John Doe')
    expect(result.company_brand_name).toBe('Dr John Doe')
  })

  it('falls back to computed display name when missing', () => {
    const billing = buildBilling({company_display_name: null, company_brand_name: null})
    const result = getBillingInitialValues(billing, buildAccount())
    expect(result.companyDisplayName).toContain('John Doe')
    expect(result.company_brand_name).toContain('John Doe')
  })

  it('truncates computed names to 49 characters', () => {
    const longName = 'Dr ' + 'VeryLongName '.repeat(5)
    const account = buildAccount({first_name: longName, last_name: 'Smith'})
    const result = getBillingInitialValues(buildBilling({company_display_name: null}), account)
    expect(result.companyDisplayName.length).toBeLessThanOrEqual(49)
  })

  it('preserves nullable fields and reset flags', () => {
    const billing = buildBilling({company_legal_name: null, address_line2: null})
    const result = getBillingInitialValues(billing, buildAccount())
    expect(result.companyLegalName).toBeNull()
    expect(result.address2).toBeNull()
    expect(result.file_action).toBe('NOT_UPDATE')
  })
})

describe('account initial values', () => {
  it('lowercases email and maps fields', () => {
    const account = buildAccount({email: 'JOHN@MAIL.COM'})
    const result = getAccountInitialValues(account)
    expect(result.email).toBe('john@mail.com')
    expect(result.firstName).toBe('John')
  })

  it('handles nullable names and numbers', () => {
    const account = buildAccount({last_name: null, mobile_no: null, display_name: null})
    const result = getAccountInitialValues(account)
    expect(result.lastName).toBeNull()
    expect(result.mobileNumber).toBe('')
    expect(result.displayName).toBeNull()
  })
})

describe('subscription initial values', () => {
  it('returns blank defaults', () => {
    const result = getSubscriptionInitialValues()
    expect(result).toEqual({mobile: '', request_type: '', new_plan_name: '', notes: null})
  })

  it('returns a fresh object each call', () => {
    const first = getSubscriptionInitialValues()
    const second = getSubscriptionInitialValues()
    second.mobile = 'changed'
    expect(first.mobile).toBe('')
  })
})

describe('service product initial values', () => {
  it('maps product data when provided', () => {
    const result = getServiceInitialValues({
      product_type: 'prod',
      product_name: 'Name',
      product_category_id: 'cat',
      product_description: 'desc',
      product_image: 'img',
      is_product_enabled: false,
    } as any)
    expect(result).toMatchObject({
      product: 'prod',
      name: 'Name',
      category: 'cat',
      description: 'desc',
      photo: ['img'],
      enabled: false,
    })
  })

  it('returns defaults when product is null', () => {
    const result = getServiceInitialValues(null)
    expect(result).toEqual({
      product: '',
      name: '',
      category: '',
      description: '',
      photo: [],
      enabled: true,
    })
  })

  it('defaults enabled to true when flag is missing', () => {
    const result = getServiceInitialValues({} as any)
    expect(result.enabled).toBe(true)
  })
})

describe('service constants', () => {
  it('initializes services flags to false', () => {
    expect(sampleOrg.services).toEqual(
      expect.objectContaining({
        outsourced_aligners: false,
        in_house_aligners: false,
        planning: false,
        manufacturing: false,
        outsource_planning: false,
        outsource_manufacturing: false,
        operations_in_house: false,
        operations_outsource: false,
        offer_planning: false,
        offer_manufacturing: false,
      })
    )
  })

  it('starts with empty product collections', () => {
    expect(sampleOrg.alignerProducts).toEqual([])
    expect(sampleOrg.products).toEqual([])
    expect(sampleOrg.planningProducts).toEqual([])
  })
})

describe('addProductFormValidationSchema', () => {
  test.each([
    [{name: 'X', category: 'Y', enabled: true}, 'product'],
    [{product: 'P', category: 'Y', enabled: true}, 'name'],
    [{product: 'P', name: 'N', enabled: true}, 'category'],
    [{product: 'P', name: 'N', category: 'C'}, 'enabled'],
  ])('rejects when %s is missing', async (payload) => {
    await expect(addProductFormValidationSchema().validate(payload)).rejects.toThrow()
  })

  it('accepts nullable description and photo', async () => {
    await expect(
      addProductFormValidationSchema().validate({
        product: 'P',
        name: 'N',
        category: 'C',
        description: null,
        photo: null,
        enabled: true,
      })
    ).resolves.toMatchObject({description: null, photo: null})
  })

  it('accepts enabled flag false', async () => {
    await expect(
      addProductFormValidationSchema().validate({
        product: 'P',
        name: 'N',
        category: 'C',
        enabled: false,
      })
    ).resolves.toMatchObject({enabled: false})
  })

  it('passes with full valid payload', async () => {
    await expect(
      addProductFormValidationSchema().validate({
        product: 'P',
        name: 'N',
        category: 'C',
        description: 'd',
        photo: 'img',
        enabled: true,
      })
    ).resolves.toMatchObject({name: 'N'})
  })
})
