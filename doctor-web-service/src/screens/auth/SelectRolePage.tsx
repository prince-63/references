import {useFormik} from 'formik'
import * as Yup from 'yup'
import clsx from 'clsx'
import rolesConstants from '@constants/roles.constants'
import NotFilledRadioIcon from 'assets/icons/NotFilledRadioIcon'
import Tag from 'components/tags/Tag'
import SuitCaseIcon from 'assets/icons/SuitCaseIcon'
import MicroscopeIcon from 'assets/icons/MicroscopeIcon'
import WarehouseIcon from 'assets/icons/WarehouseIcon'
import AntdButton from 'components/atom/Buttons/AntdButton'
import getColorPalette from 'utils/getColorPalette'
import CheckedCircleIcon from 'assets/icons/CheckedCircleIcon'
import {useContext, useEffect} from 'react'
import {AuthContext} from 'context/AuthContext'
import {useDispatch} from 'react-redux'
import {
  ApiResponseDoctorProfile,
  getApiDataDoctorProfile,
} from 'redux/Slices/AppSlice/DoctorProfile/DoctorProfileGetSlice'
import {identifyUser} from 'utils/ConstFunctions'
import {AxiosError} from 'axios'
import ErrorToast from 'components/modal/Alert/ErrorToast'
import {useLocation, useNavigate} from 'react-router-dom'
import hasValue from 'utils/hasValue'
import {
  postApiDataSignupLogin,
  setReactNativeSignupResponse,
} from 'redux/Slices/AuthSlice/signupLoginSlice'
import {postApiDataAppleStepTwo} from 'redux/Slices/AuthSlice/appleStepTwoSlice'
import {postApiDataGoogleStepTwo} from 'redux/Slices/AuthSlice/googleStepTwoSlice'
import {getStorageType} from 'utils/storage'

interface RoleType {
  id: number
  label: string
  Icon: any
  subTitle: string
  showComingSoon: boolean
  value: keyof typeof rolesConstants
  disabled: boolean
}

export const selectRoleList: RoleType[] = [
  {
    id: 1,
    label: 'Clinic / Doctor',
    subTitle:
      'For clinics or doctors that send aligner orders to labs and don’t have an in-house setup.',
    Icon: SuitCaseIcon,
    showComingSoon: false,
    value: rolesConstants.CONSULTING_ORTHODONTIST,
    disabled: false,
  },
  {
    id: 2,
    label: 'In-house Lab setup',
    subTitle:
      'For clinics that decide at the case level whether to plan or produce aligners internally.',
    Icon: WarehouseIcon,
    showComingSoon: false,
    value: rolesConstants.IN_OFFICE_MANUFACTURER,
    disabled: false,
  },
  {
    id: 3,
    label: 'Aligner Lab',
    subTitle:
      'For labs offering aligner planning and/or manufacturing services to multiple doctors or labs.',
    Icon: MicroscopeIcon,
    showComingSoon: false,
    value: rolesConstants.ENTERPRISE_COMPANY_LAB,
    disabled: false,
  },
]

const initialValues = {
  roles: [] as (keyof typeof rolesConstants)[],
}

const schema = Yup.object().shape({
  roles: Yup.array().of(Yup.string()).min(1, 'Select at least one role'),
})

