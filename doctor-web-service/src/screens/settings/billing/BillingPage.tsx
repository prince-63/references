import {useContext, useEffect, useState} from 'react'
import ContainerWrapper from '../components/ContainerWrapper'
import Header from '../components/Header'
import FormikInput from 'components/atom/Inputs/FormikInput'
import {Formik} from 'formik'
import Page from 'components/page/Page'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import getInitialValues from './helpers/getInitialValuesBillingPage'
import addressService from 'services/addressCityStateCountry/address.service'
import useDispatchAction from '@hooks/useDispatchAction'
import DropdownSimple from 'components/atom/Dropdown/DropdownSimple'
import FormikSelectList from 'components/atom/Dropdown/FormikSelectList'
import currencyList from '@staticData/currencyList'
import {billingSchema} from './billing.schema'

import {
  getAccountData,
  getBillingData,
  updateBillingData,
} from 'redux/Slices/AppSlice/settings/settings.slice'
import {AuthContext} from 'context/AuthContext'
import {safeParseInt} from 'utils/ConstFunctions'
import SuccessToast from 'components/modal/Alert/SuccessToast'
import {useFeatureAccess} from '@hooks/useFeatureAccess'

const BillingPage = () => {
  const {billing, loadingBillingData, account} = useSelector((state: RootState) => state.settings)
  const [isEditClicked, setIsEditClicked] = useState(false)
  const {userId, organizationId, profileId} = useContext(AuthContext)
  const {dispatchAction} = useDispatchAction()
  const {permissionChecks} = useFeatureAccess()
  const billingPermissions = permissionChecks?.profilesAccountsAndSettings?.addEditBillingDetails
  useEffect(() => {
    if (!isEditClicked) return
    const fetchStateCityData = async () => {
      if (!billing?.country || !billing?.state) return
      await Promise.all([
        addressService.getStateList(dispatchAction, billing.country),
        addressService.getCityList(dispatchAction, billing.country, billing.state),
      ])
    }

    const callCountryListService = async () => {
      await addressService.getCountryList(dispatchAction)
    }

    callCountryListService()
    fetchStateCityData()
  }, [billing, isEditClicked])
  useEffect(() => {
    dispatchAction(
      getBillingData({
        doctorId: safeParseInt(userId),
        organizationId: safeParseInt(organizationId),
        profileId: safeParseInt(profileId),
      })
    )
    dispatchAction(
      getAccountData({
        doctorId: safeParseInt(userId),
        organizationId: safeParseInt(organizationId),
        profileId: safeParseInt(profileId),
      })
    )
  }, [])

  const handleSubmit = async (values: ReturnType<typeof getInitialValues>) => {
    try {
      await dispatchAction(
        updateBillingData({
          data: {
            details: {
              doctor_id: safeParseInt(userId),
              billing_id: billing?.billing_id ?? null,
              profile_id: safeParseInt(profileId),
              organization_id: safeParseInt(organizationId),
              company_display_name: values.companyDisplayName,
              company_legal_name: values.companyLegalName,
              address_line1: values.address1,
              address_line2: values.address2,
              country: values.country,
              state: values.state,
              city: values.city,
              pincode: values.pincode,
              company_tax_id: values.companyTaxId,
              currency: values.currency,
              file_action: values.file_action,
              file_brand_action: values.file_brand_action,
              company_brand_name: values.company_brand_name,
            },
            image: values.companyProfilePicture,
            company_brand_name_profile: values.company_brand_name_profile,
          },
        })
      )
        .unwrap()
        .then(() => {
          dispatchAction(
            getBillingData({
              doctorId: safeParseInt(userId),
              organizationId: safeParseInt(organizationId),
              profileId: safeParseInt(profileId),
            })
          )
          setIsEditClicked(false)
          SuccessToast('Details updated successfully')
        })
    } catch (error) {
      throw error
    }
  }
  return (
    <Formik
      initialValues={getInitialValues(billing, account)}
      onSubmit={handleSubmit}
      enableReinitialize
      validationSchema={billingSchema()}
    >
      {(formik) => {
        return (
          <Page exitConfirmPredicate={isEditClicked && formik.dirty} loading={loadingBillingData}>
            <div className='flex flex-col gap-12 md:w-3/4'>
              <ContainerWrapper
                title='Organization Details'
                isSubmitting={formik.isSubmitting}
                isEditClicked={isEditClicked}
                onClickEdit={() => {
                  setIsEditClicked(true)
                }}
                onClickCancel={() => {
                  formik.resetForm()
                  setIsEditClicked(false)
                }}
                onClickSave={() => {
                  formik.handleSubmit()
                }}
                showEditButton={billingPermissions?.isEditable}
              >
                <div className='flex flex-col gap-4'>
                  <Header
                    title='Organization Details'
                    subTitle='Add legal details of your company.'
                  />
                  <div className='md:w-1/2'>
                    <FormikInput
                      name={'companyLegalName'}
                      label={'Company legal name'}
                      disabled={!isEditClicked}
                      className='py-3'
                      maxLength={200}
                    />
                  </div>

                  <div className='w-full border border-mediumGray' />

                  <div className='flex flex-col md:flex-row gap-4'>
                    <FormikInput
                      name={'address1'}
                      label={'Address line 1'}
                      disabled={!isEditClicked}
                      className='py-3'
                      maxLength={100}
                    />
                    <FormikInput
                      name={'address2'}
                      label={'Address line 2'}
                      disabled={!isEditClicked}
                      className='py-3'
                      maxLength={100}
                    />
                  </div>
                  <div className='flex flex-col md:flex-row gap-4'>
                    <div className='md:w-1/2 w-full'>
                      <DropdownSimple
                        name='country'
                        className=''
                        label='Country'
                        formik={formik}
                        required={false}
                        disabled={!isEditClicked}
                        value={formik.getFieldProps('country').value}
                        dispatch={dispatchAction}
                      />
                    </div>
                    <div className='md:w-1/2 w-full'>
                      <DropdownSimple
                        name='state'
                        className=''
                        label='State'
                        formik={formik}
                        required={false}
                        disabled={!isEditClicked}
                        value={formik.getFieldProps('state').value}
                        dispatch={dispatchAction}
                      />
                    </div>
                  </div>

                  <div className='flex flex-col md:flex-row gap-4'>
                    <div className=' w-full'>
                      <DropdownSimple
                        name='city'
                        className=''
                        label='City'
                        formik={formik}
                        required={false}
                        disabled={!isEditClicked}
                        value={formik.getFieldProps('city').value}
                        dispatch={dispatchAction}
                      />
                    </div>
                    <FormikInput
                      name={'pincode'}
                      label={'Pincode'}
                      disabled={!isEditClicked}
                      className='py-3'
                      maxLength={100}
                    />
                  </div>
                  <div className='w-full border border-mediumGray' />
                  <div className='flex flex-col md:flex-row gap-4'>
                    <div className='md:w-1/2'>
                      <FormikInput
                        name={'companyTaxId'}
                        label={'Company tax ID'}
                        disabled={!isEditClicked}
                        className='py-3'
                        maxLength={100}
                      />
                    </div>
                  </div>
                  <div className='w-full border border-mediumGray' />
                  <div className='flex flex-col md:flex-row gap-4'>
                    <div className='md:w-1/2'>
                      <FormikSelectList
                        {...{
                          name: 'currency',
                          showSearch: true,
                          items: currencyList,
                          disabled: !isEditClicked,
                          className: '!h-12 !rounded-sm',
                          label: 'Currency',
                          onChangeMapperFunc: String,
                        }}
                      />
                    </div>
                  </div>
                </div>
                {/* <div className='flex flex-col gap-4'>
                  <Header
                    title='Company details'
                    subTitle='Add or edit company details that you might be associated with.'
                  />
                  <div className='flex mb-6 items-center gap-3'>
                    <PhotoUpload
                      id='companyProfilePicture'
                      onFileChange={(e) => {
                        handleFileChange(e, 'companyProfilePicture')
                      }}
                      src={companyProfilePictureUrl ?? ''}
                      isEditClicked={isEditClicked}
                      initials={
                        formik.values?.companyDisplayName
                          ? formik.values?.companyDisplayName[0].toUpperCase()
                          : ''
                      }
                      removeFile={() => {
                        formik.setFieldValue('companyProfilePicture', '')
                        formik.setFieldValue('file_action', 'REMOVE')
                        setCompanyProfilePictureUrl(null)
                      }}
                    />
                    <div className='md:w-1/2 w-full'>
                      <FormikInput
                        name={'companyDisplayName'}
                        disabled={!isEditClicked}
                        className='py-3'
                        maxLength={100}
                      />
                    </div>
                  </div>
                </div> */}
              </ContainerWrapper>
            </div>
          </Page>
        )
      }}
    </Formik>
  )
}

export default BillingPage
