import {FC, useContext, useEffect, useState} from 'react'
import LabelTitle from '../../../components/atom/Labels/LabelTitle'
import Button from '../../../components/atom/Buttons/Button'
import InputText from '../../../components/atom/Inputs/InputText'
import InputTextArea from '../../../components/atom/Inputs/InputTextArea'
import {TEXT_ADD_CLINIC, TEXT_LOADING, TEXT_UPDATE_CLINIC} from '../../../utils/MessageConstant'
import * as Yup from 'yup'
import {useFormik} from 'formik'
import InputEmail from '../../../components/atom/Inputs/InputEmail'
import {useDispatch} from 'react-redux'
import {postApiDataAddPracticeLocation} from '../../../redux/Slices/AppSlice/PracticeLocation/addPracticeLocationSlice'
import {AuthContext} from '../../../context/AuthContext'
import {checkButtonStates, identifyUser, safeParseInt} from '../../../utils/ConstFunctions'
import {practiceLocationValidation} from '../../../utils/ConstantValidations'
import ErrorToast from '../../../components/modal/Alert/ErrorToast'

import {SVG_CLINIC_PRIMARY, SVG_CROSS} from '../../../utils/SvgConstants'
import CommonSVG from '../../../components/atom/SVG/CommonSVG'
import BackGroundSVG from '../../../components/atom/SVG/BackGroundSVG'
import {URL_GET_GOOGLE_MAPS_DATA} from '../../../redux/Endpoints/apiEndpoints'
import InputGoogleSearch from '../../../components/atom/Inputs/InputGoogleSearch'
import {postApiDataEditPracticeLocation} from '../../../redux/Slices/AppSlice/PracticeLocation/editPracticeLocationSlice'
import hasValue from 'utils/hasValue'
import ModalLayout from 'components/modal/ModalLayout'

interface invitePatientProps {
  setIsAddPracticeLocationModelOpen: any
  clinicData: any
  setIsEditPracticeLocationModelOpen: any
  isNew: boolean
  setSuccessTitle: (msg: string) => void
  setPracticeLocationName: (practiceLocationName: string) => void
}
interface ApiGetData {
  data: object // Define your POST request data type here
}
const initialValues = {
  practiceLocationName: '',
  emailId: '',
  mobileNumber: '',
  address: '',
  city: '',
  pincode: '',
  country: '',
  state: '',
  websiteUrl: '',
}
const schema = Yup.object().shape(practiceLocationValidation)

