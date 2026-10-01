import * as Yup from 'yup'
import {Formik} from 'formik'
import {useContext} from 'react'
import SuccessToast from 'components/modal/Alert/SuccessToast'
import {
  addOrEditPractices,
  setOpenModalInvitePractice,
} from 'redux/Slices/AppSlice/Practices/practices.slice'
import {emailRegex, safeParseInt} from 'utils/ConstFunctions'
import {ERROR_MAIL_FORMAT, ERROR_MIN_5_CHAR, ERROR_MAX_200_CHAR} from 'utils/MessageConstant'
import useDispatchAction from '@hooks/useDispatchAction'
import {RootState} from 'redux/store'
import {useSelector} from 'react-redux'
import {AuthContext} from 'context/AuthContext'
import FormikInput from 'components/atom/Inputs/FormikInput'
import InfoIcon from 'assets/icons/InfoIcon'
import getColorPalette from 'utils/getColorPalette'
import {useNavigate} from 'react-router-dom'
import rolesConstants from '@constants/roles.constants'
import ModalCard from 'components/modalCard/ModalCard'
import CheckedCircleOutlineIcon from 'assets/icons/CheckedCircleOutlineIcon'
const schema = () =>
  Yup.object().shape({
    email: Yup.string()
      .nullable()
      .email(ERROR_MAIL_FORMAT)
      .min(5, ERROR_MIN_5_CHAR)
      .max(200, ERROR_MAX_200_CHAR)
      .matches(emailRegex, ERROR_MAIL_FORMAT)
      .required(ERROR_MAIL_FORMAT),
  })

const ModalInvitePractice = () => {
  const navigate = useNavigate()
  const {openModalInvitePractice} = useSelector((state: RootState) => state.practices)
  const {userId, organizationId, profileId} = useContext(AuthContext)
  const {dispatchAction} = useDispatchAction()
  const {dataAddingEditPractice} = useSelector((state: RootState) => state.practices)

  const initialValues = {
    email: dataAddingEditPractice.email?.toLocaleLowerCase(),
  }

  const handleSubmit = async (
    values: {email: string},
    {setFieldError}: {setFieldError: (field: string, message: string) => void}
  ) => {
    try {
      await dispatchAction(
        addOrEditPractices({
          organization_id: safeParseInt(organizationId),
          profile_id: safeParseInt(profileId),
          doctor_id: safeParseInt(userId),
          email: values.email?.toLocaleLowerCase(),
          first_name: dataAddingEditPractice.first_name,
          last_name: dataAddingEditPractice.last_name,
          mobile_no: dataAddingEditPractice.mobile_no,
          country_code: dataAddingEditPractice.country_code,
          salutation: dataAddingEditPractice.salutation,
          doctor_role: rolesConstants.CONSULTING_ORTHODONTIST,
          invitation_id: dataAddingEditPractice.invitation_id,
          is_invitation_send: true,
        })
      )
        .unwrap()
        .then(() => {
          dispatchAction(setOpenModalInvitePractice(false))
          SuccessToast('Invite sent successfully!')
          const queryParams = new URLSearchParams({
            invitation: 'true',
          }).toString()
          navigate(`/practices?${queryParams}`)
        })
        .catch((error: string) => {
          if (error === 'IN0003' || error === 'IN0005') {
            setFieldError('email', 'Duplicate profile already exists') // Custom error for the email field
          }
        })
    } catch (error) {
      throw error
    }
  }

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={handleSubmit}
      enableReinitialize
      validationSchema={schema}
    >
      {(formik) => {
        return (
          <ModalCard
            title='Invite practice'
            subTitle='Confirm practice’s contact details to send an invite.'
            okText='Send invite'
            cancelText='Cancel'
            width='566px'
            drawerHeight='450px'
            open={openModalInvitePractice}
            onClick={() => {
              formik.handleSubmit()
            }}
            onClose={() => {
              formik.resetForm()
              dispatchAction(setOpenModalInvitePractice(false))
              const queryParams = new URLSearchParams({
                invitation: 'true',
              }).toString()
              navigate(`/practices?${queryParams}`)
            }}
            HeaderIcon={
              <div className='w-16 h-16 rounded-full bg-tertiarySupport flex justify-center items-center'>
                <CheckedCircleOutlineIcon />
              </div>
            }
            showCrossButton={false}
            showFooter={true}
          >
            <div className='flex flex-col gap-3 my-4 '>
              <div>
                <FormikInput
                  name={'email'}
                  label={'Email'}
                  required={true}
                  className='py-3'
                  maxLength={100}
                />
              </div>
              <div className='flex gap-2 items-center my-3'>
                <InfoIcon width='20' height='20' color={getColorPalette().primaryColor} />
                <div className='text-sm text-primaryColor mt-[2px]'>
                  If changed, email will update for the practice once the invite is sent
                </div>
              </div>
            </div>
          </ModalCard>
        )
      }}
    </Formik>
  )
}

export default ModalInvitePractice
