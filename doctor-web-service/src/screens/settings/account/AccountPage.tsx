import {useContext, useEffect, useState} from 'react'
import ContainerWrapper from '../components/ContainerWrapper'
import HeaderWithEditButton from '../components/HeaderWithEditButton'
import PhotoUpload from '../components/PhotoUpload'
import FormikInput from 'components/atom/Inputs/FormikInput'
import {Formik, FormikHelpers} from 'formik'
import defaultCountyCode from '@constants/defaultCountyCode'
import {Select, Space} from 'antd'
import salutations from '@staticData/salutations'
import {map} from 'ramda'
import InputMobile from 'components/atom/Inputs/InputMobile'
import InfoIcon from 'assets/icons/InfoIcon'
import Page from 'components/page/Page'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import getInitialValues from './helpers/getInitialValues'
import {accountSchema} from './account.schema'
import validateAndProcessPhotos from 'screens/Patients/Chat/helpers/checkPhotosValidation'
import fileFormatType from '@staticData/fileFormatType'
import useDispatchAction from '@hooks/useDispatchAction'
import {
  getAccountData,
  getBillingData,
  updateAccountData,
  updateBillingData,
} from 'redux/Slices/AppSlice/settings/settings.slice'
import {AuthContext} from 'context/AuthContext'
import {getImageUrlById, getSalutations, safeParseInt} from 'utils/ConstFunctions'
import SuccessToast from 'components/modal/Alert/SuccessToast'
import {getApiDataDoctorProfile} from 'redux/Slices/AppSlice/DoctorProfile/DoctorProfileGetSlice'
import When from 'components/when/When'
import getColorPalette from 'utils/getColorPalette'
import getInitialValuesBillingPage from '../billing/helpers/getInitialValuesBillingPage'
import Header from '../components/Header'
import * as Yup from 'yup'
import DeleteModal from 'screens/Patients/LeadsProfile/main/treatment/setUpTreatmentPlan/components/DeleteModal'
import imageCompression from 'browser-image-compression'
import {useFeatureAccess} from '@hooks/useFeatureAccess'
import useAllUserPlan from '@hooks/useAllUserPlan'
import useSubRoleDetails from '@hooks/useSubRoleDetails'
import getBrandConfig from 'utils/getBrandConfig'

const billingDetailsSchema = () =>
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