const AddPracticeLocation: FC<invitePatientProps> = (props) => {
  const {
    setIsAddPracticeLocationModelOpen,
    clinicData,
    isNew,
    setSuccessTitle,
    setPracticeLocationName,
  } = props
  const [locationDirection, setLocationDirection] = useState('')
  const {userId, userDetail} = useContext(AuthContext)

  const [buttonAddClinicText, setButtonAddClinicText] = useState(
    isNew ? TEXT_ADD_CLINIC : TEXT_UPDATE_CLINIC
  )
  const userData: any = userDetail
  const dispatch = useDispatch()

  useEffect(() => {
    if (!isNew) {
      formik.setFieldValue('practiceLocationName', clinicData.practice_location_name)
      formik.setFieldValue('address', clinicData.address)
      hasValue(clinicData.country) && formik.setFieldValue('country', clinicData.country)
      hasValue(clinicData.state) && formik.setFieldValue('state', clinicData.state)
      hasValue(clinicData.city) && formik.setFieldValue('city', clinicData.city)
      hasValue(clinicData.mobile_number) &&
        formik.setFieldValue('mobileNumber', clinicData.mobile_number)
      hasValue(clinicData.pin_code) && formik.setFieldValue('pincode', clinicData.pin_code)
      hasValue(clinicData.website_url) && formik.setFieldValue('websiteUrl', clinicData.website_url)
      hasValue(clinicData.email_id) && formik.setFieldValue('emailId', clinicData.email_id)
    }
  }, [isNew])

  const formik = useFormik({
    initialValues,
    validationSchema: schema,
    onSubmit: async (values) => {
      setButtonAddClinicText(TEXT_LOADING)
      if (isNew) {
        identifyUser()

        setPracticeLocationName(
          values.practiceLocationName !== undefined ? values.practiceLocationName : ''
        )

        const postData: ApiGetData = {
          data: {
            practice_location_name: values.practiceLocationName,
            mobile_number: values.mobileNumber,
            emailId: values.emailId,
            address: values.address,
            city: values.city,
            state: values.state,
            pin_code: values.pincode,
            country: values.country,
            google_map_url: locationDirection,
            website_url: values.websiteUrl,
            doctor_id: safeParseInt(userId),
          },
        }
        dispatch(postApiDataAddPracticeLocation(postData) as any)
          .unwrap()
          .then(() => {
            setButtonAddClinicText(TEXT_ADD_CLINIC)
            setIsAddPracticeLocationModelOpen(false)
            setSuccessTitle('Practice location added successfully!')

            identifyUser()
          })
          .catch((error: any) => {
            setButtonAddClinicText(TEXT_ADD_CLINIC)
            if (
              error ===
              `Clinic name already exists: ${formik.getFieldProps('practiceLocationName').value}`
            ) {
              formik.setFieldError(
                'practiceLocationName',
                'Practice Location with the same name already exists. Please change the name or add another practice location.'
              )
            } else {
              ErrorToast(error)
            }
          })
      } else {
        identifyUser()

        const postData: ApiGetData = {
          data: {
            practice_location_id: clinicData.practice_location_id,
            practice_location_name: values.practiceLocationName,
            mobile_number: values.mobileNumber,
            email_id: values.emailId,
            address: values.address,
            city: values.city,
            state: values.state,
            country: values.country,
            google_map_url: locationDirection,
            website_url: values.websiteUrl,
            doctor_id: safeParseInt(userId),
            doctor_name: userData?.first_name + ' ' + userData?.last_name,
            user_id: safeParseInt(userId),
            practice_location_doctor_name: userData?.first_name + ' ' + userData?.last_name,
            pincode: values.pincode,
            practice_location_type: clinicData.practice_location_type,
            active: clinicData.active,
          },
        }
        dispatch(postApiDataEditPracticeLocation(postData) as any)
          .unwrap()
          .then(() => {
            setButtonAddClinicText(TEXT_UPDATE_CLINIC)
            setIsAddPracticeLocationModelOpen(false)
            setSuccessTitle('Practice location details have been updated!')
          })
          .catch((error: any) => {
            setButtonAddClinicText(TEXT_UPDATE_CLINIC)
            const errorMessage = error.status.message
            if (
              errorMessage ===
              `${formik.getFieldProps('practiceLocationName').value} Clinic name already exist`
            ) {
              formik.setFieldError(
                'practiceLocationName',
                'Practice Location with the same name already exists. Please change the name or add another practice location.'
              )
            } else {
              ErrorToast(error)
            }
          })
      }
    },
  })

  const handleInputChange = (value: any) => {
    getDetails(value)
  }

  const getDetails = (value: any) => {
    const placeId = value?.value?.place_id // Replace with the selected place ID

    fetch(URL_GET_GOOGLE_MAPS_DATA(placeId))
      .then((response) => response.json())
      .then((data) => {
        // Check if the place is in India
        const placeDetails = data.result
        formik.setFieldValue('practiceLocationName', placeDetails.name, false)
        formik.setFieldValue('address', placeDetails.formatted_address, false)
        formik.setFieldValue(
          'mobileNumber',
          placeDetails.international_phone_number != undefined
            ? String(placeDetails.international_phone_number).replace(/^0|\s/g, '')
            : ''
        )
        formik.setFieldValue('websiteUrl', placeDetails.website)
        setLocationDirection(placeDetails.url)
        const addressList = placeDetails?.address_components
        addressList.forEach((address: any) => {
          const addressTypes = address.types
          addressTypes.forEach((addressType: any) => {
            if (addressType.includes('country')) {
              formik.setFieldValue('country', address.long_name)
            }
            if (addressType.includes('administrative_area_level_1')) {
              formik.setFieldValue('state', address.long_name)
            }
            if (addressType.includes('locality')) {
              formik.setFieldValue('city', address.long_name)
            }
            if (addressType.includes('postal_code')) {
              formik.setFieldValue('pincode', address.long_name)
            }
          })
        })
      })
      .catch((error) => {
        console.error(error)
      })
  }

  return (
    <ModalLayout
      className='md:w-[55%] rounded-lg md:px-6 px-3 md:pt-6 pt-4 shadow-lg max-h-screen overflow-y-scroll'
      isResponsive={true}
    >
      <form onSubmit={formik.handleSubmit}>
        <div className='flex justify-between item-center mb-5'>
          <BackGroundSVG
            svg={SVG_CLINIC_PRIMARY}
            width='26'
            height='26'
            className='w-12 h-12 bg-primarySupport rounded-full'
          />
          <div
            onClick={() => {
              setIsAddPracticeLocationModelOpen(false)
            }}
            className='cursor-pointer'
          >
            <CommonSVG svg={SVG_CROSS} width='48' height='48' />
          </div>
        </div>
        <div className='flex flex-shrink-0 items-center justify-between rounded-t-md mb-4'>
          <div>
            <h1 className='font-semibold text-xl'>{`${
              isNew ? 'Add' : 'Edit'
            } practice location`}</h1>
            <div className='text-textColor text-[16px] font-normal'>
              Use Google to find a clinic or enter clinic details manually.
            </div>{' '}
          </div>
        </div>

        <div className='md:mt-6 md-3'>
          <div className='grid md:grid-cols-2 gap-4 mt-4'>
            <div className='w-full'>
              <div className=''>
                <div className='md:block hidden'>
                  <LabelTitle
                    title='Find your clinic on Google'
                    required={false}
                    className='text-sm text-textColor font-mediumText-textColor font-medium'
                  />{' '}
                </div>
                <InputGoogleSearch handleInputChange={handleInputChange} />
              </div>
            </div>
            <div className='w-full'>
              <InputText
                name='practiceLocationName'
                className=''
                label='Clinic’s Name'
                classNameLabel='text-sm text-textColor font-medium'
                formik={formik}
                required={true}
                maxLength={255}
              />
            </div>
          </div>
          <div className='mt-4'>
            <InputTextArea
              name='address'
              className='max-h-28 h-28'
              label='Clinic’s Address'
              classNameLabel='text-sm text-textColor font-medium '
              formik={formik}
              required={true}
              maxLength={500}
              minLength={5}
            />
          </div>
          <div className='grid md:grid-cols-2 md:gap-4 mt-4'>
            <div className='w-full'>
              <InputText
                name='city'
                type='text'
                className=''
                label='City'
                classNameLabel='text-sm text-textColor font-medium'
                formik={formik}
                required={false}
                maxLength={50}
              />
            </div>
            <div className='w-full'>
              <InputText
                name='state'
                type='text'
                className=''
                label='State'
                classNameLabel='text-sm text-textColor font-medium'
                formik={formik}
                required={false}
                maxLength={50}
              />
            </div>
          </div>
          <div className='grid md:grid-cols-3 grid-cols-2 gap-4'>
            <div className='w-full'>
              <InputText
                name='pincode'
                className=''
                label='PIN code'
                classNameLabel='text-sm text-textColor font-medium'
                formik={formik}
                required={false}
                maxLength={10}
              />
            </div>
            <div className='w-full'>
              <InputText
                name='country'
                type='text'
                className=''
                label='Country'
                classNameLabel='text-sm text-textColor font-medium'
                formik={formik}
                required={false}
                maxLength={50}
              />
            </div>
            <div className='w-full md:col-span-1 col-span-2'>
              <InputText
                name='mobileNumber'
                className=''
                label='Clinic Phone no.'
                classNameLabel='text-sm text-textColor font-medium'
                formik={formik}
                required={false}
                maxLength={15}
              />
            </div>
          </div>
          <div className='grid md:grid-cols-2 mt-4 gap-4'>
            <div className='w-full'>
              <InputEmail
                name='emailId'
                className=''
                label='Email'
                classNameLabel='text-sm text-textColor font-medium'
                formik={formik}
                required={false}
                maxLength={50}
              />
            </div>
            <div className='w-full'>
              <InputText
                name='websiteUrl'
                className=''
                label='Website URL'
                classNameLabel='text-sm text-textColor font-medium'
                formik={formik}
                required={false}
                maxLength={100}
              />
            </div>
          </div>
        </div>

        <div className='flex justify-center mt-3'>
          <div className='md:w-2/3 w-full'>
            <Button
              text={buttonAddClinicText}
              isDisabled={checkButtonStates(buttonAddClinicText)}
              className={'h-11 mt-2 w-1/2'}
            />
          </div>
        </div>
      </form>
    </ModalLayout>
  )
}

export default AddPracticeLocation
