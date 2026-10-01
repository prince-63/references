import CustomDrawer from 'components/drawer/CustomDrawer'
import {useContext, useState} from 'react'
import BroadCastSelectMessageContainer from './BroadCastSelectMessageContainer'
import {useFormik} from 'formik'
import * as Yup from 'yup'
import {FormValues, RowDataForBroadcastListPatients} from './broadCastTypes'
import ReviewAndSendMessageFooter from './ReviewAndSendMessageFooter'
import QuitEditingModal from 'components/quitEditingModal/QuitEditingModal'
import {Table} from '@tanstack/react-table'
import {AuthContext} from 'context/AuthContext'
import {getFirstLetterCapitalOfWord} from 'utils/ConstFunctions'
import userTypes from '@constants/userTypes'
import useDispatchAction from '@hooks/useDispatchAction'
import {postApiDataPatientNudge} from 'redux/Slices/AppSlice/Dashboard/PatientNudgeSlice'
import SuccessToast from 'components/modal/Alert/SuccessToast'
export const MAX_CHAR_COUNT = 500
export const REQUIRED_CUSTOM_ERROR_MESSAGE =
  'Please select a template or add a custom message to continue'

const validationSchema = Yup.object({
  customMessage: Yup.string()
    .transform((value) => value.replace(/\s/g, ''))
    .max(MAX_CHAR_COUNT, `Please enter a message in less than ${MAX_CHAR_COUNT} characters`)
    .test('nonEmpty', 'Input cannot be empty or consist only of spaces', (value) => {
      return !!value && value.trim().length > 0
    })
    .required(REQUIRED_CUSTOM_ERROR_MESSAGE),
})
const BroadCastSelectMessageDrawer = ({
  showAddMessageDrawer,
  toggleAddMessageDrawer,
  toggleSelectPatientDrawer,
  table,
}: {
  showAddMessageDrawer: boolean
  toggleAddMessageDrawer: (value: boolean) => void
  toggleSelectPatientDrawer: (value: boolean) => void
  table: Table<RowDataForBroadcastListPatients>
}) => {
  const {userId, userDetail}: any = useContext(AuthContext)
  const {dispatchAction} = useDispatchAction()
  const formik = useFormik<FormValues>({
    initialValues: {
      customMessage: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      const patientsList = table.getSelectedRowModel().rows.map((row) => {
        return {
          patient_id: row.original.patient_id,
          patient_name: row.original.patient_name,
        }
      })
      const postData = {
        data: {
          patients: patientsList,
          doctor_name: `${userDetail.first_name + ' ' + userDetail.last_name}`,
          doctor_id: userId,
          message: values.customMessage.trim(),
          role_name: getFirstLetterCapitalOfWord(userTypes.DOCTOR),
          created_by: `Dr ${userDetail.first_name + ' ' + userDetail.last_name}`,
        },
      }

      await dispatchAction(postApiDataPatientNudge(postData))
      toggleAddMessageDrawer(false)
      table.toggleAllRowsSelected(false)
      formik.resetForm()
      SuccessToast('Broadcast message sent!')
    },
  })
  const [cancelSaveModalVisible, setCancelSaveModalVisible] = useState(false)
  const handleDrawerCancel = () => {
    setCancelSaveModalVisible(true)
  }
  return (
    <div>
      <CustomDrawer
        {...{
          onClose: handleDrawerCancel,
          open: showAddMessageDrawer,
          title: 'Add message',
          subTitle: 'Choose from quick select or write your custom message.',
          destroyOnClose: true,
          footer: (
            <ReviewAndSendMessageFooter
              {...{formik, toggleSelectPatientDrawer, toggleAddMessageDrawer, table}}
            />
          ),
        }}
      >
        <BroadCastSelectMessageContainer {...{formik}} />
        <QuitEditingModal
          {...{
            visible: cancelSaveModalVisible,
            setQuitModalVisible: setCancelSaveModalVisible,
            onOkClick: () => {
              toggleAddMessageDrawer(false)
              table.toggleAllRowsSelected(false)
              formik.resetForm()
            },
          }}
        />
      </CustomDrawer>
    </div>
  )
}

export default BroadCastSelectMessageDrawer
