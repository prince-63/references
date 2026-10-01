import * as Yup from 'yup'
import {Formik} from 'formik'
import {useContext} from 'react'
import SuccessToast from 'components/modal/Alert/SuccessToast'
import {
  addOrEditCustomers,
  setOpenModalInviteCustomer,
} from 'redux/Slices/AppSlice/Customers/customers.slice'
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

const ModalInviteCustomer = () => {
  const navigate = useNavigate()
  const {openModalInviteCustomer} = useSelector((state: RootState) => state.customers)
  const {userId, organizationId, profileId} = useContext(AuthContext)
  const {dispatchAction} = useDispatchAction()
  const {dataAddingEditCustomer} = useSelector((state: RootState) => state.customers)

  const initialValues = {
    email: dataAddingEditCustomer.email?.toLocaleLowerCase(),
  }

  const handleSubmit = async (
    values: {email: string},
    {setFieldError}: {setFieldError: (field: string, message: string) => void}
  ) => {
    try {
      await dispatchAction(
        addOrEditCustomers({
          organization_id: safeParseInt(organizationId),
          profile_id: safeParseInt(profileId),
          doctor_id: safeParseInt(userId),
          email: values.email?.toLocaleLowerCase(),
          first_name: dataAddingEditCustomer.first_name,
          last_name: dataAddingEditCustomer.last_name,
          mobile_no: dataAddingEditCustomer.mobile_no,
          country_code: dataAddingEditCustomer.country_code,
          salutation: dataAddingEditCustomer.salutation,
          doctor_role: rolesConstants.CONSULTING_ORTHODONTIST,
          invitation_id: dataAddingEditCustomer.invitation_id,
          is_invitation_send: true,
          is_tracking_enabled: true,
          is_stl_file_view_enabled: true,
          is_print_file_view_enabled: false,
          is_scan_file_view_enabled: false,
        })
      )
        .unwrap()
        .then(() => {
          dispatchAction(setOpenModalInviteCustomer(false))
          SuccessToast('Invite sent successfully!')
          const queryParams = new URLSearchParams({
            invitation: 'true',
          }).toString()
          navigate(`/customers?${queryParams}`)
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
            title='Invite customer'
            subTitle='Confirm customer’s contact details to send an invite.'
            okText='Send invite'
            cancelText='Cancel'
            width='566px'
            drawerHeight='450px'
            open={openModalInviteCustomer}
            onClick={() => {
              formik.handleSubmit()
            }}
            onClose={() => {
              formik.resetForm()
              dispatchAction(setOpenModalInviteCustomer(false))
              const queryParams = new URLSearchParams({
                invitation: 'true',
              }).toString()
              navigate(`/customers?${queryParams}`)
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
                  If changed, email will update for the customer once the invite is sent
                </div>
              </div>
            </div>
          </ModalCard>
        )
      }}
    </Formik>
  )
}

export default ModalInviteCustomer