const SelectRolePage = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const {postData = null, type = null} = location.state ?? {}

  useEffect(() => {
    if (!hasValue(postData)) {
      navigate('/', {
        replace: true,
      })
    }
    return () => {
      window.history.replaceState({}, '')
    }
  }, [])
  const {registrationSetup} = useContext(AuthContext)
  const dispatch = useDispatch()
  const callPostSignUpPatientSetupId = (response: any) => {
    const postData = {
      doctor_id: response?.user_id,
    }
    dispatch(getApiDataDoctorProfile(postData) as any)
      .unwrap()
      .then((res: ApiResponseDoctorProfile) => {
        const userDetails = res
        getStorageType().setItem('userDetail', JSON.stringify(userDetails))

        getStorageType().setItem('isGettingStartedOpen', 'true')

        getStorageType().setItem('userToken', response?.token)
        getStorageType().setItem('lastRefreshTime', new Date().toISOString())
        getStorageType().setItem('userId', String(response?.user_id))
        getStorageType().setItem('subRoleId', String(userDetails?.default_profile?.subrole_id))
        getStorageType().setItem('profileId', String(userDetails?.default_profile?.profile_id))
        getStorageType().setItem(
          'organizationId',
          String(userDetails?.default_profile?.organization_id)
        )
        getStorageType().setItem('email', String(response?.email?.toLocaleLowerCase()))
        registrationSetup()
        //@ts-ignore
        window.fcWidget.show()
        identifyUser()
      })
      .catch((error: AxiosError) => {
        ErrorToast('The Server is facing some issues. Please try again later!')
        throw error
      })
  }
  const callSimpleSignup = async (postData: any) => {
    await dispatch(postApiDataSignupLogin(postData) as any)
      .unwrap()
      .then((response: any) => {
        getStorageType().setItem('userToken', response.token)

        dispatch(setReactNativeSignupResponse(response))
        if (hasValue(getStorageType().getItem('userToken'))) {
          callPostSignUpPatientSetupId(response)
        }
      })
      .catch((error: AxiosError) => {
        throw error
      })
  }

  // if Google Signup
  const callGoogleSignUpStepTwo = async (postData: any) => {
    await dispatch(postApiDataGoogleStepTwo(postData) as any)
      .unwrap()
      .then((response: any) => {
        getStorageType().setItem('userToken', response.token)

        dispatch(setReactNativeSignupResponse(response))
        if (hasValue(getStorageType().getItem('userToken'))) {
          callPostSignUpPatientSetupId(response)
        }
      })
      .catch((error: any) => {
        ErrorToast('The Server is facing some issues. Please try again later.')
        throw error
      })
  }

  // if Apple Signup
  const callAppleSignUpStepTwo = async (postData: any) => {
    await dispatch(postApiDataAppleStepTwo(postData) as any)
      .unwrap()
      .then((response: any) => {
        getStorageType().setItem('userToken', response.token)

        dispatch(setReactNativeSignupResponse(response))
        if (hasValue(getStorageType().getItem('userToken'))) {
          callPostSignUpPatientSetupId(response)
        }
      })
      .catch((error: any) => {
        ErrorToast('The Server is facing some issues. Please try again later.')
        throw error
      })
  }
  const formik = useFormik({
    initialValues: initialValues,
    validateOnMount: true,
    validationSchema: schema,
    onSubmit: async (values) => {
      try {
        const signUpData = {
          ...postData,
          data: {
            ...postData.data,
            roles: values.roles,
          },
        }
        if (type === 'SIMPLE') {
          await callSimpleSignup(signUpData)
        } else if (type === 'GOOGLE') {
          await callGoogleSignUpStepTwo(signUpData)
        } else if (type === 'APPLE') {
          await callAppleSignUpStepTwo(signUpData)
        }
      } catch (error) {
        throw error
      }
    },
  })

  const handleRoleSelection = (value: keyof typeof rolesConstants) => {
    formik.setFieldValue('roles', [value])
  }

  return (
    <div className='min-h-screen p-3 flex items-center justify-center w-full'>
      <form onSubmit={formik.handleSubmit} className=''>
        <div className='text-center text-black text-[32px] font-bold '>Select your role</div>
        <p className='text-center text-textColor text-[16px] font-normal'>
          Select one or more roles to explore customized offerings.
        </p>
        <div className='flex items-center justify-center mt-8'>
          <div className='flex flex-col gap-2'>
            {selectRoleList.map((option) => {
              const ItemIcon = option.Icon
              const isSelected = formik.values.roles.includes(option.value)
              const isDisabled = option.disabled
              const showComingSoon = isDisabled && option.showComingSoon

              return (
                <button
                  key={option.value}
                  type='button'
                  className={clsx(
                    'max-w-[500px] px-4 py-3 border rounded-lg',
                    isSelected ? 'border-primaryColor' : 'text-textColor border-mediumGray'
                  )}
                  onClick={() => {
                    if (!isDisabled) {
                      handleRoleSelection(option.value)
                    }
                  }}
                >
                  <div className='flex gap-3 justify-between items-center'>
                    <div className='flex gap-3 justify-start items-center'>
                      <div
                        className={clsx(
                          'min-w-12 h-12 rounded-full flex justify-center items-center',
                          isSelected ? 'bg-primarySupport' : 'border border-mediumGray',
                          isDisabled && 'opacity-50'
                        )}
                      >
                        <ItemIcon color={!isDisabled && isSelected ? '#735BF2' : '#666666'} />
                      </div>
                      <div className='flex flex-col justify-start items-start'>
                        <div className='flex gap-2 flex-wrap items-center'>
                          <div
                            className={clsx(
                              'md:text-lg text-[16px] font-semibold text-left text-black ',
                              isDisabled && 'text-grayDisabled'
                            )}
                          >
                            {option.label}
                          </div>
                          {showComingSoon && (
                            <Tag
                              value='COMING SOON'
                              className='text-[12px] font-semibold bg-primarySupport text-primaryColor px-2 py-1'
                            />
                          )}
                        </div>
                        <div
                          className={clsx(
                            'md:text-[16px] text-sm text-textColor text-left',
                            isDisabled && '!text-grayDisabled'
                          )}
                        >
                          {option.subTitle}
                        </div>
                      </div>
                    </div>
                    <div className={clsx(isDisabled && 'opacity-50')}>
                      {isSelected ? (
                        <CheckedCircleIcon color={getColorPalette().primaryColor} />
                      ) : (
                        <NotFilledRadioIcon color='#666666' />
                      )}
                    </div>
                  </div>
                </button>
              )
            })}
            <div className='w-full flex items-center justify-center'>
              <AntdButton
                className='bg-primaryColor text-white h-12 font-semibold text-base w-full'
                text='Continue'
                disabled={!formik.isValid}
                loading={formik.isSubmitting}
                onClick={() => {
                  formik.handleSubmit()
                }}
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

export default SelectRolePage