const AccountPage = () => {
  const {account, billing, loadingAccountData, loadingBillingData} = useSelector(
    (state: RootState) => state.settings
  )
  const {Option} = Select
  const [isEditingTheUserProfile, setIsEditingTheUserProfile] = useState(false)
  const [isEditingBrandingDetails, setIsEditingBrandingDetails] = useState(false)
  const {userId, organizationId, profileId} = useContext(AuthContext)
  const {
    isStarterPlanUser,
    isDesignLabUser,
    isPractice,
    isOrganization: org,
    isCustomer,
    isVendor,
    isGrowthPlanUser,
    isInternalUser,
  } = useAllUserPlan()
  const {isAdmin} = useSubRoleDetails()
  const isOrganization = org || isAdmin
  const {currentCountryCode} = useContext(AuthContext)
  const [countryCode, setCountryCode] = useState<string>(
    account?.country_code ?? currentCountryCode ?? defaultCountyCode.DEFAULT_COUNTRY_CODE_INDIA
  )

  const brand = getBrandConfig()
  const [isCancelModalOpen, setIsCancelModalOpen] = useState<boolean>(false)
  const [profilePictureUrl, setProfilePictureUrl] = useState<string>(
    account?.profile_picture_id
      ? getImageUrlById(account?.profile_picture_id)
      : (account.profile_picture ?? '')
  )
  const [companyProfilePictureUrl, setCompanyProfilePictureUrl] = useState<string | null>(
    billing.company_image_id
      ? getImageUrlById(billing?.company_image_id)
      : (billing?.company_image_url ?? null)
  )
  const [brandProfilePictureUrl, setBrandProfilePictureUrl] = useState<string | null>(
    billing.company_brand_profile_picture_id
      ? getImageUrlById(billing?.company_brand_profile_picture_id)
      : (billing?.company_brand_profile_picture ?? null)
  )
  const {permissionChecks} = useFeatureAccess()
  const accountPermission = permissionChecks?.profilesAccountsAndSettings

  const {dispatchAction} = useDispatchAction()
  useEffect(() => {
    dispatchAction(
      getAccountData({
        doctorId: safeParseInt(userId),
        organizationId: safeParseInt(organizationId),
        profileId: safeParseInt(profileId),
      })
    )
    dispatchAction(
      getBillingData({
        doctorId: safeParseInt(userId),
        organizationId: safeParseInt(organizationId),
        profileId: safeParseInt(profileId),
      })
    )
  }, [])

  useEffect(() => {
    setProfilePictureUrl(
      account?.profile_picture_id
        ? getImageUrlById(account?.profile_picture_id)
        : (account.profile_picture ?? '')
    )
    setCountryCode(account.country_code)

    setBrandProfilePictureUrl(
      billing.company_brand_profile_picture_id
        ? getImageUrlById(billing?.company_brand_profile_picture_id)
        : (billing?.company_brand_profile_picture ?? '')
    )
    setCompanyProfilePictureUrl(
      billing.company_image_id
        ? getImageUrlById(billing?.company_image_id)
        : (billing?.company_image_url ?? '')
    )
  }, [account, billing])

  const handleSubmitForAccountDetails = async (
    values: ReturnType<typeof getInitialValues>,
    formik: FormikHelpers<ReturnType<typeof getInitialValues>>
  ) => {
    try {
      await dispatchAction(
        updateAccountData({
          data: {
            details: {
              first_name: values.firstName,
              last_name: values.lastName,
              email: values.email?.toLocaleLowerCase(),
              country_code: countryCode,
              mobile_no: values.mobileNumber,
              display_name: [
                getSalutations(values.salutation).trim(),
                values.firstName,
                values.lastName,
              ]
                .map((value) => (value ?? '').toString().trim())
                .filter(Boolean)
                .join(' '),
              salutation: values.salutation,
              profile_id: account?.profile_id,
              organization_id: account?.organization_id,
              doctor_id: safeParseInt(userId),
              file_action_profile: values.file_action_profile,
              file_action_display: values.file_action_display,
            },
            profile_picture: values.file_action_profile === 'UPDATE' ? values.profileImage : null,
            display_picture:
              values.file_action_display === 'UPDATE' ? values.displayProfileImage : null,
          },
        })
      )
        .unwrap()
        .then(() => {
          formik.resetForm()
          dispatchAction(
            getAccountData({
              doctorId: safeParseInt(userId),
              organizationId: safeParseInt(organizationId),
              profileId: safeParseInt(profileId),
            })
          )
          const postData = {
            doctor_id: safeParseInt(userId),
          }
          dispatchAction(getApiDataDoctorProfile(postData))
          setIsEditingBrandingDetails(false)
          setIsEditingTheUserProfile(false)
          SuccessToast('Details updated successfully')
        })
    } catch (error) {
      throw error
    }
  }

  const handleSubmitForBillingDetails = async (
    values: ReturnType<typeof getInitialValuesBillingPage>
  ) => {
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
          setIsEditingBrandingDetails(false)
          SuccessToast('Details updated successfully')
        })
    } catch (error) {
      throw error
    }
  }

  return (
    <>
      <Formik
        initialValues={getInitialValues(account)}
        onSubmit={handleSubmitForAccountDetails}
        enableReinitialize
        validationSchema={accountSchema(countryCode)}
      >
        {(formik) => {
          const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
            const photo = event?.target?.files ? event.target.files[0] : null
            if (!photo) return

            let fileToUse = photo

            if (photo.size / 1024 > 200) {
              try {
                const options = {
                  maxSizeMB: 0.2, // 200KB
                  maxWidthOrHeight: 1024,
                  useWebWorker: true,
                }

                const compressedFile = await imageCompression(photo, options)

                fileToUse = compressedFile
              } catch (error) {
                console.error('❌ Compression failed, using original file.', error)
              }
            } else {
            }

            const validatedFileList = validateAndProcessPhotos({
              files: [fileToUse],
              fileCount: 2,
              chatFileFormats: fileFormatType.GALLERY_FILE_EXTENSIONS,
              maxFileSize: 20,
              invalidSizeMessage: 'Uploaded image must be less than 20 MB',
              invalidFileFormatMessage:
                'Invalid file format. Please upload a JPG, JPEG, PNG file only',
            })

            const newFiles = Array.from(validatedFileList)

            formik.setFieldValue('profileImage', newFiles[0])

            const urls = newFiles.map((file) => ({
              url: URL.createObjectURL(file),
              type: file.type,
              name: file.name,
              extension: file.name.split('.').pop(),
            }))

            setProfilePictureUrl(urls[0]?.url)
            formik.setFieldValue('file_action_profile', 'UPDATE')
          }

          return (
            <Page
              exitConfirmPredicate={
                (isEditingBrandingDetails || isEditingTheUserProfile) && formik.dirty
              }
              loading={loadingAccountData}
            >
              <When isTrue={isCancelModalOpen}>
                <DeleteModal {...{setIsCancelModalOpen}} />
              </When>
              <div className='flex flex-col gap-12 md:w-3/4'>
                <ContainerWrapper
                  title='User profile'
                  isEditClicked={isEditingTheUserProfile}
                  isSubmitting={formik.isSubmitting}
                  onClickEdit={() => {
                    setIsEditingTheUserProfile(true)
                  }}
                  onClickCancel={() => {
                    formik.resetForm()
                    setProfilePictureUrl(
                      account?.profile_picture_id
                        ? getImageUrlById(account?.profile_picture_id)
                        : (account.profile_picture ?? '')
                    )
                    setIsEditingTheUserProfile(false)
                  }}
                  onClickSave={() => {
                    formik.handleSubmit()
                  }}
                >
                  <div className='flex flex-col gap-4'>
                    <HeaderWithEditButton
                      title='Personal details'
                      subTitle='Add or edit your personal details.'
                    />
                    <PhotoUpload
                      id='profileImage_file_action_profile'
                      onFileChange={(e) => {
                        handleFileChange(e)
                      }}
                      src={profilePictureUrl ?? ''}
                      initials={account?.first_name ? account.first_name[0].toUpperCase() : ''}
                      removeFile={() => {
                        formik.setFieldValue('profileImage', null)
                        formik.setFieldValue('file_action_profile', 'REMOVE')
                        setProfilePictureUrl('')
                      }}
                      tipMessage={
                        isEditingTheUserProfile
                          ? 'Tip: Upload a square image, within 20 MB'
                          : undefined
                      }
                      isEditClicked={isEditingTheUserProfile}
                    />
                    <div className='flex flex-col md:flex-row gap-4'>
                      <div className='w-full'>
                        <label
                          className={'w-full text-bold text-textColor text-base font-medium'}
                          style={{color: '#666666'}}
                        >
                          Your First Name
                          <span className='text-red ml-1'>*</span>
                        </label>
                        <Space.Compact className='w-full'>
                          <Select
                            value={formik.values['salutation']}
                            disabled={!isEditingTheUserProfile}
                            popupMatchSelectWidth={false}
                            className='h-12 focus:outline-none font-medium'
                            id='salutation'
                            onChange={(v) => {
                              formik.setFieldValue('salutation', v)
                            }}
                          >
                            {map(
                              (item) => (
                                <Option
                                  key={`${item.label}-${item.value}`}
                                  value={item.value}
                                  selected={item.value === item.value}
                                >
                                  {item.label}
                                </Option>
                              ),
                              salutations
                            )}
                          </Select>
                          <div className='w-full'>
                            <FormikInput
                              name={'firstName'}
                              required
                              disabled={!isEditingTheUserProfile}
                              className='h-12'
                              maxLength={200}
                            />
                          </div>
                        </Space.Compact>
                      </div>
                      <FormikInput
                        name={'lastName'}
                        label={'Last name'}
                        disabled={!isEditingTheUserProfile}
                        className='h-12'
                        maxLength={200}
                      />
                    </div>
                    <div className='flex flex-col md:flex-row gap-4'>
                      <FormikInput name={'email'} label={'Email'} className='h-12' disabled />
                      <div className='w-full'>
                        <InputMobile
                          name='mobileNumber'
                          className=''
                          label='Mobile Number'
                          classNameLabel='text-textColor text-base font-medium'
                          formik={formik}
                          required={false}
                          isDisable={!isEditingTheUserProfile}
                          countryCode={countryCode}
                          setCountryCode={setCountryCode}
                          value={formik.values.mobileNumber}
                        />
                      </div>
                    </div>
                  </div>
                </ContainerWrapper>
              </div>
            </Page>
          )
        }}
      </Formik>
      <When isTrue={accountPermission?.addEditBrandingDetails?.isViewable}>
        <Formik
          initialValues={getInitialValuesBillingPage(billing, account)}
          onSubmit={handleSubmitForBillingDetails}
          enableReinitialize
          validationSchema={billingDetailsSchema()}
        >
          {(formik) => {
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
              <Page exitConfirmPredicate={formik.dirty} loading={loadingBillingData}>
                <When isTrue={!isInternalUser}>
                  <div className='flex flex-col gap-12 md:w-3/4 mt-4'>
                    <ContainerWrapper
                      title='Branding details'
                      isEditClicked={isEditingBrandingDetails}
                      isSubmitting={formik.isSubmitting}
                      showEditButton={accountPermission?.addEditBrandingDetails?.isEditable}
                      onClickEdit={() => {
                        setIsEditingBrandingDetails(true)
                      }}
                      onClickCancel={() => {
                        formik.resetForm()
                        setBrandProfilePictureUrl(billing?.company_image_url ?? '')
                        setCompanyProfilePictureUrl(billing?.company_brand_profile_picture ?? '')
                        setIsEditingBrandingDetails(false)
                      }}
                      onClickSave={() => {
                        formik.handleSubmit()
                      }}
                    >
                      <div className='flex flex-col gap-4 mb-4'>
                        <When isTrue={isGrowthPlanUser || isStarterPlanUser || isPractice}>
                          <div className='flex flex-col gap-3'>
                            <Header
                              title='Display Name for Patient app'
                              subTitle='By default, this matches your user name and profile picture. You can customize it with your clinic name, logo, or other branding to represent your practice.'
                            />
                            <div className='flex gap-2 text-textColor text-xs font-semibold items-center px-2 py-1 border border-primaryColor rounded-lg w-fit bg-primarySupport'>
                              <InfoIcon color={getColorPalette().primaryColor} />
                              <p>
                                This is how your patients will see you in the app. Personalize it to
                                match your brand.
                              </p>
                            </div>
                            <div className='flex items-center gap-3'>
                              <PhotoUpload
                                id='companyProfilePicture'
                                isEditClicked={isEditingBrandingDetails}
                                onFileChange={(e) => {
                                  handleFileChange(e, 'companyProfilePicture')
                                }}
                                src={companyProfilePictureUrl ?? ''}
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
                                  disabled={!isEditingBrandingDetails}
                                  name={'company_display_name'}
                                  className='py-3'
                                  maxLength={100}
                                />
                              </div>
                            </div>
                          </div>
                        </When>
                        <When
                          isTrue={
                            isDesignLabUser ||
                            isOrganization ||
                            isVendor ||
                            isCustomer ||
                            isGrowthPlanUser
                          }
                        >
                          <div className='flex flex-col gap-3'>
                            <Header
                              title='Lab/Aligner brand name'
                              subTitle='Add your lab or aligner brand name to ensure seamless recognition and collaboration with your team and partners. This name will be visible across communications and shared workflows.'
                            />
                            <div className='flex gap-2 text-textColor text-xs font-semibold items-center px-2 py-1 border border-primaryColor rounded-lg w-fit bg-primarySupport'>
                              <InfoIcon color={getColorPalette().primaryColor} />
                              <p>
                                This will be used to connect with your team and partners. Choose a
                                name that represents your brand.
                              </p>
                            </div>
                            <div className='flex items-center gap-3'>
                              <PhotoUpload
                                id='company_brand_name_profile'
                                onFileChange={(e) => {
                                  formik.setFieldValue('file_brand_action', 'UPDATE')
                                  handleFileBrandNameChange(e, 'company_brand_name_profile')
                                }}
                                isEditClicked={isEditingBrandingDetails}
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
                              />
                              <div className='md:w-1/2 w-full'>
                                <FormikInput
                                  disabled={!isEditingBrandingDetails}
                                  name={'company_brand_name'}
                                  className='py-3'
                                  maxLength={100}
                                />
                              </div>
                            </div>
                          </div>
                        </When>
                      </div>
                    </ContainerWrapper>
                  </div>
                </When>
              </Page>
            )
          }}
        </Formik>
      </When>
      <When isTrue={isStarterPlanUser}>
        <div className='h-[2px] bg-mediumGray md:w-3/4' />
        <div className='flex flex-col md:flex-row justify-between md:w-3/4 mt-6 gap-4'>
          <div>
            <div className='text-base text-black'>Delete your {brand.name} Account?</div>
            <div className='text-sm text-textColor'>
              If you wish to permanently delete your Dental Stack account, please send us a request.
            </div>
          </div>
          <button
            onClick={() => setIsCancelModalOpen(true)}
            className='text-red font-medium px-4 py-2 text-base rounded-lg border border-mediumGray transition self-start md:self-center'
          >
            Request Account Deletion
          </button>
        </div>
      </When>
    </>
  )
}

export default AccountPage
