import {useFormik} from 'formik'
import * as Yup from 'yup'
import clsx from 'clsx'
import rolesConstants from '@constants/roles.constants'
import NotFilledRadioIcon from 'assets/icons/NotFilledRadioIcon'
import Tag from 'components/tags/Tag'
import AntdButton from 'components/atom/Buttons/AntdButton'
import getColorPalette from 'utils/getColorPalette'
import CheckedCircleIcon from 'assets/icons/CheckedCircleIcon'
import {useContext, useEffect, useState} from 'react'
import {AuthContext} from 'context/AuthContext'
import {safeParseInt} from 'utils/ConstFunctions'
import {useNavigate} from 'react-router-dom'
import {postAddProfile} from 'redux/Slices/AuthSlice/signupLoginSlice'
import useDispatchAction from '@hooks/useDispatchAction'
import {RootState} from 'redux/store'
import {useSelector} from 'react-redux'
import {selectRoleList} from 'screens/auth/SelectRolePage'

const initialValues = {
  roles: [] as (keyof typeof rolesConstants)[],
}

const schema = Yup.object().shape({
  roles: Yup.array().of(Yup.string()).min(1, 'Select at least one role'),
})

const AddProfileSelectRole = () => {
  const navigate = useNavigate()
  const {userId} = useContext(AuthContext)
  const {dispatchAction} = useDispatchAction()
  const [rolesList, setRolesList] = useState(selectRoleList)
  const {doctorData} = useSelector((state: RootState) => state.apiDoctorProfileGet)
  const profileList = doctorData.profiles
  const presentDoctorRolesList = profileList.flatMap((item) =>
    (item?.roles ?? []).map((role) => role.name)
  )
  const getUpdatedRoleList = (presentDoctorRolesList: string[]) => {
    return selectRoleList.map((role) => ({
      ...role,
      disabled:
        presentDoctorRolesList.includes(role.value) || rolesConstants.INSTITUTIONS === role.value,
    }))
  }

  useEffect(() => {
    const presentRolesList = getUpdatedRoleList(presentDoctorRolesList)
    setRolesList(presentRolesList)
  }, [])

  const formik = useFormik({
    initialValues: initialValues,
    validateOnMount: true,
    validationSchema: schema,
    onSubmit: async (values) => {
      try {
        const payload = {roles: values.roles, doctor_id: safeParseInt(userId)}
        dispatchAction(postAddProfile(payload))
          .unwrap()
          .then(() => {
            navigate('/')
          })
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
            {rolesList.map((option) => {
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

export default AddProfileSelectRole
