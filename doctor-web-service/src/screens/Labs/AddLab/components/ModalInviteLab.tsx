import * as Yup from 'yup'
import {Formik} from 'formik'
import {useContext} from 'react'
import SuccessToast from 'components/modal/Alert/SuccessToast'
import {addOrEditLabs, setOpenModalInviteLab} from 'redux/Slices/AppSlice/Labs/labs.slice'
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

const ModalInviteLab = () => {
  const navigate = useNavigate()
  const {openModalInviteLab} = useSelector((state: RootState) => state.labs)
  const {userId, organizationId, profileId} = useContext(AuthContext)
  const {dispatchAction} = useDispatchAction()
  const {dataAddingEditLab} = useSelector((state: RootState) => state.labs)

  const initialValues = {
    email: dataAddingEditLab.email?.toLocaleLowerCase(),
  }

  const handleSubmit = async (
    values: {email: string},
    {setFieldError}: {setFieldError: (field: string, message: string) => void}
  ) => {
    try {
      await dispatchAction(
        addOrEditLabs({
          organization_id: safeParseInt(organizationId),
          profile_id: safeParseInt(profileId),
          doctor_id: safeParseInt(userId),
          email: values.email?.toLocaleLowerCase(),
          first_name: dataAddingEditLab.first_name,
          last_name: dataAddingEditLab.last_name,
          mobile_no: dataAddingEditLab.mobile_no,
          country_code: dataAddingEditLab.country_code,
          salutation: dataAddingEditLab.salutation,
          doctor_role: rolesConstants.VENDOR,
          invitation_id: dataAddingEditLab.invitation_id,
          is_invitation_send: true,
        })
      )
        .unwrap()
        .then(() => {
          dispatchAction(setOpenModalInviteLab(false))
          SuccessToast('Invite sent successfully!')
          const queryParams = new URLSearchParams({
            invitation: 'true',
          }).toString()
          navigate(`/labs?${queryParams}`)
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
            title='Invite lab'
            subTitle='Confirm lab’s contact details to send an invite.'
            okText='Send invite'
            cancelText='Cancel'
            width='566px'
            drawerHeight='450px'
            open={openModalInviteLab}
            onClick={() => {
              formik.handleSubmit()
            }}
            onClose={() => {
              formik.resetForm()
              dispatchAction(setOpenModalInviteLab(false))
              const queryParams = new URLSearchParams({
                invitation: 'true',
              }).toString()
              navigate(`/labs?${queryParams}`)
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
                  If changed, email will update for the lab once the invite is sent
                </div>
              </div>
            </div>
          </ModalCard>
        )
      }}
    </Formik>
  )
}

export default ModalInviteLab
