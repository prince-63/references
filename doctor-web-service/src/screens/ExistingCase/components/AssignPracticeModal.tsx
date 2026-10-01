import useDispatchAction from '@hooks/useDispatchAction'
import {Modal} from 'antd'
import AntdButton from 'components/atom/Buttons/AntdButton'
import {useDispatch, useSelector} from 'react-redux'
import {useNavigate, useParams} from 'react-router-dom'
import {setOpenAssignPracticeModal} from 'redux/Slices/AppSlice/ExistingCase/ExistingCase.slice'
import {assignPracticeToPatient} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfile.slice'
import {RootState} from 'redux/store'
import AssignPracticeForm from 'screens/Patients/LeadsProfile/leftPanel/AssignPracticeForm'
import {safeParseInt} from 'utils/ConstFunctions'
import {Formik, Form, FormikProps} from 'formik'
import * as Yup from 'yup'
import {useContext, useEffect} from 'react'
import {AuthContext} from 'context/AuthContext'
import {getActivePractices} from 'redux/Slices/AppSlice/Practices/practices.slice'
import {ManufacturingFormValues} from '../steps/ManufacturingStep'
interface AssignPracticeModalProps {
  formik: FormikProps<ManufacturingFormValues>
}

const AssignPracticeModal = ({formik}: AssignPracticeModalProps) => {
  const {openAssignPracticeModal} = useSelector((state: RootState) => state.existingCase)
  const dispatch = useDispatch()
  const {dispatchAction} = useDispatchAction()
  const {patientId} = useParams()
  const navigate = useNavigate()
  const {loadingManufacturing} = useSelector((state: RootState) => state.GettingStartedOverview)
  const {loadingAssigningPracticeToPatient} = useSelector((state: RootState) => state.leadsProfile)

  const {userId, organizationId, profileId} = useContext(AuthContext)

  const getActivePracticeList = async () => {
    if (userId && organizationId && profileId) {
      await dispatchAction(
        getActivePractices({
          data: {
            sort_order: 'PRACTICE_NAME_ASC',
            page_number: 0,
            page_size: 0,
            search: '',
            doctor_id: safeParseInt(userId),
            organization_id: safeParseInt(organizationId),
            invitation_status: 'ACCEPTED',
            invitation_roles: ['CONSULTING_ORTHODONTIST'],
          },
        })
      )
    }
  }

  const initialValues = {
    practice_profile_id: '',
  }

  const validationSchema = Yup.object().shape({
    practice_profile_id: Yup.string().required('Practice is required'),
  })

  useEffect(() => {
    if (openAssignPracticeModal) {
      getActivePracticeList()
    }
  }, [openAssignPracticeModal])

  return (
    <Modal
      destroyOnClose
      style={{fontFamily: 'figtree'}}
      closable={false}
      open={openAssignPracticeModal}
      title={
        <>
          <p className='font-semibold text-2xl text-center'>Assign Practice to submit Form</p>
          <p className='font-normal text-base leading-6 text-textColor text-center'>
            You're almost done. Assign this to a practice to confirm and submit
          </p>
        </>
      }
      width={500}
      centered
      footer={null}
    >
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={async (values) => {
          formik.handleSubmit()

          try {
            await dispatchAction(
              assignPracticeToPatient({
                patient_id: safeParseInt(patientId),
                practice_profile_id: safeParseInt(values.practice_profile_id),
              })
            )
              .unwrap()
              .then(() => {
                dispatch(setOpenAssignPracticeModal(false))
                navigate('/patients-list')
              })
          } catch (err) {
            console.error('Practice assignment failed', err)
          }
        }}
      >
        {() => (
          <Form className='flex flex-col gap-4'>
            <AssignPracticeForm />

            <div className='flex justify-between gap-2'>
              <button
                className='w-full rounded-lg h-10 px-5 text-textColor border border-mediumGray justify-start'
                type='button'
                onClick={() => dispatch(setOpenAssignPracticeModal(false))}
              >
                Cancel
              </button>
              <AntdButton
                key='confirm'
                text='Confirm'
                htmlType='submit'
                className='h-10 w-full bg-primaryColor text-center'
                loading={loadingManufacturing || loadingAssigningPracticeToPatient}
              />
            </div>
          </Form>
        )}
      </Formik>
    </Modal>
  )
}

export default AssignPracticeModal
