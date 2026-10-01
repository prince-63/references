import {useFormik} from 'formik'
import {useContext, useState, useEffect} from 'react'
import {useDispatch} from 'react-redux'
import {AuthContext} from '../../context/AuthContext'
import {
  checkButtonStates,
  checkValueOrEmptyString,
  identifyUser,
  isAllowedFileExtension,
  isFileSizeValid,
  safeParseInt,
} from '../../utils/ConstFunctions'
import {getStorageType} from 'utils/storage'
import {
  ERROR_MAIL_FORMAT,
  ERROR_FIRST_NAME,
  ERROR_MIN_2_CHAR,
  ERROR_MIN_5_CHAR,
  ERROR_ONLY_ALPHABETIC,
  ERROR_SINGLE_QUOTE,
  TEXT_UPDATE_DETAILS,
  TEXT_LOADING,
  ERROR_MAX_2048_CHAR,
  ERROR_MAX_200_CHAR,
  ERROR_MAX_255_CHAR,
  ERROR_CONSECUTIVE_SPACE1,
  fieldErrorMessages,
  TEXT_CHAT_PHOTO_VALIDATION_FOR_GALLERY,
} from '../../utils/MessageConstant'
import Button from '../atom/Buttons/Button'
import InputEmail from '../atom/Inputs/InputEmail'
import InputText from '../atom/Inputs/InputText'
import InputTextArea from '../atom/Inputs/InputTextArea'
import * as Yup from 'yup'
import InputMobile from '../atom/Inputs/InputMobile'
import ErrorToast from '../modal/Alert/ErrorToast'
import {SVG_CAMERA, SVG_CROSS, SVG_PENCIL_PRIMARY} from '../../utils/SvgConstants'
import CommonSVG from '../atom/SVG/CommonSVG'
import ModalSuccess from '../modal/Alert/ModalSuccess'
import {URL_UPDATE_PROFILE} from '../../redux/Endpoints/apiEndpoints'
import HttpMethod from '../../@constants/httpMethods.constants'
import apiHelper from '../../@utils/apiHelper'
import {Image} from '../../assets/images/Images/Image'
import {getApiDataDoctorProfile} from '../../redux/Slices/AppSlice/DoctorProfile/DoctorProfileGetSlice'
import {AxiosError} from 'axios'
import hasValue from '../../utils/hasValue'
import heic2any from 'heic2any'
import fileFormatType from '../../@staticData/fileFormatType'
import fileFormatsTypes from '../../@constants/fileFormatsTypes'
import DropdownSimple from '../atom/Dropdown/DropdownSimple'
import useCountryStateCityApi from '../../@hooks/useCountryStateCityApi'
import defaultCountyCode from '../../@constants/defaultCountyCode'
import InfoIcon from 'assets/icons/InfoIcon'
import {Popover} from 'antd'
import getColorPalette from 'utils/getColorPalette'
interface props {
  setIsShowDoctorEdit: (isShowDoctorEdit: boolean) => void
}

