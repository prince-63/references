import {Modal} from 'antd'
import {useContext, useState} from 'react'
import {Formik, FormikProps} from 'formik'
import QuitEditingModal from 'components/quitEditingModal/QuitEditingModal'
import AntdButton from 'components/atom/Buttons/AntdButton'
import CustomDrawer from 'components/drawer/CustomDrawer'
import {useMediaQuery} from 'react-responsive'
import {EditLabelFormType} from '../types/dashboard.types'
import EditLabelsForm from './EditLabelsForm'
import useDashboard from '@hooks/useDashboard'
import * as Yup from 'yup'
import useDispatchAction from '@hooks/useDispatchAction'
import {DashboardLabelEdit} from 'redux/Slices/AppSlice/Dashboard/DashboardUpdatesSlice'
import {RootState} from 'redux/store'
import {useSelector} from 'react-redux'
import {getDashboardNewDetails} from 'redux/Slices/AppSlice/DoctorDashboard/DoctorDashboardSlice'
import {safeParseInt} from 'utils/ConstFunctions'
import useActiveProfile from '@hooks/useActiveProfile'
import {AuthContext} from 'context/AuthContext'
import SuccessToast from 'components/modal/Alert/SuccessToast'
import useAllUserRoles from '@hooks/useAllUserPlan'

export const schema = (isEnterprisePlanUser: boolean) =>
  Yup.object().shape({
    home: Yup.string().nullable(),
    workspace: Yup.string().required('Workspace is required'),
    customer_view: Yup.string().required('Customer view is required'),
    lab_view: isEnterprisePlanUser
      ? Yup.string().required('Lab view is required')
      : Yup.string().notRequired(),
  })

const EditLabelsModal = ({
  toggleModal,
  isModalVisible,
}: {
  isModalVisible: boolean
  toggleModal: (value: boolean) => void
}) => {
  const [cancelSaveModalVisible, setCancelSaveModalVisible] = useState(false)
  const {dispatchAction} = useDispatchAction()
  const {loadingLabelUpdate} = useSelector((state: RootState) => state.apiDashboardUpdates)
  const {userId} = useContext(AuthContext)
  const {activeProfile} = useActiveProfile()
  const {isEnterprisePlanUser} = useAllUserRoles()
  const {subscriptionData} = useSelector((state: RootState) => state.subscription)

  const handleClose = (formik: FormikProps<EditLabelFormType>) => {
    if (formik.dirty) {
      setCancelSaveModalVisible(true)
    } else {
      toggleModal(false)
      formik.resetForm()
    }
  }
  const isMobile = useMediaQuery({query: '(max-width: 768px)'})
  const {label_name} = useDashboard()

  return (
    <Formik
      initialValues={{
        home: 'Home',
        workspace: label_name?.workspace || 'Workspace',
        customer_view: label_name?.customer_view || 'Customer view',
        lab_view: label_name?.label_view || 'Lab view',
      }}
      enableReinitialize
      validationSchema={schema(isEnterprisePlanUser)}
      validateOnBlur={false}
      onSubmit={async (values) => {
        await dispatchAction(
          DashboardLabelEdit({
            home: values.home,
            workspace: values.workspace,
            customer_view: values.customer_view,
            lab_view: values.lab_view,
          })
        )
          .unwrap()
          .then(() => {
            SuccessToast('Rename successful!')
            dispatchAction(
              getDashboardNewDetails({
                doctor_id: safeParseInt(userId),
                roles: (activeProfile?.roles ?? []).map((role) => role.name),
                plan_name: subscriptionData?.plan_metadata?.plan_name,
              })
            )
            toggleModal(false)
          })
      }}
    >
      {(formik) => (
        <div>
          <Modal
            destroyOnClose={true}
            closeIcon={null}
            style={{fontFamily: 'figtree'}}
            styles={{
              content: {
                padding: '0',
              },
              footer: {
                paddingLeft: '20px',
                paddingRight: '20px',
                paddingTop: '10px',
                paddingBottom: '20px',
              },
            }}
            open={!isMobile ? isModalVisible : false}
            title={
              <div className='p-5'>
                <p className='font-semibold text-2xl'>Edit labels</p>
                <p className='text-textColor font-normal text-base'>
                  Add names according to the tabs as per your preferences.{' '}
                </p>
              </div>
            }
            width={500}
            footer={
              <div className='flex justify-between gap-2'>
                <button
                  className='w-full rounded-lg h-10 px-5 text-textColor border border-mediumGray justify-start'
                  type='button'
                  onClick={() => {
                    setCancelSaveModalVisible(true)
                  }}
                  disabled={loadingLabelUpdate}
                >
                  Cancel
                </button>
                <AntdButton
                  key='submit'
                  text={'Save'}
                  htmlType='submit'
                  className='h-11 w-full bg-primaryColor text-center'
                  loading={loadingLabelUpdate}
                  disabled={loadingLabelUpdate}
                  onClick={() => formik.handleSubmit()}
                />
              </div>
            }
            onCancel={() => handleClose(formik)}
          >
            <EditLabelsForm />
          </Modal>
          <QuitEditingModal
            {...{
              visible: cancelSaveModalVisible,
              setQuitModalVisible: setCancelSaveModalVisible,
              onOkClick: () => {
                toggleModal(false)
                formik.resetForm()
              },
            }}
          />
          <CustomDrawer
            destroyOnClose={true}
            onClose={() => {
              handleClose(formik)
            }}
            style={{fontFamily: 'figtree'}}
            styles={{
              body: {
                padding: '0px',
              },
              content: {
                borderTopLeftRadius: '12px',
                borderTopRightRadius: '12px',
              },
              wrapper: {
                borderTopLeftRadius: '12px',
                borderTopRightRadius: '12px',
              },
              footer: {
                paddingLeft: '20px',
                paddingRight: '20px',
                paddingTop: '10px',
                paddingBottom: '20px',
              },
            }}
            placement='bottom'
            open={isMobile ? isModalVisible : false}
            height={'80%'}
            title={'Edit labels'}
            width={'full'}
            footer={
              <div className='flex justify-between gap-2'>
                <button
                  className='w-full rounded-lg h-10 px-5 text-textColor border border-mediumGray justify-start'
                  type='button'
                  onClick={() => {
                    setCancelSaveModalVisible(true)
                  }}
                  disabled={loadingLabelUpdate}
                >
                  Cancel
                </button>
                <AntdButton
                  key='submit'
                  text={'Save'}
                  htmlType='submit'
                  className='h-11 w-full bg-primaryColor text-center'
                  loading={loadingLabelUpdate}
                  disabled={loadingLabelUpdate}
                  onClick={() => formik.handleSubmit()}
                />
              </div>
            }
          >
            <EditLabelsForm />
          </CustomDrawer>
        </div>
      )}
    </Formik>
  )
}

export default EditLabelsModal
