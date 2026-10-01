import useAllUserPlan from '@hooks/useAllUserPlan'
import useActiveProfile from '@hooks/useActiveProfile'
import useDispatchAction from '@hooks/useDispatchAction'
import useSubscriptionDetails from '@hooks/useSubscriptionDetails'
import fileFormatType from '@staticData/fileFormatType'
import InfoIcon from 'assets/icons/InfoIcon'
import AntdButton from 'components/atom/Buttons/AntdButton'
import FormikInput from 'components/atom/Inputs/FormikInput'
import SuccessToast from 'components/modal/Alert/SuccessToast'
import Page from 'components/page/Page'
import {AuthContext} from 'context/AuthContext'
import {Formik} from 'formik'
import React, {useContext, useEffect, useState} from 'react'
import {useSelector} from 'react-redux'
import {useNavigate} from 'react-router-dom'
import {getApiDataDoctorProfile} from 'redux/Slices/AppSlice/DoctorProfile/DoctorProfileGetSlice'
import {
  getAccountData,
  getBillingData,
  updateBillingData,
} from 'redux/Slices/AppSlice/settings/settings.slice'
import {RootState} from 'redux/store'
import validateAndProcessPhotos from 'screens/Patients/Chat/helpers/checkPhotosValidation'
import getInitialValuesBillingPage from 'screens/settings/billing/helpers/getInitialValuesBillingPage'
import Header from 'screens/settings/components/Header'
import PhotoUpload from 'screens/settings/components/PhotoUpload'
import {IAccountDetails, IBillingDetails} from 'screens/settings/settings.types'
import rolesConstants from '@constants/roles.constants'
import {getSalutations, safeParseInt} from 'utils/ConstFunctions'
import getColorPalette from 'utils/getColorPalette'
import {IMAGE_APP_LOGO} from 'utils/ImageConst'
import {isStarterOrLitePlan, normalizePlanName} from 'utils/subscriptionPlan'
import * as Yup from 'yup'
import {hasRole} from '@hooks/useAllUserPlan'

const accountSchema = () =>
  Yup.object().shape({
    company_display_name: Yup.string()
      .min(2, 'Enter valid company name')
      .max(50, 'Enter valid company name')
      .notRequired(),

    company_brand_name: Yup.string()
      .min(2, 'Enter valid Lab/Aligner brand name')
      .max(50, 'Enter valid Lab/Aligner brand name')
      .notRequired(),
  })

const shouldNavigateToHome = (billingDetails?: IBillingDetails | null) => {
  const planName = normalizePlanName(billingDetails?.plan_name)
  const profileType = String(billingDetails?.profile_type ?? '')
    .trim()
    .toUpperCase()

  return isStarterOrLitePlan(planName) || profileType === 'INVITED'
}