const initialValues = {
  firstName: '',
  lastName: '',
  email: '',
  mobileNumber: '',
  city: '',
  state: '',
  country: '',
  description: '',
  isShowDr: true,
}
const schema = Yup.object().shape({
  firstName: Yup.string()
    .min(2, ERROR_MIN_2_CHAR)
    .max(200, ERROR_MAX_200_CHAR)
    .matches(/^[a-zA-Z]+([a-zA-Z]+)*$/, ERROR_ONLY_ALPHABETIC)
    .test('single-quote', ERROR_SINGLE_QUOTE, (value) => {
      if (!value) return true // Allow empty field
      return value.split("'").length <= 2
    })
    .required(ERROR_FIRST_NAME),
  lastName: Yup.string()
    .min(2, ERROR_MIN_2_CHAR)
    .max(200, ERROR_MAX_200_CHAR)
    .matches(/^([a-zA-Z']+ ?){1,3}$/, ERROR_ONLY_ALPHABETIC)
    .optional(),
  email: Yup.string()
    .email(ERROR_MAIL_FORMAT)
    .min(5, ERROR_MIN_5_CHAR)
    .matches(/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/, ERROR_MAIL_FORMAT)
    .matches(
      /^[A-Za-z0-9][A-Za-z0-9._%+-]*@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}$/,
      'Please enter a valid email ID'
    )
    .max(255, ERROR_MAX_255_CHAR)
    .required(ERROR_MAIL_FORMAT),
  mobileNumber: Yup.string().optional(),
  city: Yup.string().min(2, ERROR_MIN_2_CHAR).max(200, ERROR_MAX_200_CHAR).optional(),
  state: Yup.string().min(2, ERROR_MIN_2_CHAR).max(200, ERROR_MAX_200_CHAR).optional(),
  country: Yup.string().min(2, ERROR_MIN_2_CHAR).max(200, ERROR_MAX_200_CHAR).optional(),
  description: Yup.string()
    .optional()
    .min(2, ERROR_MIN_2_CHAR)
    .max(2048, ERROR_MAX_2048_CHAR)
    .matches(/^(?!.*  )/, ERROR_CONSECUTIVE_SPACE1),
  isShowDr: Yup.boolean().optional(),
})

const ModalEditDoctorProfile: React.FC<props> = (props) => {
  const {userId, demoModeStatus} = useContext(AuthContext)
  const {setIsShowDoctorEdit} = props
  const dispatch = useDispatch()
  const [photo, setPhoto] = useState<any>('')
  const [photoForApi, setPhotoForApi] = useState<any>(null)
  const [buttonUpdateDetailsText, setButtonUpdateDetailsText] = useState(TEXT_UPDATE_DETAILS)
  const [success, setSuccess] = useState<boolean>(false)
  const {currentCountryCode} = useContext(AuthContext)
  const [countryCode, setCountryCode] = useState<string>(
    currentCountryCode ?? defaultCountyCode.DEFAULT_COUNTRY_CODE_INDIA
  )

  const profileImageFormats = fileFormatType.GALLERY_FILE_EXTENSIONS
  const allowedExtensions = [
    fileFormatsTypes.C_HEIC,
    fileFormatsTypes.C_HEIF,
    fileFormatsTypes.HEIC,
    fileFormatsTypes.HEIF,
  ]
  useEffect(() => {
    getDoctorData()
  }, [])

  const getDoctorData = () => {
    if (checkValueOrEmptyString(userId) === null) {
      ErrorToast(fieldErrorMessages.TEXT_DOCTOR_ID)
    } else {
      const postData = {
        doctor_id: safeParseInt(userId),
      }
      dispatch(getApiDataDoctorProfile(postData) as any)
        .unwrap()
        .then((res: any) => {
          setCountryCode(res?.country_code)
          hasValue(res?.country_name) && formik.setFieldValue('country', res?.country_name)
          hasValue(res?.state) && formik.setFieldValue('state', res?.state)
          hasValue(res?.city) && formik.setFieldValue('city', res?.city)
          formik.setFieldValue('firstName', res.first_name)
          formik.setFieldValue('lastName', res.last_name)
          formik.setFieldValue('email', res.email?.toLocaleLowerCase())
          formik.setFieldValue('mobileNumber', hasValue(res.mobile) ? res.mobile : '--')
          formik.setFieldValue('isShowDr', res.dr_to_display)
          {
            res.description !== null && formik.setFieldValue('description', res.description)
          }
          setPhoto(res.doctor_profile)
        })
        .catch((error: AxiosError) => {
          console.error(error)
        })
    }
  }

  const formik = useFormik({
    initialValues,
    validationSchema: schema,
    onSubmit: async (values) => {
      setButtonUpdateDetailsText(TEXT_LOADING)
      const postData = {
        doctorId: safeParseInt(userId),
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email?.toLocaleLowerCase(),
        mobile: values.mobileNumber === '--' ? null : values.mobileNumber,
        countryCode: countryCode,
        countryName: values.country,
        state: values.state,
        city: values.city,
        description: values.description,
        isOnBoardScreenVisited: true,
        drToDisplay: values.isShowDr,
      }

      const formData = new FormData()
      formData.append('updateDoctorRequest ', JSON.stringify(postData))
      formData.append('profileImage', photoForApi)

      try {
        await apiHelper(URL_UPDATE_PROFILE, HttpMethod.POST, formData)
          .then((response) => {
            getStorageType().setItem('email', values.email?.toLocaleLowerCase())
            setSuccess(true)
            setTimeout(() => {
              setSuccess(false)
            }, 2000)

            setButtonUpdateDetailsText(TEXT_UPDATE_DETAILS)
            if (response?.data?.status?.message === '') {
              identifyUser()
            }
            if (
              response?.data?.status?.message ===
              "The doctor's data was not updated. There appears to be an issue with the request data."
            ) {
              ErrorToast(response?.data?.status?.message)
            }
          })
          .catch((error) => {
            setButtonUpdateDetailsText(TEXT_UPDATE_DETAILS)
            console.error(error)
          })
      } catch (error) {
        console.error(error)
        setButtonUpdateDetailsText(TEXT_UPDATE_DETAILS)
      }
    },
  })

  useCountryStateCityApi({
    formik,
    dispatch,
    isNew: true,
  })

  const handleFileSelect = async (event: any) => {
    const photo = event?.target?.files[0]
    if (isAllowedFileExtension(photo.name, profileImageFormats)) {
      if (isFileSizeValid(photo, 15)) {
        if (allowedExtensions.includes(photo.name?.slice(-4).toLocaleLowerCase())) {
          const fileInput = event.target
          const blob: any = await heic2any({
            blob: fileInput.files[0],
            toType: 'image/jpeg',
          })
          const convertedPhoto = URL.createObjectURL(
            new File([blob], fileInput.files[0].me, {type: 'image/jpeg'})
          )
          setPhotoForApi(photo)
          setPhoto(convertedPhoto)
        } else {
          const reader = new FileReader()
          setPhotoForApi(photo)
          reader.onload = function (e: any) {
            setPhoto(e.target.result)
          }
          reader.readAsDataURL(photo)
        }

        identifyUser()
      } else {
        ErrorToast('Please upload photos with a maximum size of 15 MB')
      }
    } else {
      ErrorToast(TEXT_CHAT_PHOTO_VALIDATION_FOR_GALLERY)
    }
  }
  const content = (
    <div className='w-[370px] z-[10000px] break-words'>
      <p>
        Enable this feature to display 'Dr.' as a prefix before your name everywhere on the
        platform. If you're representing a company or brand, it's recommended to keep this feature
        turned off.
      </p>
    </div>
  )
  return (
    <>
      {success && (
        <ModalSuccess
          setIsSuccessModelOpen={setIsShowDoctorEdit}
          title={'Your personal details have been successfully updated!'}
        />
      )}
      <div className='fixed left-0 top-0 z-[1055] h-full w-full flex justify-center items-center bg-black bg-opacity-40'>
        <div className='bg-white w-96 rounded-lg p-6 shadow-lg  min-w-[40%] max-h-[98%] overflow-y-scroll'>
          <div className='flex justify-between items-center'>
            <div className='w-12 h-12 bg-primarySupport rounded-full flex justify-center items-center'>
              <CommonSVG svg={SVG_PENCIL_PRIMARY} width='24' height='24' />
            </div>
            <div
              onClick={() => setIsShowDoctorEdit(false)}
              className='flex justify-center items-center'
            >
              <CommonSVG svg={SVG_CROSS} width='38' height='38' />
            </div>
          </div>
          <form onSubmit={formik.handleSubmit} className='w-full'>
            <div className='text-black text-2xl font-semibold mt-2'>Edit your details</div>
            <div>
              <div
                className={`flex items-center justify-center mt-4 ${
                  demoModeStatus ? 'pointer-events-none' : ''
                }`}
              >
                <label>
                  <div className='w-[88px] h-[88px] rounded-full border border-black border-opacity-20 flex items-center justify-center'>
                    <div className='w-[66px] h-[66px] rounded-full border border-mediumGray bg-mediumGray border-opacity-20 flex items-center justify-center overflow-hidden'>
                      {photo == null || photo == '' || photo == undefined || photo == 'N/A' ? (
                        <div
                          className='w-6'
                          onClick={() => {
                            identifyUser()
                          }}
                        >
                          <CommonSVG svg={SVG_CAMERA} width='26' height='26' />
                        </div>
                      ) : (
                        <Image
                          src={photo}
                          alt='Profile-Pic'
                          className='w-[66px] h-[66px] rounded full object-cover'
                        />
                      )}
                    </div>
                    <input
                      style={{display: 'none'}}
                      type='file'
                      id='image'
                      accept='.jpg, .jpeg, .png, .heic'
                      onChange={handleFileSelect}
                    ></input>
                  </div>
                  <div className='text-textColor text-sm font-semibold text-center mt-2 cursor-pointer'>
                    Add photo
                  </div>
                </label>
              </div>

              <div className='flex justify-center items-center mt-2'>
                <div className=' flex justify-center items-center bg-primarySupport w-[283px] h-[26px] gap-1 rounded'>
                  <InfoIcon color={getColorPalette().primaryColor} height='16' width='16' />
                  <div className='text-primaryColor text-xs'>
                    Tip: Upload a square image, up to 20 MB
                  </div>
                </div>
              </div>

              <div className='mt-7'>
                <div className='relative mt-4'>
                  <InputText
                    name='firstName'
                    className='pl-14'
                    label='Your First Name'
                    classNameLabel='text-textColor text-sm font-medium'
                    formik={formik}
                    required={true}
                  />

                  <div className='absolute top-[31px] left-3 border-r w-8 text-textColor text-base font-normal h-9 pt-[6px]'>
                    Dr.
                  </div>
                  <div className=' flex gap-1 justify-start items-center'>
                    <input
                      type='checkbox'
                      id={'acceptTerms'}
                      name={'acceptTerms'}
                      checked={formik.values.isShowDr}
                      onChange={() => {
                        formik.setFieldValue('isShowDr', !formik.values.isShowDr)
                      }}
                      onBlur={formik.handleBlur}
                      className='min-w-[18px] min-h-[18px] cursor-pointer green-checkbox'
                    />
                    <div className='text-textColor font-semibold text-xs'>Display Dr. in name</div>
                    <Popover
                      content={content}
                      title='Display Dr. before name'
                      // getPopupContainer={(trigger) => trigger.parentNode!} // Ensures Popover is rendered relative to the parent
                    >
                      <div>
                        <InfoIcon color={'#666666'} height='16' width='16' />
                      </div>
                    </Popover>
                  </div>
                </div>
                <div className='mt-4'>
                  <InputText
                    name='lastName'
                    className=''
                    label='Your Last Name'
                    classNameLabel='text-textColor text-sm font-medium'
                    formik={formik}
                    required={false}
                  />
                </div>

                <div className='mt-4 relative'>
                  <InputEmail
                    name='email'
                    className=''
                    label='Email'
                    classNameLabel='text-textColor text-sm font-medium'
                    formik={formik}
                    required={true}
                    isDisabled={true}
                  />
                </div>

                <div className={`mt-4 relative ${demoModeStatus ? 'pointer-events-none' : ''}`}>
                  <div className='relative'>
                    <div className='relative'>
                      <InputMobile
                        name='mobileNumber'
                        className=''
                        label='Mobile Number'
                        classNameLabel='text-sm text-textColor font-medium'
                        formik={formik}
                        required={true}
                        isDisable={true}
                        countryCode={countryCode}
                        setCountryCode={setCountryCode}
                        value={formik.values.mobileNumber}
                      />
                    </div>
                  </div>
                </div>

                <div className='flex md:flex-row flex-col gap-2 mt-4'>
                  <div className='md:w-1/2 w-full'>
                    <DropdownSimple
                      name='country'
                      className=''
                      label='Country'
                      classNameLabel='text-sm text-textColor font-medium'
                      formik={formik}
                      required={false}
                      placeholder='Select a Country'
                      value={formik.getFieldProps('country').value}
                      dispatch={dispatch}
                    />
                  </div>
                  <div className='md:w-1/2 w-full'>
                    <DropdownSimple
                      name='state'
                      className=''
                      label='State'
                      classNameLabel='text-sm text-textColor font-medium'
                      formik={formik}
                      required={false}
                      placeholder='Select a State'
                      value={formik.getFieldProps('state').value}
                      dispatch={dispatch}
                    />
                  </div>
                </div>

                <div className='flex md:flex-row flex-col gap-2 mt-4'>
                  <div className='md:w-1/2 w-full'>
                    <DropdownSimple
                      name='city'
                      className=''
                      label='City'
                      classNameLabel='text-sm text-textColor font-medium'
                      formik={formik}
                      required={false}
                      placeholder='Select a City'
                      value={formik.getFieldProps('city').value}
                      dispatch={dispatch}
                    />
                  </div>
                  <div className='w-1/2'></div>
                </div>
                <div className='mt-4 '>
                  <InputTextArea
                    name='description'
                    className='h-[150px]'
                    label='About doctor (Optional)'
                    classNameLabel='text-textColor text-sm font-medium'
                    formik={formik}
                    required={false}
                    placeholder={`Sharing something about you helps patients understand your experience and resonate with your philosophy to build trust laying the foundation for a smooth treatment ahead.
You can share your:
 →  Background, experience, medical philosophy, and services you offer.
 →  Highlight career achievements and unwavering dedication to patient well-being.`}
                  />
                </div>
              </div>
            </div>

            <div
              className={`flex justify-center mt-6 ${demoModeStatus ? 'pointer-events-none' : ''}`}
            >
              <div className='w-full'>
                <Button
                  text={buttonUpdateDetailsText}
                  isDisabled={checkButtonStates(buttonUpdateDetailsText)}
                  className={'h-12 mt-2 font-semibold'}
                />
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}

export default ModalEditDoctorProfile