const ConfirmBrandingDetails = () => {
  const {loadingBillingData, billing, account, loadingAccountData, loadingUpdateBillingData} =
    useSelector((state: RootState) => state.settings)
  const {dispatchAction} = useDispatchAction()
  const {userId, organizationId, profileId} = useContext(AuthContext)
  const {loadingSubscriptionData} = useSubscriptionDetails(true)
  const {activeProfile} = useActiveProfile()
  const {isStarterPlanUser, isPractice, isEnterprisePlanUser, isGrowthPlanUser} = useAllUserPlan()
  const navigate = useNavigate()
  const [companyProfilePictureUrl, setCompanyProfilePictureUrl] = useState<string | null>(null)
  const [brandProfilePictureUrl, setBrandProfilePictureUrl] = useState<string | null>(null)
  const isGrowthOwnerRole =
    activeProfile?.profile_type === 'OWNER' &&
    hasRole(activeProfile, rolesConstants.IN_OFFICE_MANUFACTURER)
  const isEnterpriseOwnerRole =
    activeProfile?.profile_type === 'OWNER' &&
    (hasRole(activeProfile, rolesConstants.ENTERPRISE_COMPANY_LAB) ||
      hasRole(activeProfile, rolesConstants.ALIGNER_COMPANY_OR_LAB))
  const [showDisplayName, setShowDisplayName] = useState<boolean>(
    isGrowthPlanUser || isStarterPlanUser || isPractice || isGrowthOwnerRole
  )
  const [showBrandName, setShowBrandName] = useState<boolean>(
    isEnterprisePlanUser || isGrowthPlanUser || isGrowthOwnerRole || isEnterpriseOwnerRole
  )

  useEffect(() => {
    if (!userId) return
    const postData = {
      doctor_id: safeParseInt(userId),
    }
    dispatchAction(getApiDataDoctorProfile(postData) as any)
  }, [userId])

  useEffect(() => {
    if (isGrowthPlanUser || isStarterPlanUser || isPractice || isGrowthOwnerRole) {
      setShowDisplayName(true)
    }
    if (isGrowthPlanUser || isEnterprisePlanUser || isGrowthOwnerRole || isEnterpriseOwnerRole) {
      setShowBrandName(true)
    }
  }, [
    isGrowthPlanUser,
    isStarterPlanUser,
    isPractice,
    isEnterprisePlanUser,
    isGrowthOwnerRole,
    isEnterpriseOwnerRole,
  ])

  const handleSubmit = async (values: ReturnType<typeof getInitialValuesBillingPage>) => {
    try {
      await dispatchAction(
        updateBillingData({
          data: {
            details: {
              doctor_id: safeParseInt(userId),
              billing_id: billing?.billing_id ?? null,
              profile_id: safeParseInt(profileId),
              organization_id: safeParseInt(organizationId),
              company_legal_name: billing.company_legal_name,
              address_line1: billing.address_line1,
              address_line2: billing.address_line2,
              country: billing.country,
              state: billing.state,
              city: billing.city,
              pincode: billing.pincode,
              company_tax_id: billing.company_tax_id,
              currency: billing.currency,
              file_action: values.file_action,
              file_brand_action: values.file_brand_action,
              company_display_name: values.company_display_name,
              company_brand_name: values.company_brand_name,
            },
            image: values.companyProfilePicture,
            company_brand_name_profile: values.company_brand_name_profile,
          },
        })
      ).unwrap()

      const res = await dispatchAction(
        getBillingData({
          doctorId: safeParseInt(userId),
          organizationId: safeParseInt(organizationId),
          profileId: safeParseInt(profileId),
        })
      ).unwrap()

      SuccessToast('Details updated successfully')
      setBrandProfilePictureUrl(null)
      setCompanyProfilePictureUrl(null)

      if (shouldNavigateToHome(res)) {
        navigate('/', {replace: true})
        return
      }

      navigate('/on-board-meeting', {
        replace: true,
        state: {fromBrandDetails: true},
      })
    } catch (error) {
      throw error
    }
  }

  return (
    <Formik
      initialValues={getInitialValuesBillingPage(billing, account)}
      onSubmit={handleSubmit}
      enableReinitialize
      validationSchema={accountSchema()}
    >
      {(formik) => {
        useEffect(() => {
          dispatchAction(
            getBillingData({
              doctorId: safeParseInt(userId),
              organizationId: safeParseInt(organizationId),
              profileId: safeParseInt(profileId),
            })
          )
            .unwrap()
            .then((res: IBillingDetails) => {
              formik.setFieldValue('company_display_name', res.company_display_name)
              formik.setFieldValue('company_brand_name', res.company_brand_name)
            })
            .catch(() => {
              dispatchAction(
                getAccountData({
                  doctorId: safeParseInt(userId),
                  organizationId: safeParseInt(organizationId),
                  profileId: safeParseInt(profileId),
                })
              )
                .unwrap()
                .then((res: IAccountDetails) => {
                  dispatchAction(
                    updateBillingData({
                      data: {
                        details: {
                          doctor_id: safeParseInt(userId),
                          billing_id: null,
                          profile_id: safeParseInt(profileId),
                          organization_id: safeParseInt(organizationId),
                          company_legal_name: `${getSalutations(res?.salutation ?? '')} ${
                            res.first_name
                          } ${res.last_name}`,
                          address_line1: null,
                          address_line2: null,
                          country: null,
                          state: null,
                          city: null,
                          pincode: null,
                          company_tax_id: null,
                          currency: null,
                          file_action: 'NOT_UPDATE',
                          file_brand_action: 'NOT_UPDATE',
                          company_display_name: `${getSalutations(res?.salutation ?? '')} ${
                            res.first_name
                          } ${res.last_name}`,
                          company_brand_name: `${getSalutations(res?.salutation ?? '')} ${
                            res.first_name
                          } ${res.last_name}`,
                        },
                        image: null,
                        company_brand_name_profile: null,
                      },
                    })
                  )
                    .unwrap()
                    .then((res: IBillingDetails) => {
                      dispatchAction(
                        getBillingData({
                          doctorId: safeParseInt(userId),
                          organizationId: safeParseInt(organizationId),
                          profileId: safeParseInt(profileId),
                        })
                      )
                      formik.setFieldValue('company_display_name', res.company_display_name)
                      formik.setFieldValue('company_brand_name', res.company_brand_name)
                    })
                })
            })
        }, [])

        const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, name: string) => {
          const photo = event?.target?.files ? event.target.files[0] : null
          if (!photo) return

          const validatedFileList = validateAndProcessPhotos({
            files: [photo],
            fileCount: 2,
            chatFileFormats: fileFormatType.GALLERY_FILE_EXTENSIONS,
            maxFileSize: 20,
            invalidSizeMessage: 'Uploaded image must be less than 20 MB',
            invalidFileFormatMessage:
              'Invalid file format. Please upload a JPG, JPEG, PNG file only',
          })
          const newFiles = Array.from(validatedFileList)

          formik.setFieldValue(name, newFiles[0])
          formik.setFieldValue('file_action', 'UPDATE')

          const urls = newFiles.map((file) => ({
            url: URL.createObjectURL(file),
            type: file.type,
            name: file.name,
            extension: file.name.split('.').pop(),
          }))
          setCompanyProfilePictureUrl(urls[0].url)
        }

        const handleFileBrandNameChange = (
          event: React.ChangeEvent<HTMLInputElement>,
          name: string
        ) => {
          const photo = event?.target?.files ? event.target.files[0] : null
          if (!photo) return

          const validatedFileList = validateAndProcessPhotos({
            files: [photo],
            fileCount: 2,
            chatFileFormats: fileFormatType.GALLERY_FILE_EXTENSIONS,
            maxFileSize: 20,
            invalidSizeMessage: 'Uploaded image must be less than 20 MB',
            invalidFileFormatMessage:
              'Invalid file format. Please upload a JPG, JPEG, PNG file only',
          })
          const newFiles = Array.from(validatedFileList)

          formik.setFieldValue(name, newFiles[0])
          formik.setFieldValue('file_brand_action', 'UPDATE')

          const urls = newFiles.map((file) => ({
            url: URL.createObjectURL(file),
            type: file.type,
            name: file.name,
            extension: file.name.split('.').pop(),
          }))
          setBrandProfilePictureUrl(urls[0].url)
        }
        return (
          <Page exitConfirmPredicate={formik.dirty} loading={loadingSubscriptionData}>
            <div className='min-h-screen p-3 flex flex-col items-center justify-center w-full'>
              <div className='flex flex-col items-start justify-center  gap-6  max-w-[540px]'>
                <div className='flex flex-col items-start  w-[160px] mb-2'>
                  <img className='w-[160px]' src={IMAGE_APP_LOGO} alt='app logo' />
                </div>
                <div>
                  <div className='text-2xl font-semibold'>Confirm your branding details</div>
                  <div className='text-textColor font-normal'>
                    {
                      "Before you get started, let's make sure your details are accurate. You can always change them later from Settings > Accounts."
                    }
                  </div>
                </div>
                {showDisplayName && (
                  <div className='flex flex-col gap-3'>
                    <Header
                      title='Display name for Patient App'
                      subTitle='Shown to patients and used in communications.'
                    />
                    <div className='flex gap-2 text-textColor text-xs font-semibold items-center px-2 py-1 border border-primaryColor rounded-lg w-fit bg-primarySupport'>
                      <InfoIcon color={getColorPalette().primaryColor} />
                      <p>
                        This is how your patients will see you in the app. Personalize it to match
                        your brand.
                      </p>
                    </div>
                    <div className='flex items-center gap-3'>
                      <PhotoUpload
                        id='companyProfilePicture'
                        onFileChange={(e) => {
                          handleFileChange(e, 'companyProfilePicture')
                        }}
                        src={companyProfilePictureUrl ?? ''}
                        initials={
                          formik.values?.company_display_name
                            ? formik.values?.company_display_name[0].toUpperCase()
                            : ''
                        }
                        removeFile={() => {
                          formik.setFieldValue('companyProfilePicture', '')
                          formik.setFieldValue('file_action', 'REMOVE')
                          setCompanyProfilePictureUrl(null)
                        }}
                        isEditClicked={true}
                      />
                      <div className='md:w-1/2 w-full'>
                        <FormikInput
                          name={'company_display_name'}
                          className='py-3'
                          maxLength={100}
                        />
                      </div>
                    </div>
                  </div>
                )}
                {showBrandName && (
                  <div className='flex flex-col gap-3'>
                    <Header
                      title='Lab/Aligner brand name'
                      subTitle='Visible to labs, customers, users when invited.'
                    />
                    <div className='flex gap-2 text-textColor text-xs font-semibold items-center px-2 py-1 border border-primaryColor rounded-lg w-fit bg-primarySupport'>
                      <InfoIcon color={getColorPalette().primaryColor} />
                      <p>
                        This will be used to connect with your team and partners. Choose a name that
                        represents your brand.
                      </p>
                    </div>
                    <div className='flex items-center gap-3'>
                      <PhotoUpload
                        id='company_brand_name_profile'
                        onFileChange={(e) => {
                          handleFileBrandNameChange(e, 'company_brand_name_profile')
                        }}
                        src={brandProfilePictureUrl ?? ''}
                        initials={
                          formik.values?.company_brand_name
                            ? formik.values?.company_brand_name[0].toUpperCase()
                            : ''
                        }
                        removeFile={() => {
                          formik.setFieldValue('company_brand_name_profile', '')
                          formik.setFieldValue('file_brand_action', 'REMOVE')
                          setBrandProfilePictureUrl(null)
                        }}
                        isEditClicked={true}
                      />
                      <div className='md:w-1/2 w-full'>
                        <FormikInput name={'company_brand_name'} className='py-3' maxLength={100} />
                      </div>
                    </div>
                  </div>
                )}

                <div className='flex flex-col items-start '>
                  <AntdButton
                    key='submit'
                    text={'Confirm & Continue'}
                    htmlType='submit'
                    loading={loadingUpdateBillingData}
                    disabled={loadingBillingData || loadingAccountData || loadingUpdateBillingData}
                    className='h-11 w-fit bg-primaryColor text-center'
                    onClick={() => formik.handleSubmit()}
                  />
                </div>
              </div>
            </div>
          </Page>
        )
      }}
    </Formik>
  )
}

export default ConfirmBrandingDetails
